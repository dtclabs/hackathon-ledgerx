import Decimal from 'decimal.js'
import { formatEther } from 'ethers/lib/utils'
import { SourceOfFundGnosis } from '../../source-of-funds/source-of-fund.entity'
import { ETransactionType } from '../../transactions/interfaces'
import { Transaction } from '../../transactions/transaction.entity'
import { Recipient } from '../entity-services/contacts/recipient.entity'
import { FinancialTransactionChildMetadataType } from '../entity-services/financial-transactions/interfaces'

export const transactionsHelper = {
  getTo,
  formatPrice,
  getContactName,
  getFee,
  getErrorsField,

  formatFiatPrice
}

function getTo(transaction: Transaction): string {
  return (
    (transaction.metamaskTransaction && transaction.metamaskTransaction.to) ||
    (transaction.safeTransaction && transaction.safeTransaction.to)
  )
}

function formatPrice(value: number | string, type: ETransactionType): string {
  const sum = value ? Number(value) * (type === ETransactionType.OUTGOING ? -1 : 1) : 0
  return sum.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

function getGasUsed(transaction: Transaction) {
  return (
    (transaction.metamaskTransaction &&
      transaction.metamaskTransaction.gasUsed &&
      Number(transaction.metamaskTransaction.gasUsed)) ||
    (transaction.safeTransaction && transaction.safeTransaction.gasUsed)
  )
}

function getGasPrice(transaction: Transaction) {
  return Number(transaction.metamaskTransaction?.gasPrice ?? 0)
}

function getFee(transaction: Transaction) {
  const gasUsed = getGasUsed(transaction)
  const gasPrice = getGasPrice(transaction)
  return (
    (gasUsed && gasPrice && formatEther((gasPrice * gasUsed).toString())) ||
    (transaction.safeTransaction && transaction.safeTransaction.fee && formatEther(transaction.safeTransaction.fee))
  )
}

function getContactName(recipients: Recipient[], sources: SourceOfFundGnosis[], address: string): string | null {
  const source = sources.find((s) => s.address.toLowerCase() === address.toLowerCase())
  const recipient = recipients.find((recipient) =>
    recipient.recipientAddresses.find((a) => a.address.toLowerCase() === address.toLowerCase())
  )
  return source?.name ?? recipient?.contactName ?? null
}

function getErrorsField(price: number | string | null) {
  //Using a juggling-check, we test both null and undefined in one hit
  const isInvalidPrice = price == null
  return {
    hasError: isInvalidPrice,
    error: isInvalidPrice ? 'Can not retrieve USD value' : ''
  }
}

function formatFiatPrice(value: string, type: FinancialTransactionChildMetadataType, decimal?: number) {
  if (value === null || value === undefined) {
    return ''
  }
  const decimalValue = new Decimal(value)
  if (type === FinancialTransactionChildMetadataType.DEPOSIT) {
    return decimal ? decimalValue.toFixed(decimal) : decimalValue.toString()
  } else {
    const negValue = decimalValue.neg()
    return decimal ? negValue.toFixed(decimal) : negValue.toString()
  }
}
