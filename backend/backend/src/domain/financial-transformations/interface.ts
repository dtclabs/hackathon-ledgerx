import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionParentActivity } from '../../shared/entity-services/financial-transactions/interfaces'
import { WalletOwnedCryptocurrenciesMap } from '../../shared/entity-services/wallets/interfaces'
import { Wallet } from '../../shared/entity-services/wallets/wallet.entity'

export class WalletOwnedCryptocurrenciesBuilder {
  private readonly walletsOwnedCryptocurrenciesMap: { [walletId: string]: WalletOwnedCryptocurrenciesMap } = {}

  constructor(private readonly walletsMapGroupedByAddress: Map<string, Wallet>) {
    for (const wallet of this.walletsMapGroupedByAddress.values()) {
      this.walletsOwnedCryptocurrenciesMap[wallet.id] = wallet.ownedCryptocurrencies ?? {}
    }
  }

  public fromChild(child: FinancialTransactionChild): WalletOwnedCryptocurrenciesBuilder {
    const fromWallet = this.walletsMapGroupedByAddress.get(child.fromAddress)
    const toWallet = this.walletsMapGroupedByAddress.get(child.toAddress)

    if (fromWallet) {
      this.addCryptocurrencyToWallet({
        walletId: fromWallet.id,
        blockchainId: child.blockchainId,
        cryptocurrencyId: child.cryptocurrency.id
      })
    }

    if (toWallet) {
      this.addCryptocurrencyToWallet({
        walletId: toWallet.id,
        blockchainId: child.blockchainId,
        cryptocurrencyId: child.cryptocurrency.id
      })
    }

    return this
  }

  private addCryptocurrencyToWallet(params: { walletId: string; blockchainId: string; cryptocurrencyId: string }) {
    const { walletId, blockchainId, cryptocurrencyId } = params

    const walletOwnedCryptocurrenciesMap = this.walletsOwnedCryptocurrenciesMap[walletId] ?? {}
    const cryptocurrenciesIdsSet: Set<string> = new Set(walletOwnedCryptocurrenciesMap[blockchainId] ?? [])
    cryptocurrenciesIdsSet.add(cryptocurrencyId)
    walletOwnedCryptocurrenciesMap[blockchainId] = [...cryptocurrenciesIdsSet]
    this.walletsOwnedCryptocurrenciesMap[walletId] = walletOwnedCryptocurrenciesMap
  }

  public build() {
    return this.walletsOwnedCryptocurrenciesMap
  }
}

export const SwapActivitiesGroup = [FinancialTransactionParentActivity.SWAP]
export const GainLossInternalActivitiesGroup = [
  FinancialTransactionParentActivity.WRAP,
  FinancialTransactionParentActivity.UNWRAP
]
