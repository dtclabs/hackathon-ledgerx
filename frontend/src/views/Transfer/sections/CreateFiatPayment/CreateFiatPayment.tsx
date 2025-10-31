/* eslint-disable import/named */
import { CurrencyType } from '@/api-v2/payment-api'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { DISPERSE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'
import useConnectAccountRefresh from '@/hooks-v2/web3Hooks/useAutoConnectAccount'
import useErc20Approval from '@/hooks-v2/web3Hooks/useERC20Approval'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { updateReviewData } from '@/slice/transfer/transfer.slice'
import { useAppDispatch, useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import { toast } from 'react-toastify'
import { PaymentFooter } from '../../components'
import useBankAccounts from '../../hooks/useBankAccounts'
import useFiatPaymentForm from '../../hooks/useFiatPaymentForm/useFiatPaymentForm'
import usePaymentHandler from '../../hooks/usePaymentHandler'
import usePreTransactionValidation from '../../hooks/usePretransactionValidation'
import { ApprovalModal, InsufficientFundsModal } from '../CreatePayment/components'
import { Recipients } from './components'
import { ModalImportFiatDraft } from './components/ModalImportFiatDrafts'
import SourceWalletSection from './components/SourceWalletSection/SourceWalletSection'
import { useRef } from 'react'

const CreateFiatPayment = () => {
  useConnectAccountRefresh()
  const router = useRouter()
  const approvalAmount = useRef(null)

  const dispatch = useAppDispatch()
  const organizationId = useOrganizationId()
  const methods = useFiatPaymentForm()

  const { setNewAllowance, setContract, isApprovalLoading } = useErc20Approval()
  const { getFiatOutQuotes, deletePayments } = usePaymentHandler()
  const { transactionPrevalidation, errorMessage, isValidating } = usePreTransactionValidation()
  const { bankAccountLoading, bankAccountOptions } = useBankAccounts()

  const importDraftsModalProvider = useModalHook({})
  const insufficientBalanceModalProvider = useModalHook({})
  const tokenApprovalModalProvider = useModalHook({})

  const selectedChain = useAppSelector(selectedChainSelector)

  // const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  // const [addRecipientStatus, setAddRecipientStatus] = useState<string>(EProcessStatus.PENDING)
  // const [addRecipientError, setAddRecipientError] = useState<string>('')

  // useEffect(() => {
  //   if (addRecipientStatus === EProcessStatus.SUCCESS) {
  //     handleSuccessfulAddContact()
  //   }
  // }, [addRecipientStatus])

  const handleOnSubmit = async () => {
    const sourceWalletId = methods.getValues('sourceWalletId')
    const recipients = methods.getValues('recipients')

    try {
      const quotes = await getFiatOutQuotes({
        recipients,
        sourceWalletId
      })
      const _recipients = recipients.map((item, index) => ({
        ...item,
        walletAddress: quotes[index].destinationAddress,
        sourceAmount: quotes[index].sourceAmount,
        sourceCurrency: quotes[index].sourceCryptocurrency,
        quote: quotes[index].metadata?.quote,
        draftMetadata: {
          ...item?.draftMetadata,
          id: quotes[index].id
        }
      }))

      const result = await transactionPrevalidation({
        sourceWalletId,
        recipients: _recipients,
        destinationCurrencyType: CurrencyType.FIAT
      })

      if (result.isSuccess === false) {
        if (result.error.type === 'InsufficientFunds') {
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
        await deletePayments({ recipients: _recipients })
      } else {
        dispatch(updateReviewData({ sourceWalletId, recipients: _recipients }))
        router.push(`/${organizationId}/transfer/fiat?step=review`)
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleImportDrafts = () => importDraftsModalProvider.methods.setIsOpen(true)
  const handleCloseBalanceModal = () => {
    // setIsLoading(false)
    insufficientBalanceModalProvider.methods.setIsOpen(false)
  }

  const handleCancelApproval = () => {
    // setIsLoading(false)
    tokenApprovalModalProvider.methods.setIsOpen(false)
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

  // const handleSuccessfulAddContact = () => {
  //   setIsAddContactModalOpen(false)
  //   toast.success('Contact added successfully')
  // }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col flex-grow h-full">
        <form onSubmit={methods.handleSubmit(handleOnSubmit)} className="flex-1 overflow-auto pl-1 pr-3">
          <SourceWalletSection isInitialized />
          <Recipients
            onClickImportDrafts={handleImportDrafts}
            bankAccountLoading={bankAccountLoading}
            bankAccountOptions={bankAccountOptions}
          />
          <ModalImportFiatDraft provider={importDraftsModalProvider} bankAccountOptions={bankAccountOptions} />
        </form>
        <PaymentFooter
          onClickSubmit={methods.handleSubmit(handleOnSubmit)}
          sourceWalletId={methods.watch('sourceWalletId')}
          recipients={methods.watch('recipients')}
          isLoading={methods.formState.isSubmitting || methods.formState.isValidating || isValidating}
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

      {/* {isAddContactModalOpen && (
        <AddNewRecipientModal
          setError={setAddRecipientError}
          setStatus={setAddRecipientStatus}
          showModal={isAddContactModalOpen}
          setShowModal={setIsAddContactModalOpen}
          selectedChain={selectedChain}
        />
      )} */}
    </FormProvider>
  )
}

export default CreateFiatPayment
