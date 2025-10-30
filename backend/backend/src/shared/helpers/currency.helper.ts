import Decimal from 'decimal.js'
import { hexToNumberString } from 'web3-utils'
import { Cryptocurrency } from '../entity-services/cryptocurrencies/cryptocurrency.entity'
import { formatUnits } from 'ethers/lib/utils'
import { CryptocurrencyType } from '../entity-services/cryptocurrencies/interfaces'

export const currencyHelper = {
  formatHexWadAmountForCryptocurrency,
  formatAmountForCryptocurrency,
  getCryptocurrencyCoin,
  getCryptocurrencyByContractAddress
}

function formatAmount(balance: string, decimal: number) {
  return new Decimal(formatUnits(balance, decimal))
}

function formatAmountForCryptocurrency(balance: string, crypto: Cryptocurrency, blockchainId: string) {
  const decimal = crypto.addresses?.find((address) => address.blockchainId === blockchainId)?.decimal
  return formatAmount(balance, decimal)
}

function formatHexWadAmountForCryptocurrency(hexWad: string, crypto: Cryptocurrency, blockchainId: string) {
  const decimal = crypto.addresses?.find((address) => address.blockchainId === blockchainId)?.decimal
  const decString = hexToNumberString(hexWad)
  return formatAmount(decString, decimal)
}

function getCryptocurrencyCoin(cryptocurrencies: Cryptocurrency[], blockchainId: string) {
  return cryptocurrencies.find((c) =>
    c.addresses.find((a) => a.blockchainId === blockchainId && a.type === CryptocurrencyType.COIN)
  )
}

function getCryptocurrencyByContractAddress(
  cryptocurrencies: Cryptocurrency[],
  blockchainId: string,
  contractAddress: string
) {
  const lowerCaseContractAddress = contractAddress.toLowerCase()
  return cryptocurrencies.find((c) =>
    c.addresses.find((a) => a.blockchainId === blockchainId && a.address === lowerCaseContractAddress)
  )
}
