/* eslint-disable guard-for-in */
import { ethers } from 'ethers'
import { SourceType } from '@/slice/wallets/wallet-types'
import { Result } from '@/shared/types'
import { ICryptocurrencyType } from '@/slice/cryptocurrencies/cryptocurrency.types'
import { toChecksumAddress } from 'ethereumjs-util'
import { IRecipientItemForm } from './Transfer.types'
import { CurrencyType, ISubmitPaymentBody } from '@/api-v2/payment-api'
import { SafeBalanceResponse } from '@gnosis.pm/safe-service-client'

type UnknownError = {
  type: 'UnknownError'
  data?: {
    result: string
    message: string
  }
}

export const generatePaymentString = (balance, addressToTokenMap, nativeTokenSymbol): Result<string, UnknownError> => {
  // TODO - Format Numbers
  let insufficientTokens = 0
  let paymentString = 'You need at least '
  const tokenStrings = []

  Object.keys(balance).forEach((key) => {
    const address = key.toLowerCase() // Convert key to lowercase for case insensitivity

    if (address === 'null') {
      const amount = balance[key]
      insufficientTokens++
      tokenStrings.push(`at least ${amount} ${nativeTokenSymbol}`) // TODO - Use selected chain
    } else if (addressToTokenMap[toChecksumAddress(key)]) {
      insufficientTokens++
      const token = addressToTokenMap[toChecksumAddress(key)]
      const amount = balance[key]
      tokenStrings.push(`at least ${amount} ${token.symbol}`)
    }
  })

  if (insufficientTokens === 1) {
    paymentString += tokenStrings[0]
  } else if (insufficientTokens === 2) {
    paymentString += `${tokenStrings[0]} and ${tokenStrings[1]}`
  } else if (insufficientTokens > 2) {
    const lastToken = tokenStrings.pop()
    paymentString += `${tokenStrings.join(', ')}, and ${lastToken}`
  } else {
    paymentString = '' // No tokens found with insufficient balances
  }

  if (paymentString) {
    paymentString += ' to proceed with this payment.'
  }

  return paymentString
    ? { isSuccess: true, data: paymentString }
    : {
        isSuccess: false,
        error: {
          type: 'UnknownError',
          data: { result: paymentString, message: 'Sorry, error occured parsing payment string' }
        }
      }
}

export const checkSafeBalanceForTransfer = (_safeBalanceMap, _recipientTokenAmount) => {
  const insufficientBalances = {}

  for (const tokenId in _recipientTokenAmount) {
    const amountNeeded = _recipientTokenAmount[tokenId]
    const balance = tokenId in _safeBalanceMap ? _safeBalanceMap[tokenId] : 0

    if (balance < amountNeeded) {
      insufficientBalances[tokenId] = amountNeeded - balance
    }
  }

  return insufficientBalances
}

export const createSafeBalanceAddressMap = (_safeBalances: SafeBalanceResponse[]) => {
  const balanceMap = {}
  _safeBalances.forEach((safeBalance) => {
    const decimals = safeBalance?.token?.decimals ?? 18 // Todo use selected chain
    const parsedBalance = ethers.utils.formatUnits(safeBalance?.balance, decimals) // Parse the balance using ethers.js
    balanceMap[safeBalance?.tokenAddress] = parseFloat(parsedBalance)
  })
  return balanceMap
}

export const createRecipientAmountAddressMap = (_recipients, tokenChainMap) => {
  const tokenAmountMap = {}
  _recipients.forEach((recipient) => {
    const { tokenId, amount } = recipient

    const token = tokenChainMap[tokenId]

    if (token) {
      const isNativeToken = token.type === ICryptocurrencyType.COIN
      const addressKey = isNativeToken ? 'null' : token.address || 'null'
      if (addressKey in tokenAmountMap) {
        tokenAmountMap[addressKey] += parseFloat(amount)
      } else {
        tokenAmountMap[addressKey] = parseFloat(amount)
      }
    }
  })

  return tokenAmountMap
}

interface IParseLineItemForStatusUpdate {
  recipient: IRecipientItemForm
  destinationName: string | null
  sourceCryptocurrencyId: string
  sourceAmount: string
  sourceWallet: any
  blockchainId: string
  status: string
  remarks?: string
}

export const parseLineItemForStatusUpdate = ({
  recipient,
  destinationName,
  sourceCryptocurrencyId,
  sourceAmount,
  sourceWallet,
  blockchainId,
  status,
  remarks
}: IParseLineItemForStatusUpdate): ISubmitPaymentBody => ({
  destinationAddress: recipient.walletAddress,
  destinationName,
  destinationMetadata: recipient.metadata?.id
    ? {
        id: recipient.metadata?.id,
        type: recipient.metadata?.type
      }
    : null,
  status,
  paymentType: sourceWallet?.sourceType === SourceType.GNOSIS ? 'safe' : 'disperse',
  destinationCurrencyId: recipient.tokenId,
  cryptocurrencyId: recipient.tokenId,
  amount: recipient.amount,
  sourceCryptocurrencyId,
  destinationAmount: recipient.amount,
  sourceAmount,
  blockchainId,
  sourceWalletId: sourceWallet.id,
  chartOfAccountId: recipient.chartOfAccountId || null,
  notes: recipient?.note,
  files: recipient?.files?.length > 0 ? recipient?.files?.map((file) => file.key) : null,
  annotationIds: recipient?.annotations?.map((annotation) => annotation.value) || [],
  remarks
})

export const parseFiatPayment = ({
  recipient,
  destinationName,
  sourceCryptocurrencyId,
  sourceAmount,
  sourceWallet,
  blockchainId,
  status,
  remarks
}: IParseLineItemForStatusUpdate): ISubmitPaymentBody => {
  const parsedData: ISubmitPaymentBody = {
    destinationName,
    destinationMetadata: recipient.bankAccount?.metadata?.id ? recipient.bankAccount?.metadata : null,
    status,
    paymentType: sourceWallet?.sourceType === SourceType.GNOSIS ? 'safe' : 'disperse',
    destinationCurrencyId: recipient.tokenId,
    cryptocurrencyId: sourceCryptocurrencyId,
    amount: recipient.amount,
    sourceCryptocurrencyId,
    destinationAmount: recipient.amount,
    sourceAmount: sourceAmount || recipient.amount,
    blockchainId,
    sourceWalletId: sourceWallet.id,
    chartOfAccountId: recipient.chartOfAccountId || null,
    notes: recipient?.note,
    files: recipient?.files?.length > 0 ? recipient?.files?.map((file) => file.key) : null,
    remarks,
    destinationCurrencyType: CurrencyType.FIAT,
    annotationIds: recipient?.annotations?.map((annotation) => annotation.value) || [],
    metadata: { purposeOfTransfer: recipient?.purposeOfTransfer }
  }

  return parsedData
}
