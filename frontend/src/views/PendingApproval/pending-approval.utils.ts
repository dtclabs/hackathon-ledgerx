import type { IPendingTransaction } from '@/slice/pending-transactions/pending-transactions.dto'
import type { ITransactionConfirmations } from './pending-approval.interface'

interface ICheckExecutedConnectedAccountParams {
  confirmations: ITransactionConfirmations[]
  connectedAccount: string
}

interface ICheckConnectedAccountParams {
  safeOwners: string[]
  connectedAccount: string
}

export const checkTransactionExecutedByConnectedAccount = ({
  confirmations,
  connectedAccount
}: ICheckExecutedConnectedAccountParams): boolean => {
  const confirmationsByConnectedAccount = confirmations.filter(
    (confirmation) => confirmation.owner.toLocaleLowerCase() === connectedAccount.toLocaleLowerCase()
  )
  return confirmationsByConnectedAccount.length > 0
}

export const checkIsConnectedAccountSafeOwner = ({
  safeOwners,
  connectedAccount
}: ICheckConnectedAccountParams): boolean => safeOwners.includes(connectedAccount.toLocaleLowerCase())

export const checkIsTransactionRejected = (transaction: IPendingTransaction) => {
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
