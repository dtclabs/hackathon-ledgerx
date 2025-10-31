/* eslint-disable no-promise-executor-return */
import { useState, useEffect, useRef } from 'react'
import { useAppSelector } from '@/state'
import { format } from 'date-fns'
import { Alert } from '@/components-v2/molecules/Alert'
import { toast } from 'react-toastify'
import { useWeb3React } from '@web3-react/core'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import usePendingApprovalLogic from './hooks/usePendingApprovalLogic'
import { useTransaction } from '@/hooks/useTransactionLegacy'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import Button from '@/components-v2/atoms/Button'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import Modal from '@/components/Modal'
import Loader from '@/components/Loader/Loader'
import { SideModal } from '@/components-v2/SideModal'
import Typography from '@/components-v2/atoms/Typography'
import usePostPendingPaymentHandler from './hooks/usePostPendingPaymentHandler'
import NotificationSending from '@/components/NotificationSending/NotificationSending'
import { QueuedTransactions, TransactionDetail } from './sections'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { SelectSafe, ConnectWalletChain, BatchExecute, TransactionRejectionModal } from './components'
import ContactTransactionModal from '../_deprecated/Transactions/components/ContactTransaction/ContactTransaction'

import type { IParsedPendingTransaction } from '@/slice/pending-transactions/pending-transactions.dto'
import { isEmpty } from 'lodash'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const PendingApprovalView = () => {
  const { account } = useWeb3React()
  const { handlePostExecutionAnalysis } = usePostPendingPaymentHandler()
  const {
    parseTransactionOwnership,
    fetchAndParseRawTransactions,
    executableTransactions,
    queuedTransactions,
    isLoading,
    isNonceMismatch,
    chainOptions,
    selectedSafe,
    permissionMap,
    setSelectedSafe
  } = usePendingApprovalLogic({
    safeInitSkip: !account
  })

  const {
    executeLoading,
    confirmLoading: isAwaitingWalletConfirmation,
    nonExecuteLoading,
    setShowError,
    showError,
    error: errorMessage,
    handleBatchExecuteTransactions,
    handleSign,
    handleReject,
    handleExecuted
  } = useTransaction()

  const initialMount = useRef(false)
  const prevAccount = useRef(null)
  const executeGridRef = useRef(null)
  const pendingGridRef = useRef(null)
  const tempSelectedTransaction = useRef<IParsedPendingTransaction | null>(null)
  const walletToAddAsContact = useRef(null)
  const [selectedTransactions, setSelectedTransactions] = useState([])

  const [selectedTransaction, setSelectedTransaction] = useState<IParsedPendingTransaction | null>(null)
  const [isBatchExecuteEnabled, setIsBatchExecuteEnabled] = useState(false)

  const importContactModalProvider = useModalHook({})
  const rejectTransactionModalProvider = useModalHook({})

  const selectedChain = useAppSelector(selectedChainSelector)

  // Initial Mount Call Data
  useEffect(() => {
    fetchAndParseRawTransactions().then(() => {
      initialMount.current = true
    })
  }, [])

  useEffect(() => {
    if (initialMount.current) {
      if (prevAccount.current === undefined && account) {
        // Handle connected account
        fetchAndParseRawTransactions()
      } else if (prevAccount.current !== account && account !== undefined) {
        // Handle account change
        parseTransactionOwnership({})
      } else if (account === undefined) {
        // Handle disconnected account
        setSelectedSafe(null)
        fetchAndParseRawTransactions()
      }
      prevAccount.current = account
    }
  }, [account])

  useEffect(() => {
    if (initialMount.current) {
      setSelectedSafe(null)
      fetchAndParseRawTransactions()
    }
  }, [selectedChain])

  useEffect(() => {
    if (showError) {
      if (errorMessage?.includes('code=ACTION_REJECTED') || errorMessage?.includes('User rejected transaction')) {
        toast.error('User has rejected signing the transaction')
      } else {
        toast.error(errorMessage)
      }
    }
    setShowError(false)
  }, [showError])

  useEffect(() => {
    if (isBatchExecuteEnabled) {
      executeGridRef.current.api.selectAll()
    }
  }, [isBatchExecuteEnabled])

  const handleSelectSafe = (_safe: any) => {
    setSelectedSafe(_safe)
    setIsBatchExecuteEnabled(false)
    fetchAndParseRawTransactions(_safe ? _safe.id : null)
  }

  const handleOnClickRow = (_selectedTransaction) => setSelectedTransaction(_selectedTransaction?.data)

  const handleOnClickExecuteRejectTransaction = (_transaction, _e) => {
    // This is to handle a user rejecting a proposed transaction
    const transaction: any = _transaction
    handleExecuted({
      e: _e,
      transaction,
      sourceId: transaction?.wallet?.id,
      callback: async () => {
        if (selectedTransaction) {
          tempSelectedTransaction.current = null
          setSelectedTransaction(null)
        }
        await sleep(2500)
        setIsBatchExecuteEnabled(false)
        fetchAndParseRawTransactions(selectedSafe?.id)
        toast.success('Transaction rejected successfully')
      }
    })
  }

  const handleRejectTransaction = async (_e) => {
    const transaction: any = tempSelectedTransaction.current

    handleReject(transaction, transaction?.wallet?.id, _e, async () => {
      tempSelectedTransaction.current = null
      setSelectedTransaction(null)
      await sleep(2500)
      setIsBatchExecuteEnabled(false)
      rejectTransactionModalProvider.methods.setIsOpen(false)
      toast.success('Transaction rejected successfully')
      fetchAndParseRawTransactions(selectedSafe?.id)
    })
  }

  const handleOnClickExecuteTransaction = (_transaction, e) => {
    // TODO - Legacy code - Needs to be refactored
    handleExecuted({
      e,
      transaction: _transaction,
      sourceId: _transaction?.wallet?.id,
      callback: async (txHash) => {
        if (selectedTransaction) {
          tempSelectedTransaction.current = null
          setSelectedTransaction(null)
        }
        handlePostExecutionAnalysis({
          transactions: [_transaction],
          transactionHash: txHash
        })
        await sleep(2500)
        setIsBatchExecuteEnabled(false)
        await fetchAndParseRawTransactions(selectedSafe?.id)
        toast.success('Transaction executed successfully')
      }
    })
  }

  const handleOnClickApproveTransaction = (_transaction, e) => {
    handleSign(_transaction, _transaction.wallet?.id, e, async () => {
      if (selectedTransaction) {
        tempSelectedTransaction.current = null
        setSelectedTransaction(null)
      }
      await sleep(2000)
      setIsBatchExecuteEnabled(false)
      fetchAndParseRawTransactions(selectedSafe?.id)
      toast.success('Transaction approved successfully')
    })
  }

  const handleOnClickRejectTransaction = (_transaction) => {
    // This is to handle a user rejecting a proposed transaction
    tempSelectedTransaction.current = _transaction
    setSelectedTransaction(null)
    rejectTransactionModalProvider.methods.setIsOpen(true)
  }

  const handleBatchExecute = async (e) => {
    if (!isBatchExecuteEnabled) {
      setIsBatchExecuteEnabled(true)
    } else {
      const sourceId = selectedSafe?.id
      try {
        if (selectedTransactions.length === 1) {
          handleOnClickExecuteTransaction(selectedTransactions[0], e)
        } else {
          await handleBatchExecuteTransactions(selectedTransactions, sourceId, e, async (txHash) => {
            handlePostExecutionAnalysis({
              transactions: selectedTransactions,
              transactionHash: txHash
            })
            await sleep(2500)
            setIsBatchExecuteEnabled(false)
            setSelectedTransactions([])
            fetchAndParseRawTransactions(selectedSafe?.id)
            toast.success('Batch transactions executed successfully')
          })
        }
      } catch (err: any) {
        // TODO - Error is handled in error in hook - we need to change this
      }
    }
  }
  const handleCancelBatchExecute = () => {
    setIsBatchExecuteEnabled(false)
    setSelectedTransactions([])
  }

  const handleOnSetSelection = (_transactions) => {
    setSelectedTransactions(_transactions)
  }

  const handleAddContact = (_address: string) => {
    walletToAddAsContact.current = _address
    importContactModalProvider?.methods?.setIsOpen(true)
  }

  const handleAddContactSuccess = (_contact) => {
    walletToAddAsContact.current = null

    const updatedContact = {
      name: _contact.type === 'individual' ? _contact.contactName : _contact.organizationName
    }

    const updatedRecipients: any = selectedTransaction?.recipients?.map((recipient) => ({
      ...recipient,
      contact: recipient.address === walletToAddAsContact.current ? updatedContact : recipient.contact
    }))
    const updatedConfirmations: any = selectedTransaction?.confirmations?.map((confirmation) => ({
      ...confirmation,
      ownerContact: confirmation.owner === walletToAddAsContact.current ? updatedContact : confirmation.ownerContact
    }))

    setSelectedTransaction((prev) => ({
      ...prev,
      recipients: [...updatedRecipients],
      confirmations: [...updatedConfirmations]
    }))
  }

  return (
    <>
      <View.Header>
        <View.Header.Left>
          <Header.Left.Title>Queued Transactions</Header.Left.Title>
        </View.Header.Left>
        <Header.Right>
          <ConnectWalletChain isLoading={isLoading} account={account} chains={chainOptions} />
        </Header.Right>
      </View.Header>
      <View.Content>
        <div>
          <section id="select-safe-section" className="mb-5">
            <Typography variant="subtitle1" color="primary" classNames="mb-3">
              Safe
            </Typography>
            <SelectSafe
              isLoading={isLoading}
              selectedChain={selectedChain}
              selectedSafe={selectedSafe}
              onSelectSafe={handleSelectSafe}
            />
          </section>
          <section id="batch-execute">
            <BatchExecute
              selectedSafe={selectedSafe}
              isNonceMismatch={isNonceMismatch}
              isLoading={false}
              isDisabled={
                !account ||
                isEmpty(selectedSafe) ||
                (isBatchExecuteEnabled && selectedTransactions.length === 0) ||
                executableTransactions?.length === 0
              }
              isBatchExecuteEnabled={isBatchExecuteEnabled}
              onClickBatchExecute={handleBatchExecute}
              onClickCancelBatchExecute={handleCancelBatchExecute}
              selectedTransactionsCount={selectedTransactions.length}
              executableTransactionsCount={executableTransactions.length}
            />
          </section>
          <section id="execute-section">
            <div className="flex items-center gap-2 my-2">
              <Typography variant="subtitle1">Ready to Execute</Typography>
              <Button
                height={32}
                variant="grey"
                disabled
                label={`${executableTransactions?.length ?? 0}`}
                classNames="px-2 truncate pointer-events-none"
              />
              <Typography variant="caption" color="secondary">
                You can only execute transactions that have been fully approved, strictly sequential in{' '}
                <Typography
                  variant="caption"
                  styleVariant="underline"
                  href="https://help.safe.global/en/articles/40837-advanced-transaction-parameters"
                >
                  Safe Account nonce.
                </Typography>
              </Typography>
            </div>
            <QueuedTransactions
              dataGridRef={executeGridRef}
              isLoading={isLoading}
              permissionMap={permissionMap}
              isBatchExecuteEnabled={isBatchExecuteEnabled}
              data={executableTransactions}
              onClickRow={handleOnClickRow}
              onSetSelectedTransactions={handleOnSetSelection}
              onClickExecuteTransaction={handleOnClickExecuteTransaction}
              onClickApproveTransaction={handleOnClickApproveTransaction}
              onClickRejectTransaction={handleOnClickRejectTransaction}
              onClickExecuteRejection={handleOnClickExecuteRejectTransaction}
            />
          </section>
          <section className="mt-6" id="pending-section">
            <div className="flex items-center gap-2 my-2">
              <Typography variant="subtitle1">Remaining Transactions in Queue</Typography>
              <Button
                height={32}
                variant="grey"
                disabled
                label={`${queuedTransactions?.length ?? 0}`}
                classNames="px-2 truncate pointer-events-none"
              />
              <Typography variant="caption" color="secondary">
                Please approve or reject the following transactions to execute them above.
              </Typography>
            </div>

            <QueuedTransactions
              dataGridRef={pendingGridRef}
              permissionMap={permissionMap}
              isLoading={isLoading}
              data={queuedTransactions}
              onClickRow={handleOnClickRow}
              onClickExecuteTransaction={handleOnClickExecuteTransaction}
              onClickApproveTransaction={handleOnClickApproveTransaction}
              onClickRejectTransaction={handleOnClickRejectTransaction}
              onClickExecuteRejection={handleOnClickExecuteRejectTransaction}
            />
          </section>
        </div>
      </View.Content>
      <SideModal
        renderActionButtons={false}
        title={
          Boolean(selectedTransaction) && (
            <div className="flex flex-row items-center gap-2">
              {!selectedTransaction?.isRejected && !selectedTransaction?.isUnknown && (
                <>
                  <Typography variant="heading2">
                    {selectedTransaction?.recipients?.length ?? 0} Recipient
                    {selectedTransaction?.recipients?.length > 1 ? 's' : ''}
                  </Typography>
                  <DividerVertical height="h-4" />
                </>
              )}
              <Typography variant="caption" color="secondary">
                Transfer submitted on {format(new Date(selectedTransaction?.submissionDate), 'dd MMM yyyy')}
              </Typography>
            </div>
          )
        }
        modalWidth="w-[900px]"
        titleClassName="border-b-0"
        showModal={Boolean(selectedTransaction)}
        setShowModal={setSelectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        disableOutside={importContactModalProvider?.state?.isOpen}
      >
        <TransactionDetail
          isOpen={Boolean(selectedTransaction)}
          permissonMap={permissionMap}
          onClickExecuteTransaction={handleOnClickExecuteTransaction}
          onClickApproveTransaction={handleOnClickApproveTransaction}
          onClickRejectTransaction={handleOnClickRejectTransaction}
          onClickExecuteRejection={handleOnClickExecuteRejectTransaction}
          onAddContact={handleAddContact}
          transaction={selectedTransaction}
        />
      </SideModal>
      <TransactionRejectionModal
        isLoading={isAwaitingWalletConfirmation}
        onClickConfirm={handleRejectTransaction}
        provider={rejectTransactionModalProvider}
      />
      {executeLoading && (
        <NotificationSending
          showModal={executeLoading}
          title="Sending transfer."
          subTitle="Please wait until the transfer is completed."
        />
      )}
      {nonExecuteLoading && (
        <Modal showModal zIndex="z-30">
          <Loader title="Waiting for wallet signature" />
        </Modal>
      )}
      <ContactTransactionModal
        showModal={importContactModalProvider?.state?.isOpen}
        setShowModal={importContactModalProvider?.methods?.setIsOpen}
        contactAddress={walletToAddAsContact.current}
        onSuccess={handleAddContactSuccess}
      />
    </>
  )
}

export default PendingApprovalView
