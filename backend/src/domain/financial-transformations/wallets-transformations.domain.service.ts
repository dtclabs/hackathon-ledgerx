import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { formatUnits } from 'ethers/lib/utils'
import { groupBy, sortBy } from 'lodash'
import { setTimeout } from 'timers/promises'
import { CryptocurrencyResponseDto } from '../../cryptocurrencies/interfaces'
import { PricesService } from '../../prices/prices.service'
import { BlockchainsEntityService } from '../../shared/entity-services/blockchains/blockchains.entity-service'
import { CryptocurrenciesEntityService } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { CryptocurrencyType } from '../../shared/entity-services/cryptocurrencies/interfaces'
import { FiatCurrency } from '../../shared/entity-services/fiat-currencies/fiat-currency.entity'
import { OrganizationSettingsEntityService } from '../../shared/entity-services/organization-settings/organization-settings.entity-service'
import { PaymentsEntityService } from '../../shared/entity-services/payments/payments.entity-service'
import { PayoutsEntityService } from '../../shared/entity-services/payouts/payouts.entity-service'
import {
  PendingTransaction,
  TransactionRecipient
} from '../../shared/entity-services/pending-transactions/pending-transaction.entity'
import { PendingTransactionsEntityService } from '../../shared/entity-services/pending-transactions/pending-transactions.entity-service'
import { SourceType, TokenBalance, WalletBalancePerBlockchain } from '../../shared/entity-services/wallets/interfaces'
import { Wallet } from '../../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { isEthereumBlockchain, isSolanaBlockchain } from '../../shared/utils/utils'
import { BlockExplorerAdapterFactory } from '../block-explorers/block-explorer.adapter.factory'
import { BlockExplorersProviderEnum } from '../block-explorers/block-explorers-provider.enum'
import { GnosisProviderService } from '../block-explorers/gnosis/gnosis-provider.service'
import {
  EGnosisSafeMethod,
  GnosisMultisigTransaction,
  GnosisRecipient,
  GnosisValueDecoded
} from '../block-explorers/gnosis/interfaces'
import { AddressBalance } from '../block-explorers/types/balance'
import { Cryptocurrency } from '../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { PendingTransactionType } from '../../shared/entity-services/pending-transactions/interfaces'
import { NotImplementedError } from '../../shared/errors/not-implemented.error'

@Injectable()
export class WalletsTransformationsDomainService {
  constructor(
    private readonly walletsService: WalletsEntityService,
    private readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory,
    private readonly cryptocurrenciesService: CryptocurrenciesEntityService,
    private readonly gnosisProviderService: GnosisProviderService,
    private readonly blockchainsService: BlockchainsEntityService,
    private readonly pricesService: PricesService,
    private readonly pendingTransactionsService: PendingTransactionsEntityService,
    private readonly organizationSettingsService: OrganizationSettingsEntityService,
    private readonly payoutsEntityService: PayoutsEntityService,
    private readonly paymentsEntityService: PaymentsEntityService,
    private readonly logger: LoggerService
  ) {}

  getAllByOrganizationId(organizationId: string) {
    return this.walletsService.find({ where: { organization: { id: organizationId } } })
  }

  getAllByWalletGroupId(walletGroupId: string) {
    return this.walletsService.find({ where: { walletGroup: { id: walletGroupId } } })
  }

  async syncBalanceFromChainForOrganization(organizationId: string) {
    const wallets = await this.getAllByOrganizationId(organizationId)
    for (const wallet of wallets) {
      for (const blockchainId of wallet.supportedBlockchains) {
        await this.syncBalanceFromChain(wallet.id, blockchainId)
      }
      // Etherscan has a rate limit of 5 requests per second
      await setTimeout(1000)
    }
  }

  async syncBalanceFromChainForWalletGroup(walletGroupId: string, blockchainId: string) {
    const wallets = await this.getAllByWalletGroupId(walletGroupId)
    for (const wallet of wallets) {
      await this.syncBalanceFromChain(wallet.id, blockchainId)
      // Etherscan has a rate limit of 5 requests per second
      await setTimeout(1000)
    }
  }

  async syncBalance(walletId: string) {
    const enabledBlockchainIds = await this.blockchainsService.getEnabledBlockchainPublicIds()
    for (const blockchainId of enabledBlockchainIds) {
      await this.syncBalanceFromChain(walletId, blockchainId)
    }
  }

  async syncBalanceFromChain(walletId: string, blockchainId: string) {
    const wallet = await this.walletsService.get(walletId, {
      relations: {
        organization: {
          setting: {
            fiatCurrency: true
          }
        }
      }
    })
    const fiatCurrency = wallet.organization.setting.fiatCurrency
    if (!wallet) {
      throw new Error('Wallet not found')
    }

    await this.syncEvmBalance(wallet, fiatCurrency, blockchainId)
  }

  private async syncGnosisBalance(wallet: Wallet, fiatCurrency: FiatCurrency, blockchainId: string) {
    if (wallet.sourceType !== SourceType.GNOSIS) {
      throw new Error('Wallet is not a Gnosis wallet')
    }
    if (!blockchainId) {
      throw new Error('Wallet blockchainId is missing')
    }

    const gnosisBalance = await this.gnosisProviderService.getBalance({
      address: wallet.address,
      blockchainId: blockchainId
    })

    const walletBalancesPerChain = await this.getWalletBalancePerChain(gnosisBalance, blockchainId, fiatCurrency)

    await this.walletsService.updateBalance(wallet.id, { [blockchainId]: walletBalancesPerChain })
  }

  private async syncEvmBalance(wallet: Wallet, fiatCurrency: FiatCurrency, blockchainId: string) {
    const walletBalanceForChains: WalletBalancePerBlockchain = wallet.balance?.blockchains || {}

    const isEnabled = await this.blockchainsService.isEnabled(blockchainId)
    const canSync = isEnabled && wallet.supportedBlockchains.includes(blockchainId)
    if (!canSync) {
      return
    }

    try {
      this.logger.debug(`Syncing ETH balance for wallet ${wallet.address} on chain ${blockchainId}`)
      const balance = await this.getBlockchainBalance(blockchainId, wallet)

      walletBalanceForChains[blockchainId] = await this.getWalletBalancePerChain(balance, blockchainId, fiatCurrency)
    } catch (error) {
      this.logger.error(`Error syncing ETH balance for wallet ${wallet.address} on chain ${blockchainId}`, error, {
        walletId: wallet.id,
        fiatCurrencyId: fiatCurrency.id
      })
    }
    await this.walletsService.updateBalance(wallet.id, walletBalanceForChains)
  }

  private async getBlockchainBalance(blockchainId: string, wallet: Wallet): Promise<AddressBalance[]> {
    if (isEthereumBlockchain(blockchainId)) {
      const adapter = this.blockExplorerAdapterFactory.getBlockExplorerAdapter(
        BlockExplorersProviderEnum.ALCHEMY,
        blockchainId
      )
      return await adapter.getBalance(wallet.address)
    } else if (isSolanaBlockchain(blockchainId)) {
      const adapter = this.blockExplorerAdapterFactory.getBlockExplorerAdapter(
        BlockExplorersProviderEnum.SOLANA_RPC,
        blockchainId
      )
      return await adapter.getBalance(wallet.address)
    } else {
      const cryptocurrenciesId = wallet.ownedCryptocurrencies[blockchainId] ?? []
      if (!cryptocurrenciesId.length) {
        return []
      }
      const cryptocurrencies = await this.cryptocurrenciesService.getAllByIds(cryptocurrenciesId, { addresses: true })

      const etherscanAdapter = this.blockExplorerAdapterFactory.getEtherscanAdapter(blockchainId)

      const addressBalance: AddressBalance[] = []

      for (const cryptocurrency of cryptocurrencies) {
        const cryptocurrencyAddress = cryptocurrency.addresses.find((a) => a.blockchainId === blockchainId)
        if (!cryptocurrencyAddress) {
          continue
        }
        let tokenBalance = '0'
        if (cryptocurrencyAddress.address) {
          tokenBalance = await etherscanAdapter.getTokensBalance(wallet.address, cryptocurrencyAddress.address)
        } else if (cryptocurrencyAddress.type === CryptocurrencyType.COIN) {
          tokenBalance = await etherscanAdapter.getNativeBalance(wallet.address)
        } else {
          this.logger.error(`No address found for ${cryptocurrency.id} on blockchain ${blockchainId}`, {
            walletId: wallet.id,
            cryptocurrencyId: cryptocurrency.id
          })
          continue
        }

        addressBalance.push({
          balance: tokenBalance,
          tokenAddress: cryptocurrencyAddress.address?.toString() ?? null
        })
      }
      return addressBalance
    }
  }

  private async getWalletBalancePerChain(
    totalBalances: AddressBalance[],
    blockchainId: string,
    fiatCurrency: FiatCurrency
  ): Promise<TokenBalance[]> {
    const tokenAddresses = totalBalances.map((token) => token.tokenAddress)
    const cryptocurrencies = await this.cryptocurrenciesService.getAllByAddresses(tokenAddresses, blockchainId)

    const tokenBalances: TokenBalance[] = []

    for (const address of tokenAddresses) {
      const crypto = cryptocurrencies.find((crypto) => crypto.addresses.find((a) => a.address === address))
      if (!crypto) {
        // We create currency only during preprocess. Ignoring tokens which we haven't created before
        continue
      }
      const tokenBalance = totalBalances.find((token) => token.tokenAddress === address)

      // We need to do below because the balance is in wei, and we need to convert it to the decimal of the token
      const decimal = crypto.addresses?.find((address) => address.blockchainId === blockchainId)?.decimal
      const formattedAmount = new Decimal(formatUnits(tokenBalance.balance, decimal))
      const fiatPricePerUnit = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
        crypto,
        fiatCurrency.alphabeticCode
      )
      const fiatValue = fiatPricePerUnit.mul(formattedAmount)

      const finalTokenBalance: TokenBalance = {
        cryptocurrency: CryptocurrencyResponseDto.map(crypto),
        cryptocurrencyAmount: formattedAmount.toString(),
        fiatCurrency: fiatCurrency.alphabeticCode,
        fiatAmount: fiatValue.toString()
      }

      tokenBalances.push(finalTokenBalance)
    }

    return tokenBalances
  }

  async syncPendingTransactions(walletId: string) {
    const wallet = await this.walletsService.get(walletId, {
      relations: {
        organization: true
      }
    })
    if (wallet?.sourceType !== SourceType.GNOSIS) {
      return
    }
    const organizationSetting = await this.organizationSettingsService.getByOrganizationId(wallet.organization.id, {
      fiatCurrency: true
    })

    const syncPendingTransactionsPerChainPromises = wallet.supportedBlockchains.map((blockchainId) => {
      return this.syncPendingTransactionsPerChain(wallet, blockchainId, organizationSetting.fiatCurrency.alphabeticCode)
    })
    await Promise.all(syncPendingTransactionsPerChainPromises)
  }

  private async syncPendingTransactionsPerChain(
    wallet: Wallet,
    blockchainId: string,
    fiatCurrencyAlphabeticCode: string
  ) {
    try {
      const currentNonce = await this.gnosisProviderService.getCurrentNonce({
        address: wallet.address,
        blockchainId: blockchainId
      })

      const gnosisTransactions = await this.gnosisProviderService.getPendingMultisigTransactions({
        address: wallet.address,
        blockchainId: blockchainId,
        nonce: currentNonce
      })

      // getting latest transactions for each nonce
      const filteredTransactions = this.getFilteredTransactions(gnosisTransactions)

      for (const gnosisTx of filteredTransactions) {
        try {
          let gnosisRecipients: GnosisRecipient[] = []
          let transactionType = this.getGnosisTransactionType(gnosisTx)
          let error: string | null = null
          try {
            gnosisRecipients = this.decodeTokenAddressAndRecipientsFrom(gnosisTx, transactionType)
          } catch (e) {
            if (!(e instanceof NotImplementedError)) {
              this.logger.error(`Cannot decode gnosis transaction`, e, {
                organizationId: wallet.organization.id,
                walletId: wallet.id,
                safeGnosisTxHash: gnosisTx.safeTxHash,
                transactionType
              })
            }
            error = e.message
            transactionType = PendingTransactionType.UNKNOWN
          }

          const payments = await this.paymentsEntityService.findBySafeHash(gnosisTx.safeTxHash, wallet.organization.id)
          const remarks = payments?.[0]?.remarks

          const coin = await this.cryptocurrenciesService.getCoinByBlockchain(blockchainId)
          const cryptocurrencies = await this.cryptocurrenciesService.getAllByAddresses(
            gnosisRecipients.map((r) => r.tokenAddress),
            blockchainId
          )
          const recipients: TransactionRecipient[] = []

          for (const recipient of gnosisRecipients) {
            let cryptocurrency: Cryptocurrency
            // if that is a native transfer in Gnosis Safe, tokenAddress will be always null,
            // but some of cryptocurrencies have addresses in our db, for example, MATIC on Polygon blockchain
            if (recipient.tokenAddress) {
              cryptocurrency = cryptocurrencies.find((crypto) =>
                crypto.addresses.find((a) => a.address === recipient.tokenAddress && a.blockchainId === blockchainId)
              )
            } else {
              cryptocurrency = coin
            }

            if (!cryptocurrency) {
              break
            }

            const decimal = cryptocurrency.addresses?.find((address) => address.blockchainId === blockchainId)?.decimal
            const formattedAmount = new Decimal(formatUnits(recipient.amount, decimal))

            const fiatPricePerUnit = await this.pricesService.getCurrentFiatPriceByCryptocurrency(
              cryptocurrency,
              fiatCurrencyAlphabeticCode
            )
            const fiatValue = fiatPricePerUnit.mul(formattedAmount)

            const index = payments.findIndex(
              (payment) =>
                payment.destinationAddress === recipient.address.toLowerCase() &&
                new Decimal(payment.sourceAmount).equals(formattedAmount) &&
                payment.sourceCryptocurrency.id === cryptocurrency.id
            )
            const payment = index >= 0 ? payments.splice(index, 1)[0] : undefined

            recipients.push({
              address: recipient.address.toLowerCase(),
              amount: formattedAmount.toString(),
              cryptocurrencyId: cryptocurrency?.id ?? null,
              tokenAddress: recipient.tokenAddress,
              fiatCurrency: fiatCurrencyAlphabeticCode,
              fiatAmountPerUnit: fiatPricePerUnit.toString(),
              fiatAmount: fiatValue.toString(),
              chartOfAccountId: payment?.chartOfAccountId,
              annotationPublicIds: payment?.annotationPublicIds,
              notes: payment?.notes,
              files: payment?.files?.map((filename) => {
                return {
                  filename: filename,
                  path: `/api/${payment.organization.publicId}/payments/${payment.publicId}/files/${filename}`
                }
              })
            })
          }

          const pendingTx = PendingTransaction.from({
            gnosisTx: gnosisTx,
            wallet: wallet,
            recipients: recipients,
            notes: remarks,
            type: transactionType,
            error,
            blockchainId
          })

          const result = await this.pendingTransactionsService.upsert(pendingTx)
          for (const updatedRow of result.generatedMaps) {
            // Hack. Upsert do not restore deleted rows
            if (updatedRow.deletedAt) {
              await this.pendingTransactionsService.restore(updatedRow.id)
            }
          }
        } catch (e) {
          this.logger.error(`Cannot decode gnosis transaction ${gnosisTx.safeTxHash}`, e)
        }
      }

      const existingPendingTransactions = await this.pendingTransactionsService.getAllByWalletId({
        address: wallet.address,
        organizationId: wallet.organization.id
      })

      const shouldDeleteTxs = existingPendingTransactions.filter((tx) => {
        return !filteredTransactions.find((gnosisTx) => gnosisTx.safeTxHash === tx.safeHash)
      })

      for (const tx of shouldDeleteTxs) {
        await this.pendingTransactionsService.softDelete(tx.id)
      }
    } catch (e) {
      this.logger.error(`Cannot sync pending transactions for wallet on chain ${blockchainId}`, e, {
        blockchainId: blockchainId,
        fiatCurrencyAlphabeticCode: fiatCurrencyAlphabeticCode,
        walletId: wallet.id,
        organizationId: wallet.organization.id
      })
    }
  }

  private getFilteredTransactions(gnosisTransactions: GnosisMultisigTransaction[]) {
    const groupedByNonce = groupBy(gnosisTransactions, 'nonce')
    // We need to get the latest transaction for each nonce based on submissionDate
    return Object.values(groupedByNonce).map((txs) => {
      const sorted = sortBy(txs, 'submissionDate')
      return sorted[sorted.length - 1]
    })
  }

  getGnosisTransactionType(gnosisTx: GnosisValueDecoded): PendingTransactionType {
    if (gnosisTx.dataDecoded?.method === EGnosisSafeMethod.MULTISEND) {
      return PendingTransactionType.MULTI_SEND
    } else if (gnosisTx.dataDecoded?.method === EGnosisSafeMethod.TRANSFER) {
      return PendingTransactionType.TOKEN_TRANSFER
    } else if (this.gnosisProviderService.isOnChainRejection(gnosisTx)) {
      return PendingTransactionType.REJECTION
    } else if (this.gnosisProviderService.isNativeTransfer(gnosisTx)) {
      return PendingTransactionType.NATIVE_TRANSFER
    }
    return PendingTransactionType.UNKNOWN
  }

  decodeTokenAddressAndRecipientsFrom(
    valueDecoded: GnosisValueDecoded,
    type: PendingTransactionType
  ): GnosisRecipient[] {
    const recipients: GnosisRecipient[] = []
    if (type === PendingTransactionType.TOKEN_TRANSFER) {
      const dataDecoded = valueDecoded.dataDecoded
      if (dataDecoded.parameters[0].value) {
        recipients.push({
          address: dataDecoded.parameters[0].value.toLowerCase(),
          amount: dataDecoded.parameters[1].value,
          tokenAddress: valueDecoded.to.toLowerCase()
        })
      }
    } else if (type === PendingTransactionType.NATIVE_TRANSFER) {
      recipients.push({
        address: valueDecoded.to.toLowerCase(),
        amount: valueDecoded.value,
        tokenAddress: null
      })
    } else if (type === PendingTransactionType.REJECTION) {
      //   This is on-chain rejection of a transaction
    } else if (type === PendingTransactionType.MULTI_SEND) {
      for (const parameter of valueDecoded.dataDecoded.parameters) {
        if (parameter.valueDecoded) {
          for (const value of parameter.valueDecoded) {
            const type = this.getGnosisTransactionType(value)
            recipients.push(...this.decodeTokenAddressAndRecipientsFrom(value, type))
          }
        }
      }
    } else if (type === PendingTransactionType.UNKNOWN) {
      throw new NotImplementedError(`Unsupported transaction type ${type}`)
    }
    return recipients
  }
}
