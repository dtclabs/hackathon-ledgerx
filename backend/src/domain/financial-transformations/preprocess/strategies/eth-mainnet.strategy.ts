import { Log } from '@ethersproject/abstract-provider'
import { Injectable } from '@nestjs/common'
import { AssetTransfersWithMetadataResult } from 'alchemy-sdk'
import Decimal from 'decimal.js'
import { BigNumber } from 'ethers'
import { hexToNumber, hexToNumberString, toBN } from 'web3-utils'
import { TaskStatusEnum } from '../../../../core/events/event-types'
import { ContractConfiguration } from '../../../../shared/entity-services/contract-configurations/contract-configuration.entity'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { ContractConfigurationPlaceholderEnum } from '../../../../shared/entity-services/contract-configurations/interfaces'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { Cryptocurrency } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { EvmLog } from '../../../../shared/entity-services/evm-logs/evm-log.entity'
import { FeatureFlagsEntityService } from '../../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { FinancialTransactionsEntityService } from '../../../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  CreateFinancialTransactionPreprocessDto,
  FinancialTransactionPreprocessSpecialAccount,
  FinancialTransactionPreprocessStatus
} from '../../../../shared/entity-services/financial-transactions/interfaces'
import { IngestionWorkflowsEntityService } from '../../../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { PreprocessRawTask } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-task.entity'
import { PreprocessRawTasksEntityService } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import {
  RawTransactionTaskStatusEnum,
  TransactionStatus
} from '../../../../shared/entity-services/raw-transactions/interfaces'
import { RawTransaction } from '../../../../shared/entity-services/raw-transactions/raw-transaction.entity'
import { RawTransactionEntityService } from '../../../../shared/entity-services/raw-transactions/raw-transaction.entity-service'
import { WalletContractConfigurationLog } from '../../../../shared/entity-services/wallet-contract-configuration-logs/wallet-contract-configuration-log.entity'
import { WalletContractConfigurationLogsEntityService } from '../../../../shared/entity-services/wallet-contract-configuration-logs/wallet-contract-configuration-logs.entity.service'
import { currencyHelper } from '../../../../shared/helpers/currency.helper'
import { dateHelper } from '../../../../shared/helpers/date.helper'
import { decimalHelper } from '../../../../shared/helpers/decimal.helper'
import { web3Helper } from '../../../../shared/helpers/web3.helper'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { CreateOrMigratePreprocessCommand } from '../commands/create-or-migrate-preprocess.command'
import { PreprocessStrategy } from './interfaces'

@Injectable()
export class EthMainnetStrategy implements PreprocessStrategy {
  readonly BATCH_SIZE: number = 500

  //TODO: see https://app.clickup.com/t/865ce74fd
  readonly NATIVE_TYPE_ORDER = 0
  readonly INTERNAL_TYPE_ORDER = 1
  readonly ERC20_LOG_TYPE_ORDER = 2
  readonly FEE_TYPE_ORDER = 3

  constructor(
    private preprocessRawTasksService: PreprocessRawTasksEntityService,
    private ingestionTaskService: IngestionWorkflowsEntityService,
    private rawTransactionService: RawTransactionEntityService,
    private financialTransactionsService: FinancialTransactionsEntityService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private contractConfigurationsEntityService: ContractConfigurationsEntityService,
    private featureFlagsEntityService: FeatureFlagsEntityService,
    private logger: LoggerService,
    private readonly walletContractConfigurationLogsEntityService: WalletContractConfigurationLogsEntityService,
    private readonly createOrMigratePreprocessCommand: CreateOrMigratePreprocessCommand
  ) {}

  async execute(task: PreprocessRawTask) {
    await this.preprocessRawTasksService.updateFirstExecutedAt(task)

    let skip = 0
    let rawTransactions: RawTransaction[] = []
    const startingId = task.metadata.lastCompletedRawTransactionId

    do {
      rawTransactions = await this.rawTransactionService.getTransactionsByAddressAndBlockchainAndStatus({
        address: task.address,
        blockchainId: task.blockchainId,
        status: RawTransactionTaskStatusEnum.COMPLETED,
        startingId: startingId,
        skip: skip,
        take: this.BATCH_SIZE
      })

      let nonProcessedEvmLogs: WalletContractConfigurationLog[] = []
      const txHashes = rawTransactions.map((tx) => tx.hash)
      nonProcessedEvmLogs = await this.walletContractConfigurationLogsEntityService.getNonProcessedForAddress(
        task.address,
        txHashes
      )

      if (rawTransactions?.length) {
        for (const rawTransaction of rawTransactions) {
          const walletContractConfigurationLogs = nonProcessedEvmLogs.filter(
            (log) => log.evmLog.transactionHash === rawTransaction.hash
          )
          const preprocessDtos = await this.createFinancialTransactionPreprocessDtos(
            rawTransaction,
            walletContractConfigurationLogs
          )
          await this.createOrMigrateFinancialTransactionPreprocess(rawTransaction.hash, preprocessDtos)
          await this.preprocessRawTasksService.updateLastExecutedAt(task.id)
          await this.markEvmLogsAsProcessed(walletContractConfigurationLogs)
        }
        await this.preprocessRawTasksService.updateMetadata(task.id, {
          ...task.metadata,
          lastCompletedRawTransactionId: rawTransactions.at(-1).id
        })
      }

      skip += this.BATCH_SIZE
    } while (rawTransactions.length === this.BATCH_SIZE)

    await this.createPreprocessFromEvmLogs({
      address: task.address,
      blockchainId: task.blockchainId
    })

    await this.preprocessRawTasksService.changeStatus(task.id, TaskStatusEnum.COMPLETED)
  }

  async createFinancialTransactionPreprocessDtos(
    rawTransaction: RawTransaction,
    walletContractConfigurationLogs: WalletContractConfigurationLog[]
  ) {
    let preprocessDtos: CreateFinancialTransactionPreprocessDto[] = []

    // Only when the status of the transaction in the chain is success
    if (rawTransaction.transactionStatus === TransactionStatus.SUCCESS) {
      // Below might not work for multi chain
      const ethereumEntries: AssetTransfersWithMetadataResult[] = []
        .concat(rawTransaction.from, rawTransaction.to)
        .filter((entry) => !!entry && entry.value !== 0 && entry.category === 'external')
      const initiatorAddress = rawTransaction.receipt.from.toLowerCase()

      const ethList: CreateFinancialTransactionPreprocessDto[] = await this.preprocessEth(
        ethereumEntries,
        rawTransaction,
        initiatorAddress
      )
      const erc20List: CreateFinancialTransactionPreprocessDto[] = await this.preprocessErc20(
        rawTransaction,
        initiatorAddress
      )

      let evmLogsList: CreateFinancialTransactionPreprocessDto[] = []
      const contractAddresses = walletContractConfigurationLogs.map((log) => log.evmLog.contractAddress)
      for (const contractAddress of contractAddresses) {
        const cryptocurrency = await this.cryptocurrenciesService.getByAddressAndBlockchain(
          contractAddress,
          rawTransaction.blockchainId
        )

        if (!cryptocurrency) {
          this.logger.debug(
            `No coin detected for chain id ${rawTransaction.blockchainId} and address ${contractAddress}`,
            {
              contractAddress,
              rawTransactionId: rawTransaction.id
            }
          )
          continue
        }
        const dtos = this.getPreprocessDtoFromEvmLogs(
          walletContractConfigurationLogs,
          cryptocurrency,
          rawTransaction.blockchainId
        )
        evmLogsList.push(...dtos)
      }

      const logs = [...erc20List, ...evmLogsList].sort((a, b) => a.order - b.order)
      preprocessDtos = []
        .concat(ethList)
        .concat(logs)
        .filter((e) => e)
    }

    //At this point, only for gas calculation
    if (rawTransaction.receipt) {
      const feeChildDto = await this.preprocessGasFee(rawTransaction)
      preprocessDtos.push(feeChildDto)
    }

    return preprocessDtos
  }

  async preprocessEth(
    ethereumEntries: AssetTransfersWithMetadataResult[],
    rawTransaction: RawTransaction,
    initiatorAddress: string
  ): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const results: CreateFinancialTransactionPreprocessDto[] = []
    const blockchainId = rawTransaction.blockchainId

    const cryptocurrencyCoin = await this.cryptocurrenciesService.getCoinByBlockchain(blockchainId)

    for (const originalEntry of ethereumEntries) {
      if (originalEntry.asset === cryptocurrencyCoin.symbol && originalEntry.value > 0) {
        // Alchemy string value can be different from the hexadecimal value
        // https://etherscan.io/tx/0xf6fd7b40d9b097662631502d0ed8b293c563838a3c3d78b907a24674e066b1e7
        let amount = new Decimal(originalEntry.value)
        if (originalEntry.rawContract.value) {
          amount = decimalHelper.formatWithDecimals(
            hexToNumberString(originalEntry.rawContract.value),
            hexToNumber(originalEntry.rawContract.decimal)
          )
        }

        const dto: CreateFinancialTransactionPreprocessDto = {
          forPublicIdGeneration: originalEntry.uniqueId,
          typeOrder: this.NATIVE_TYPE_ORDER,
          order: 0,
          hash: rawTransaction.hash,
          blockchainId: rawTransaction.blockchainId,
          fromAddress: originalEntry.from.toLowerCase(),
          toAddress: originalEntry.to?.toLowerCase() ?? FinancialTransactionPreprocessSpecialAccount.EMPTY_TO_ACCOUNT,
          initiatorAddress: initiatorAddress,
          cryptocurrency: cryptocurrencyCoin,
          cryptocurrencyAmount: amount.toString(),
          valueTimestamp: dateHelper.getUTCTimestampFrom(rawTransaction.blockTimestamp),
          status: FinancialTransactionPreprocessStatus.COMPLETED
        }

        results.push(dto)
      }
    }

    if (rawTransaction.internal?.length) {
      for (const internalTxn of rawTransaction.internal) {
        // Alchemy string value can be different from the hexadecimal value
        // https://etherscan.io/tx/0xf6fd7b40d9b097662631502d0ed8b293c563838a3c3d78b907a24674e066b1e7
        let amount = new Decimal(internalTxn.value)
        if (internalTxn.rawContract.value) {
          amount = decimalHelper.formatWithDecimals(
            hexToNumberString(internalTxn.rawContract.value),
            hexToNumber(internalTxn.rawContract.decimal)
          )
        }
        const index = rawTransaction.internal.indexOf(internalTxn)

        const dto: CreateFinancialTransactionPreprocessDto = {
          forPublicIdGeneration: internalTxn.uniqueId,
          typeOrder: this.INTERNAL_TYPE_ORDER,
          order: index,
          hash: rawTransaction.hash,
          blockchainId: rawTransaction.blockchainId,
          fromAddress: internalTxn.from.toLowerCase(),
          toAddress: internalTxn.to.toLowerCase(),
          initiatorAddress: initiatorAddress,
          cryptocurrency: cryptocurrencyCoin,
          cryptocurrencyAmount: amount.toString(),
          valueTimestamp: dateHelper.getUTCTimestampFrom(new Date(rawTransaction.blockTimestamp)),
          status: FinancialTransactionPreprocessStatus.COMPLETED
        }
        results.push(dto)
      }
    }
    return results
  }

  async preprocessErc20(
    rawTransaction: RawTransaction,
    initiatorAddress: string
  ): Promise<CreateFinancialTransactionPreprocessDto[]> {
    const results: CreateFinancialTransactionPreprocessDto[] = []
    const blockchainId = rawTransaction.blockchainId

    const logs: Array<Log> = rawTransaction.receipt?.logs

    if (!logs) {
      return []
    }

    const erc20TransferSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    const alchemyLogsPadding = '000000000000000000000000'

    const filteredLogs = logs
      .filter((log) => log.topics?.at(0)?.toLowerCase() === erc20TransferSignature.toLowerCase())
      .sort((a, b) => a.logIndex - b.logIndex)

    for (const log of filteredLogs) {
      let cryptocurrency = await this.cryptocurrenciesService.getByAddressAndBlockchain(log.address, blockchainId)

      if (!cryptocurrency) {
        try {
          cryptocurrency = await this.cryptocurrenciesService.createNewErc20Token(log.address, blockchainId)

          if (!cryptocurrency) {
            continue
          }
        } catch (e) {
          this.logger.error('Error in creating token', log.address, e)
          continue
        }
      }

      let from = log.topics.at(1).replace(alchemyLogsPadding, '').toLowerCase()
      const to = log.topics.at(2).replace(alchemyLogsPadding, '').toLowerCase()

      const amount = decimalHelper.formatWithDecimals(
        toBN(log.data).toString(),
        this.cryptocurrenciesService.getDecimalForCryptocurrency(cryptocurrency, rawTransaction.blockchainId)
      )

      if (amount.equals(0)) {
        continue
      }

      const dto: CreateFinancialTransactionPreprocessDto = {
        forPublicIdGeneration: log.transactionHash + log.logIndex,
        typeOrder: this.ERC20_LOG_TYPE_ORDER,
        order: log.logIndex,
        hash: rawTransaction.hash,
        blockchainId: rawTransaction.blockchainId,
        fromAddress: from,
        toAddress: to,
        initiatorAddress: initiatorAddress,
        cryptocurrency: cryptocurrency,
        cryptocurrencyAmount: amount.toString(),
        valueTimestamp: dateHelper.getUTCTimestampFrom(rawTransaction.blockTimestamp),
        status: FinancialTransactionPreprocessStatus.COMPLETED
      }

      results.push(dto)
    }

    return results
  }

  async preprocessGasFee(rawTransaction: RawTransaction): Promise<CreateFinancialTransactionPreprocessDto> {
    const from = rawTransaction.receipt.from.toLowerCase()
    const to = FinancialTransactionPreprocessSpecialAccount.GAS_FEE_ACCOUNT

    const cryptocurrency = await this.cryptocurrenciesService.getCoinByBlockchain(rawTransaction.blockchainId)

    if (!cryptocurrency) {
      this.logger.error(`No coin detected for chain id ${rawTransaction.blockchainId}`)
    }

    const gasUsed = new Decimal(BigNumber.from(rawTransaction.receipt.gasUsed).toNumber())
    const effectiveGasPrice = new Decimal(BigNumber.from(rawTransaction.receipt.effectiveGasPrice).toNumber())

    const cryptocurrencyAmount = decimalHelper.formatWithDecimals(
      gasUsed.mul(effectiveGasPrice),
      this.cryptocurrenciesService.getDecimalForCryptocurrency(cryptocurrency, rawTransaction.blockchainId)
    )

    const dto: CreateFinancialTransactionPreprocessDto = {
      forPublicIdGeneration: rawTransaction.hash + 'gas',
      typeOrder: this.FEE_TYPE_ORDER,
      order: 0,
      hash: rawTransaction.hash,
      blockchainId: rawTransaction.blockchainId,
      fromAddress: from,
      toAddress: to,
      initiatorAddress: from,
      cryptocurrency: cryptocurrency,
      cryptocurrencyAmount: cryptocurrencyAmount.toString(),
      valueTimestamp: dateHelper.getUTCTimestampFrom(rawTransaction.blockTimestamp),
      status: FinancialTransactionPreprocessStatus.COMPLETED
    }

    return dto
  }

  async createPreprocessFromEvmLogs(params: { address: string; blockchainId: string }): Promise<void> {
    const contractConfigurations = await this.contractConfigurationsEntityService.getByBlockchain(params.blockchainId)

    for (const contractConfiguration of contractConfigurations) {
      const cryptocurrency = await this.cryptocurrenciesService.getByAddressAndBlockchain(
        contractConfiguration.contractAddress,
        params.blockchainId
      )
      if (!cryptocurrency) {
        this.logger.debug(
          `No coin detected for chain id ${params.blockchainId} and address ${contractConfiguration.contractAddress}`,
          {
            contractConfiguration: contractConfiguration,
            address: contractConfiguration.contractAddress
          }
        )
        continue
      }

      const nonProcessedEntities =
        await this.walletContractConfigurationLogsEntityService.getAllNotProcessedByConfiguration({
          address: params.address,
          contractConfigurationId: contractConfiguration.id
        })

      for (const entity of nonProcessedEntities) {
        const dto = this.getPreprocessDtoFromEvmLog(entity, cryptocurrency, params.blockchainId)
        await this.financialTransactionsService.upsertPreprocess(dto)
        await this.walletContractConfigurationLogsEntityService.markAsProcessed(entity.id)
      }
    }
  }

  private getPreprocessDtoFromEvmLogs(
    nonProcessedEntities: WalletContractConfigurationLog[],
    cryptocurrency: Cryptocurrency,
    blockchainId: string
  ) {
    return nonProcessedEntities.map((entity) => {
      return this.getPreprocessDtoFromEvmLog(entity, cryptocurrency, blockchainId)
    })
  }

  private getPreprocessDtoFromEvmLog(
    entity: WalletContractConfigurationLog,
    cryptocurrency: Cryptocurrency,
    blockchainId: string
  ) {
    const log = entity.evmLog
    const amount = currencyHelper.formatHexWadAmountForCryptocurrency(log.data, cryptocurrency, blockchainId)

    const from = this.getAddressFromLog(
      entity.evmLog,
      entity.contractConfiguration,
      ContractConfigurationPlaceholderEnum.ADDRESS_OUT
    )
    const to = this.getAddressFromLog(
      entity.evmLog,
      entity.contractConfiguration,
      ContractConfigurationPlaceholderEnum.ADDRESS_IN
    )

    const dto: CreateFinancialTransactionPreprocessDto = {
      forPublicIdGeneration: log.transactionHash + log.logIndex,
      typeOrder: this.ERC20_LOG_TYPE_ORDER,
      order: log.logIndex,
      hash: log.transactionHash,
      blockchainId: blockchainId,
      fromAddress: from ?? log.contractAddress.toString(),
      toAddress: to ?? log.contractAddress.toString(),
      initiatorAddress: log.initiatorAddress,
      cryptocurrency: cryptocurrency,
      cryptocurrencyAmount: amount.toString(),
      valueTimestamp: dateHelper.getUTCTimestampFrom(log.blockTimestamp),
      status: FinancialTransactionPreprocessStatus.COMPLETED
    }
    return dto
  }

  private getAddressFromLog(
    evmLog: EvmLog,
    contractConfiguration: ContractConfiguration,
    placeholderEnum: ContractConfigurationPlaceholderEnum
  ) {
    if (contractConfiguration.topic1 === placeholderEnum) {
      return web3Helper.fromDecodedAddress(evmLog.topic1)
    }
    if (contractConfiguration.topic2 === placeholderEnum) {
      return web3Helper.fromDecodedAddress(evmLog.topic2)
    }
    if (contractConfiguration.topic3 === placeholderEnum) {
      return web3Helper.fromDecodedAddress(evmLog.topic3)
    }
  }

  async createOrMigrateFinancialTransactionPreprocess(
    hash: string,
    preprocessDtos: CreateFinancialTransactionPreprocessDto[]
  ) {
    return this.createOrMigratePreprocessCommand.execute(hash, preprocessDtos)
  }

  private async markEvmLogsAsProcessed(walletContractConfigurationLogs: WalletContractConfigurationLog[]) {
    for (const evmLogs of walletContractConfigurationLogs) {
      await this.walletContractConfigurationLogsEntityService.markAsProcessed(evmLogs.id)
    }
  }
}
