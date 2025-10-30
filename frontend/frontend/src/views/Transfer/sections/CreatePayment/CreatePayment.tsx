import { useEffect, useRef, useState } from 'react'
import { FormProvider } from 'react-hook-form'

import { EProcessStatus } from '@/views/Organization/interface'
import { DISPERSE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'

import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useAppSelector, useAppDispatch } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { usePaymentForm } from '../../hooks/usePaymentForm'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import usePreTransactionValidation from '../../hooks/usePretransactionValidation'
import useErc20Approval from '@/hooks-v2/web3Hooks/useERC20Approval'

import { updateReviewData } from '@/slice/transfer/transfer.slice'

import { selectedChainSelector } from '@/slice/platform/platform-slice'

import { PaymentFooter } from '../../components'

import { Recipients, SourceWalletSection, InsufficientFundsModal, ApprovalModal } from './components'
import ModalImportDraft from './components/ModalImportDrafts/ModalImportDrafts'
import ImportRecipientsModal from './components/ModalImportRecipientCsvModal/ImportRecipientsModal'
import AddNewRecipientModal from '@/views/Recipients/components/AddNewRecipientModal/AddNewRecipientModal'

const CreatePayment = () => {
  const router = useRouter()
  const approvalAmount = useRef(null)

  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const methods = usePaymentForm()
  const { setNewAllowance, setContract, isApprovalLoading } = useErc20Approval()
  const { transactionPrevalidation, errorMessage, isValidating } = usePreTransactionValidation()
  const importDraftsModalProvider = useModalHook({})
  const importRecipientsModalProvider = useModalHook({})
  const insufficientBalanceModalProvider = useModalHook({})
  const tokenApprovalModalProvider = useModalHook({})

  const selectedChain = useAppSelector(selectedChainSelector)

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const [addRecipientError, setAddRecipientError] = useState<string>('')
  const [addRecipientStatus, setAddRecipientStatus] = useState<string>(EProcessStatus.PENDING)

  useEffect(() => {
    if (addRecipientStatus === EProcessStatus.SUCCESS) {
      handleSuccessfulAddContact()
    }
  }, [addRecipientStatus])

  const handleOnSubmit = async () => {
    const sourceWalletId = methods.getValues('sourceWalletId')
    const recipients = methods.getValues('recipients')
    const result = await transactionPrevalidation({
      sourceWalletId,
      recipients
    })
    if (result.isSuccess === false) {
      if (result.error.type === 'InsufficientFunds') {
        console.log('InsufficientFunds')
        insufficientBalanceModalProvider.methods.setIsOpen(true)
      } else if (result.error.type === 'InsufficientApprovalAmount') {
        approvalAmount.current = result?.error?.amount?.toString()
        tokenApprovalModalProvider.methods.setIsOpen(true)

        setContract({
          tokenAddress: result.error.tokenAddress
        })
      } else {
        toast.error('Sorry, An error occurred our team has been notified')
      }
    } else {
      dispatch(updateReviewData({ sourceWalletId, recipients }))

      router.push(`/${organizationId}/transfer/crypto?step=review`)
    }
  }

  const handleAddNewContact = () => setIsAddContactModalOpen(true)
  const handleImportCSV = () => importRecipientsModalProvider.methods.setIsOpen(true)
  const handleImportDrafts = () => importDraftsModalProvider.methods.setIsOpen(true)
  const handleCloseBalanceModal = () => {
    // setIsLoading(false)
    insufficientBalanceModalProvider.methods.setIsOpen(false)
  }

  const handleCancelApproval = () => {
    // setIsLoading(false)
    tokenApprovalModalProvider.methods.setIsOpen(false)
  }

  const handleFailedAddContact = () => {
    toast.error('Failed to add new contact')
  }

  const handleSuccessfulAddContact = () => {
    setIsAddContactModalOpen(false)
    toast.success('Contact added successfully')
  }

  const handleTokenApproval = async () => {
    const disperseContract = DISPERSE_CONTRACT_MAP[selectedChain?.id]

    const result = await setNewAllowance({ spenderAddress: disperseContract, amount: approvalAmount.current || '100' })
    if (result.isSuccess === true) {
      tokenApprovalModalProvider.methods.setIsOpen(false)
      approvalAmount.current = null
      toast.success('Token approval successful')
    } else {
      if (result.error.type === 'WalletActionRejected') {
        toast.error(result.error.message)
      } else if (result.error.type === 'GenericError') {
        toast.error(result.error.message)
      } else {
        toast.error('Sorry, An error occurred our team has been notified')
      }
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col flex-grow h-full">
        <form onSubmit={methods.handleSubmit(handleOnSubmit)} className="flex-1 overflow-auto pl-1 pr-3">
          <SourceWalletSection isInitialized />
          <Recipients
            onClickAddNewContact={handleAddNewContact}
            onClickUploadCSV={handleImportCSV}
            onClickImportDrafts={handleImportDrafts}
            onCreateRecipient={handleAddNewContact}
          />
          <ModalImportDraft provider={importDraftsModalProvider} />
          <ImportRecipientsModal provider={importRecipientsModalProvider} />
        </form>
        <PaymentFooter
          onClickSubmit={methods.handleSubmit(handleOnSubmit)}
          sourceWalletId={methods.watch('sourceWalletId')}
          recipients={methods.watch('recipients')}
          isLoading={
            methods.formState.isSubmitting || methods.formState.isValidating || isValidating || isApprovalLoading
          }
          step="create"
        />

        <InsufficientFundsModal
          provider={insufficientBalanceModalProvider}
          onClickPrimary={handleCloseBalanceModal}
          onClickCancel={handleCloseBalanceModal}
          message={errorMessage}
        />
        <ApprovalModal
          provider={tokenApprovalModalProvider}
          handleTokenApproval={handleTokenApproval}
          handleCancelApproval={handleCancelApproval}
          isLoading={isApprovalLoading}
        />
      </div>
      {isAddContactModalOpen && (
        <AddNewRecipientModal
          setError={setAddRecipientError}
          setStatus={setAddRecipientStatus}
          showModal={isAddContactModalOpen}
          setShowModal={setIsAddContactModalOpen}
          selectedChain={selectedChain}
          // onFailedSubmit={handleFailedAddContact}
        />
      )}
    </FormProvider>
  )
}

export default CreatePayment
