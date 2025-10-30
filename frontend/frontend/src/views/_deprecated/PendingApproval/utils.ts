import { IParsedQueuedTransaction, ITransactionConfirmations } from './interface'

export const checkIsTransactionRejected = (transaction: IParsedQueuedTransaction) => {
  if (
    transaction.safeTransaction &&
    transaction.safeTransaction.value === '0' &&
    !transaction.safeTransaction.data &&
    !transaction.safeTransaction.dataDecoded
  ) {
    return true
  }
  return false
}

interface ICheckConnectedAccountParams {
  safeOwners: string[]
  connectedAccount: string
}

interface ICheckExecutedConnectedAccountParams {
  confirmations: ITransactionConfirmations[]
  connectedAccount: string
}

export const checkIsConnectedAccountSafeOwner = ({
  safeOwners,
  connectedAccount
}: ICheckConnectedAccountParams): boolean => safeOwners.includes(connectedAccount)

export const checkTransactionExecutedByConnectedAccount = ({
  confirmations,
  connectedAccount
}: ICheckExecutedConnectedAccountParams): boolean => {
  const confirmationsByConnectedAccount = confirmations.filter(
    (confirmation) => confirmation.owner.toLocaleLowerCase() === connectedAccount
  )
  return confirmationsByConnectedAccount.length > 0
}

interface IParseTransactionAmountParams {
  organizationSettings: any
  transaction: IParsedQueuedTransaction
}
export const parseTransactionFiatAndCryptoData = ({
  transaction,
  organizationSettings
}: IParseTransactionAmountParams): {
  cryptocurrencies: any[]
  fiatTotalAmount: number
  fiatCurrencyData: any
} => {
  const fiatCurrencyData = {
    iso: organizationSettings?.country?.iso,
    code: organizationSettings?.fiatCurrency?.code,
    symbol: organizationSettings?.fiatCurrency?.symbol,
    decimals: organizationSettings?.fiatCurrency?.decimal
  }

  let fiatTotalAmount = 0
  const cryptocurrenciesMap = new Map()

  if (transaction?.recipients?.length > 0) {
    transaction.recipients.forEach((recipient) => {
      fiatTotalAmount += parseFloat(recipient.fiatAmount)
      // cryptocurrenciesMap.set(recipient.cryptocurrency.name, recipient.cryptocurrency)
      if (recipient.cryptocurrency && recipient.cryptocurrency.name) {
        const cryptocurrencyName = recipient.cryptocurrency.name
        const currentAmount = parseFloat(recipient.cryptocurrencyAmount) || 0

        if (cryptocurrenciesMap.has(cryptocurrencyName)) {
          // Update the total amount if the cryptocurrency already exists
          const existingEntry = cryptocurrenciesMap.get(cryptocurrencyName)
          existingEntry.totalCryptocurrencyAmount += currentAmount
          cryptocurrenciesMap.set(cryptocurrencyName, existingEntry)
        } else {
          const { image } = recipient.cryptocurrency
          // Create a new entry for the cryptocurrency
          cryptocurrenciesMap.set(cryptocurrencyName, {
            totalCryptocurrencyAmount: currentAmount,
            name: recipient.cryptocurrency?.name,
            symbol: recipient.cryptocurrency?.symbol,
            image: image?.thumb
          })
        }
      }
    })
  }

  return {
    cryptocurrencies: Array.from(cryptocurrenciesMap.values()),
    fiatTotalAmount,
    fiatCurrencyData
  }
}
