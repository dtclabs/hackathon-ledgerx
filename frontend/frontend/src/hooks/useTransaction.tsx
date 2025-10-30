import { ITransaction } from '@/slice/old-tx/interface'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { logEvent } from '@/utils/logEvent'
import { wait } from '@/utils/wait'
import Safe, { EthSignSignature } from '@gnosis.pm/safe-core-sdk'
import { OperationType, SafeTransaction, SafeTransactionData, TransactionResult } from '@gnosis.pm/safe-core-sdk-types'
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { useWeb3React } from '@web3-react/core'
import { MouseEvent, useState } from 'react'
import useSafe from '@/hooks/useSafe'
import useSafeServiceClient from './useSafeServiceClient'
import { captureException as sentryCaptureException } from '@sentry/nextjs'
import { useSyncPendingTransactionsMutation } from '@/slice/wallets/wallet-api'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { GNOSIS_SAFE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'

export const useTransaction = () => {
  const [reset, setReset] = useState(0)
  const [error, setError] = useState<string>()
  const [showError, setShowError] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [nonExecuteLoading, setNonExecuteLoading] = useState(false)
  const [executeLoading, setExecuteLoading] = useState(false)
  const [showSuccessExecute, setShowSuccessExecute] = useState(false)

  const { loadSafe } = useSafe()
  const { account, chainId, library } = useWeb3React()
  const safeService = useSafeServiceClient()
  const organizationId = useOrganizationId()
  const sourceOfFunds = useAppSelector(walletsSelector)
  const [syncPendingTrigger] = useSyncPendingTransactionsMutation()
  const { startWalletSync } = useWalletSync({
    organisationId: organizationId
  })

  const isTransactionExecutable = (safeThreshold: number, transaction: SafeMultisigTransactionResponse) =>
    transaction && transaction.confirmations && transaction.confirmations.length >= safeThreshold

  const isTransactionSignedByAddress = (signerAddress: string, transaction: SafeMultisigTransactionResponse) => {
    const isConfirm =
      transaction &&
      transaction.confirmations &&
      transaction.confirmations.find((confirmation) => confirmation.owner === signerAddress)

    return !!isConfirm
  }

  const isSource = (sourceId: string) => {
    if (sourceOfFunds.length !== 0) {
      return sourceOfFunds.find((item) => item.id === sourceId)
    }
    return null
  }

  const executeTransaction = async (
    safe: Safe,
    transaction: SafeMultisigTransactionResponse | any,
    safeTransactionData: SafeTransactionData
  ) => {
    if (safe) {
      const safeTransaction = await safe.createTransaction({ safeTransactionData })
      transaction.confirmations.forEach((confirmation) => {
        const signature = new EthSignSignature(confirmation.owner, confirmation.signature)
        safeTransaction.addSignature(signature)
      })
      const executeTxResponse = await safe.executeTransaction(safeTransaction)
      if (executeTxResponse && executeTxResponse.transactionResponse) {
        await executeTxResponse.transactionResponse.wait().then(() => setReset((prev) => prev + 1))
      }
      return executeTxResponse
    }
    return null
  }

  const checkAvailableExecute = async (txHash: string) => {
    const transaction = await safeService.getTransaction(txHash)
    return transaction.isExecuted
  }

  const getCurrentNonce = async (sourceId: string) => {
    const source = isSource(sourceId)
    try {
      const safe = await loadSafe(source?.address)
      const nonce = await safe.getNonce()
      return nonce
    } catch (err) {
      sentryCaptureException(err)
      //
      return undefined
    }
  }

  const handleReset = () => setReset((prev) => prev + 1)

  const handleExecuted = async ({
    e,
    sourceId,
    transaction,
    callback
  }: {
    transaction: ITransaction
    sourceId: string
    e: MouseEvent
    callback?: (transactionHash?: string) => void
  }) => {
    e.stopPropagation()
    if (transaction.isRejectTransaction) setConfirmLoading(true)
    else setExecuteLoading(true)
    let txHash
    let success = false
    const source = isSource(sourceId)
    try {
      const safe = await loadSafe(source?.address)
      if (safe && account) {
        const owners = await safe.getOwners()
        if (!owners.includes(account)) {
          setError("You don't have permission to execute this source.")
          setShowError(true)
          if (transaction.isRejectTransaction) setConfirmLoading(false)
          else setExecuteLoading(false)

          return
        }
      }
      if (await checkAvailableExecute(transaction.safeHash)) {
        setError('This transaction is already executed.')
        setShowError(true)
        if (transaction.isRejectTransaction) setConfirmLoading(false)
        else setExecuteLoading(false)

        handleReset()
        if (callback) {
          callback()
        }
        return
      }

      const safeTransactionData: SafeTransactionData = {
        to: transaction.safeTransaction.to,
        value: transaction.safeTransaction.value,
        data: transaction.safeTransaction.data || '0x',
        operation: transaction.safeTransaction.operation,
        safeTxGas: transaction.safeTransaction.safeTxGas,
        baseGas: transaction.safeTransaction.baseGas,
        gasPrice: Number(transaction.safeTransaction.gasPrice),
        gasToken: transaction.safeTransaction.gasToken,
        refundReceiver: transaction.safeTransaction.refundReceiver,
        nonce: transaction.safeTransaction.nonce
      }

      const transactionResult: TransactionResult = await executeTransaction(
        safe,
        transaction.safeTransaction,
        safeTransactionData
      )

      await transactionResult.transactionResponse.wait().then(() => {
        txHash = transactionResult.hash
        syncPendingTrigger({ organisationId: organizationId })
        startWalletSync()
        success = true
      })
      setShowSuccessExecute(true)
    } catch (err: any) {
      sentryCaptureException(err?.message)
      if (err && err.message.includes('cannot estimate gas; transaction may fail or may require manual gas limit')) {
        setError(
          `Cannot estimate gas. Transaction may fail or may require manual gas limit.
          Please check your balance before making a transfer.`
        )
      } else if (err.message.includes('user rejected transaction')) {
        setError('User rejected transaction')
      } else if (!err.message.includes('Contract with a Signer cannot override')) {
        setError(err.message as string)
      }
      if (transaction.isRejectTransaction) setConfirmLoading(false)
      else setExecuteLoading(false)

      setExecuteLoading(false)
      setShowError(true)
    }
    await wait(3000)
    if (success) {
      handleReset()
      if (callback) {
        callback(txHash)
      }
    }
    await wait(2000)
    if (transaction.isRejectTransaction) setConfirmLoading(false)
    else setExecuteLoading(false)
  }

  const handleReject = async (transactionData: ITransaction, sourceId: string, e: any, callback?: () => void) => {
    e.stopPropagation()
    if (!account) {
      setError("You don't have permission to execute this source.")
      setShowError(true)
      setConfirmLoading(false)
      return
    }
    setConfirmLoading(true)
    let success = false
    const source = isSource(sourceId)
    const safe = await loadSafe(source?.address)

    if (safe && account) {
      const owners = await safe.getOwners()
      if (!owners.includes(account)) {
        setError("You don't have permission to execute this source.")
        setShowError(true)
        setConfirmLoading(false)
        return
      }
    }

    if (safe) {
      const safeTx = {
        ...transactionData.safeTransaction,
        gasPrice: Number(transactionData.safeTransaction.gasPrice)
      }

      try {
        const safeTransaction = await safe.createTransaction({
          safeTransactionData: safeTx
        })

        const rejectTransaction = await safe.createRejectionTransaction(safeTransaction.data.nonce)

        const safeTxHash = await safe.getTransactionHash(rejectTransaction)

        const signature = await safe.signTypedData(rejectTransaction)

        await safeService.proposeTransaction({
          safeAddress: source.address,
          safeTransactionData: rejectTransaction.data,
          safeTxHash,
          senderAddress: account,
          senderSignature: signature.data
        })

        await safeService.confirmTransaction(safeTxHash, signature.data).then(() => {
          syncPendingTrigger({ organisationId: organizationId })
          startWalletSync()
          success = true
        })
      } catch (err: any) {
        sentryCaptureException(err?.message)
        if (err.code === 'ACTION_REJECTED') {
          setError('User has rejected signing the transaction')
        } else {
          setError(err.message)
        }
        setConfirmLoading(false)
      }
    }
    await wait(3000)
    if (success) {
      handleReset()
      if (callback) {
        callback()
      }
    }
    await wait(2000)
    setConfirmLoading(false)
  }

  const handleSign = async (transactionData: ITransaction, sourceId: string, e: any, callback?: () => void) => {
    e.stopPropagation()
    if (!account) {
      setError("You don't have permission to execute this source.")
      setShowError(true)
      setNonExecuteLoading(false)
      return
    }

    setNonExecuteLoading(true)
    let success = false
    const transaction = transactionData.safeTransaction
    const source = isSource(sourceId)
    const safe = await loadSafe(source?.address)

    if (safe && account) {
      const owners = await safe.getOwners()
      if (!owners.includes(account)) {
        setError("You don't have permission to execute this source.")
        setShowError(true)
        setNonExecuteLoading(false)
        return
      }
    }
    if (safe && source && transaction) {
      try {
        const txResponse = await safe.approveTransactionHash(transaction.safeTxHash)
        await txResponse.transactionResponse.wait().then(() => {
          syncPendingTrigger({ organisationId: organizationId })
          startWalletSync()
          success = true
        })
      } catch (err: any) {
        sentryCaptureException(err?.message)
        setError(err.message)
        setNonExecuteLoading(false)
        setShowError(true)
      }
      await wait(3000)
      if (success) {
        handleReset()
        if (callback) {
          callback()
        }
      }
      await wait(2000)

      logEvent({
        event: 'confirm_transaction_in_app',
        payload: {
          event_category: 'Full app',
          event_label: '',
          value: Number(transactionData?.amount).toFixed(2),
          chain: chainId,
          recipients: transactionData?.recipients.length
        }
      })
      setNonExecuteLoading(false)
    }
  }

  const handleBatchExecuteTransactions = async (
    transactionData,
    sourceId,
    e: any,
    callback?: (transactionHash?: string) => void
  ) => {
    e.stopPropagation()


    if (!account) {
      setError("You don't have permission to execute this source.")
      setShowError(true)
      setExecuteLoading(false)
      return
    }

    setExecuteLoading(true)
    let txHash
    let success
    const source = isSource(sourceId)

    const safe = await loadSafe(source?.address)

    if (safe && account) {
      const owners = await safe.getOwners()

      if (!owners.includes(account)) {
        setError("You don't have permission to execute this source.")
        setShowError(true)
        setExecuteLoading(false)

        return
      }
    }
    const safeContract = await safe.getContractManager().safeContract

    const transactions = transactionData.map((tx) => tx.safeTransaction)
    const nonce = await safeService.getNextNonce(source.address)

    const safeTransactionData = []

    for (const transaction of transactions) {
      const safeTransaction: SafeTransaction = await safe.createTransaction({ safeTransactionData: transaction })
      transaction.confirmations.forEach((sign) => {
        const signature = new EthSignSignature(sign.owner, sign.signature)
        safeTransaction.addSignature(signature)
      })
      const signatures = safeTransaction.encodedSignatures()
      const data = safeContract.encode('execTransaction', [
        transaction.to,
        transaction.value,
        transaction.data ?? '0x',
        transaction.operation,
        transaction.safeTxGas,
        transaction.baseGas,
        transaction.gasPrice,
        transaction.gasToken,
        transaction.refundReceiver,
        signatures
      ])
      safeTransactionData.push({
        to: source.address,
        value: '0',
        data,
        operation: OperationType.Call
      })
    }

    try {
      const mainTransaction = await safe.createTransaction({ safeTransactionData, onlyCalls: true, options: { nonce } })
      const safeTxHash = await safe.getTransactionHash(mainTransaction)
      mainTransaction.addSignature(new EthSignSignature(account, safeTxHash))

      const multisendCallOnlyAddress =
        transactionData[0].blockchainId === 'sepolia'
          ? GNOSIS_SAFE_CONTRACT_MAP['11155111'].multiSendCallOnlyAddress
          : safe.getMultiSendCallOnlyAddress()

      const signer = library.getSigner(account)
      const tx = await signer.sendTransaction({
        to: multisendCallOnlyAddress,
        data: mainTransaction.data.data
      })

      await tx.wait().then(() => {
        txHash = tx.hash
        syncPendingTrigger({ organisationId: organizationId })
        startWalletSync()
        success = true
      })
      setShowSuccessExecute(true)
    } catch (err: any) {
      console.log('CAUGHT MY EYE')
      sentryCaptureException(err?.message)
      if (err && err.message.includes('cannot estimate gas; transaction may fail or may require manual gas limit')) {
        console.log(err)
        setError(
          `Cannot estimate gas. Transaction may fail or may require manual gas limit.
          Please check your balance before making a transfer.`
        )
      } else if (err.message.includes('user rejected transaction')) {
        setError('User rejected transaction')
      } else if (!err.message.includes('Contract with a Signer cannot override')) {
        setError(err.message as string)
      }

      setExecuteLoading(false)
      setShowError(true)
      throw new Error(err)
    }
    console.log('WHAT IS SUCCESS', success)
    await wait(3000)
    if (success) {
      handleReset()
      if (callback) {
        callback(txHash)
      }
    }
    setExecuteLoading(false)
  }

  const handleCloseModal = () => {
    setError(undefined)
    setShowError(false)
  }

  return {
    getCurrentNonce,
    error,
    isSource,
    showError,
    handleCloseModal,
    handleSign,
    handleReject,
    handleExecuted,
    handleBatchExecuteTransactions,
    confirmLoading,
    reset,
    setShowError,
    isTransactionExecutable,
    isTransactionSignedByAddress,
    showSuccessExecute,
    setShowSuccessExecute,
    executeLoading,
    setNonExecuteLoading,
    nonExecuteLoading
  }
}
