import { v4 as uuidv4 } from 'uuid'
import { useRef } from 'react'
import { useAppSelector } from '@/state'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { IRecipientItemForm } from '../Transfer.types'
import { parseFiatPayment, parseLineItemForStatusUpdate } from '../utilities'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { selectWalletMapById } from '@/slice/wallets/wallet-selectors'
import { selectContactAddressIdMap } from '@/slice/contacts/contacts.selectors'
import {
  CurrencyType,
  IPayment,
  ISubmitPaymentBody,
  PaymentStatus,
  useFakeBulkDeletePaymentsMutation,
  useGetQuoteMutation,
  usePostPaymentsMutation,
  useUpdatePaymentStatusToExecutedMutation,
  useUpdatePaymentStatusToExecutingMutation,
  useUpdatePaymentStatusToFailedMutation
} from '@/api-v2/payment-api'
import { usePostAnalysisForPayoutMutation, useBatchSendAnalysisMutation } from '@/api-v2/analysis-api'
import { GenericError } from '@/shared/error-types'
import { selectVerifiedCryptocurrencyMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'

interface ICreateManualDraftPayments {
  recipients: IRecipientItemForm[]
  sourceWalletId: string
  remarks: string
  destinationCurrencyType?: CurrencyType
  proposedTransactionHash: string
}
interface IGetPaymentQuotes {
  recipients: IRecipientItemForm[]
  sourceWalletId: string
}

interface IPostAnaysisParams {
  txHash: string
  recipients: IRecipientItemForm[]
  tokenPrice: number
  type: 'disperse' | 'safe' | 'eoa_wallet'
  sourceType: 'eoa_wallet' | 'gnosis_safe'
  sourceAddress: string
  sourceWalletId: string
}

interface ISendDraftAnalysis {
  drafts: any
  tokenPrice: any
  type: 'eoa' | 'safe'
  eventType: 'EXECUTED_DRAFT_PAYMENT'
}

interface IPostExecutedTransaction {
  txHash?: string
  safeHash?: string
}

const usePaymentHandler = () => {
  const totalTokens = 0
  const draftIdsRef = useRef<string[]>([])
  const draftIdsMap = useRef<{ [index: string]: string }>({})
  const organizationId = useOrganizationId()
  const selectedChain = useAppSelector(selectedChainSelector)
  const walletMapId = useAppSelector(selectWalletMapById)
  const contactAddressIdMap = useAppSelector(selectContactAddressIdMap)
  const verifiedCryptocurrencyMap: any = useAppSelector(selectVerifiedCryptocurrencyMap)

  const [triggerPostPayment] = usePostPaymentsMutation()

  const [postPayoutAnalysis] = usePostAnalysisForPayoutMutation()
  const [triggerBatchSendAnalysis] = useBatchSendAnalysisMutation()
  const [postPaymentsAsExecuting, postPaymentsAsExecutingResult] = useUpdatePaymentStatusToExecutingMutation()
  const [postPaymentSuccess, postPaymentSuccessResult] = useUpdatePaymentStatusToExecutedMutation()
  const [postPaymentFailure, postPaymentFailureResult] = useUpdatePaymentStatusToFailedMutation()
  const [getQuote, getQuoteResult] = useGetQuoteMutation()
  const [triggerBulkDeletePayments, bulkDeletePaymentsResponse] = useFakeBulkDeletePaymentsMutation()

  const prepareDataForPreExecute = async ({
    recipients: _recipients,
    sourceWalletId,
    remarks,
    destinationCurrencyType = CurrencyType.CRYPTO,
    proposedTransactionHash
  }: ICreateManualDraftPayments) => {
    // Pre-execution step we need to create Draft Items for line items that were manually added
    const sourceWallet = walletMapId[sourceWalletId]
    const manuallyCreatedLineItems: ISubmitPaymentBody[] = []
    const draftCreatedLineItems: ISubmitPaymentBody[] = []

    const paymentType = sourceWallet?.sourceType === 'eth' ? 'disperse' : 'safe'

    const importedDraftIds = []

    _recipients.forEach((recipient, index) => {
      let destinationName = null
      const wallet = walletMapId[recipient.metadata?.id]
      const contact = contactAddressIdMap[recipient.metadata?.id]
      const sourceCryptocurrencyId =
        destinationCurrencyType === CurrencyType.CRYPTO ? recipient.tokenId : verifiedCryptocurrencyMap?.usdc?.publicId
      const sourceAmount = destinationCurrencyType === CurrencyType.CRYPTO ? recipient.amount : null

      if (wallet) {
        destinationName = wallet.name
      } else if (contact) {
        destinationName = contact.contactName ?? contact.contactOrganizationName
      }
      if (
        recipient?.draftMetadata &&
        ![PaymentStatus.EXECUTED, PaymentStatus.EXECUTING].includes(recipient?.draftMetadata?.status)
      ) {
        // Draft Item
        const parsedLineItem = parseLineItemForStatusUpdate({
          recipient,
          destinationName,
          sourceWallet,
          blockchainId: selectedChain?.id,
          status: 'executing',
          remarks,
          sourceCryptocurrencyId,
          sourceAmount
        })
        importedDraftIds.push(recipient.draftMetadata.id)
        draftCreatedLineItems.push(parsedLineItem)

        draftIdsMap[index] = recipient.draftMetadata.id
      } else {
        // Manual Item
        const parsedLineItem = parseLineItemForStatusUpdate({
          recipient,
          destinationName,
          sourceWallet,
          blockchainId: selectedChain?.id,
          sourceCryptocurrencyId,
          sourceAmount,
          status: 'preview',
          remarks
        })
        manuallyCreatedLineItems.push({ ...parsedLineItem })
      }
    })

    try {
      const newlyCreatedDraftsResponse = await triggerPostPayment({
        params: {
          organizationId
        },
        body: manuallyCreatedLineItems
      }).unwrap()
      const manuallyCreatedDraftIds = newlyCreatedDraftsResponse.map((draft) => draft.id)
      let preExecuteResult = false

      await postPaymentsAsExecuting({
        params: {
          organizationId
        },
        body: {
          ids: [...importedDraftIds, ...manuallyCreatedDraftIds],
          blockchainId: selectedChain?.id,
          sourceWalletId,
          paymentType,
          remarks,
          proposedTransactionHash
        }
      })
        .unwrap()
        .then((res) => {
          const newlyCreatedDraftIds = newlyCreatedDraftsResponse.map((draft) => draft.id)
          draftIdsRef.current = [...newlyCreatedDraftIds, ...importedDraftIds]
          preExecuteResult = true
        })
        .catch((err) => {
          preExecuteResult = false
        })

      return preExecuteResult
    } catch (_err: any) {
      if (_err?.status === 400) {
        throw new GenericError('Error creating draft payments')
      } else {
        throw new GenericError('Error executing draft payment')
      }
    }
  }

  const getFiatOutQuotes = async ({ recipients: _recipients, sourceWalletId }: IGetPaymentQuotes) => {
    const sourceWallet = walletMapId[sourceWalletId]

    const draftIds = []
    const quotes: IPayment[] = []

    try {
      for (const recipient of _recipients) {
        const destinationName = recipient.bankAccount.label
        const sourceCryptocurrencyId = verifiedCryptocurrencyMap?.usdc?.publicId
        const sourceAmount = '0'

        if (
          recipient?.draftMetadata &&
          ![PaymentStatus.EXECUTED, PaymentStatus.EXECUTING].includes(recipient?.draftMetadata?.status)
        ) {
          // Draft Item
          draftIds.push(recipient.draftMetadata.id)

          const tripleAQuote = await getQuote({ organizationId, id: recipient.draftMetadata.id })?.unwrap()
          quotes.push(tripleAQuote)
        } else {
          // Manual Item
          const parsedLineItem = parseFiatPayment({
            recipient,
            destinationName,
            sourceWallet,
            blockchainId: selectedChain?.id,
            status: 'preview',
            sourceCryptocurrencyId,
            sourceAmount
          })

          const newlyCreatedDraftsResponse = await triggerPostPayment({
            params: {
              organizationId
            },
            body: [parsedLineItem]
          }).unwrap()

          draftIds.push(newlyCreatedDraftsResponse[0].id)

          const tripleAQuote = await getQuote({ organizationId, id: newlyCreatedDraftsResponse[0].id })?.unwrap()

          quotes.push(tripleAQuote)
        }
      }
    } catch (_err: any) {
      throw new GenericError('Error getting payment quote')
    }

    return quotes
  }

  const postExecutedStatus = async ({ txHash, safeHash }: IPostExecutedTransaction) => {
    try {
      const draftIds = draftIdsRef.current
      let allDraftIds = []
      if (txHash) {
        allDraftIds = draftIds.map((id) => ({ id, hash: txHash }))
      } else if (safeHash) {
        allDraftIds = draftIds.map((id) => ({ id, safeHash }))
      }

      await postPaymentSuccess({
        params: {
          organizationId
        },
        body: allDraftIds
      }).unwrap()
    } catch (error) {
      throw new GenericError('Error executing draft payment')
    }
  }

  const postFailedStatus = async () => {
    const allDraftIds = draftIdsRef.current.map((id) => id)

    await postPaymentFailure({
      params: {
        organizationId
      },
      body: {
        ids: allDraftIds
      }
    }).unwrap()
  }

  const sendPostAnalysis = ({
    txHash,
    recipients,
    tokenPrice,
    type,
    sourceType,
    sourceAddress,
    sourceWalletId
  }: IPostAnaysisParams) => {
    // Post analysis for the successful payments
    postPayoutAnalysis({
      blockchainId: selectedChain?.id,
      type,
      sourceType,
      sourceAddress,
      sourceWalletId,
      hash: txHash, // TODO-PENDING Confirm if we will be sending this
      applicationName: 'full_app',
      totalLineItems: recipients.length,
      notes: null,
      lineItems: recipients.map((recipient) => ({
        address: recipient?.walletAddress,
        cryptocurrencyId: recipient.tokenId,
        amount: recipient.amount,
        chartOfAccountId: recipient?.chartOfAccountId,
        notes: recipient?.note,
        files: recipient?.files
      })),
      totalAmount: (Number(totalTokens) * tokenPrice).toFixed(2),
      valueAt: new Date().toISOString()
    })
  }

  const sendDraftAnalysisData = ({ drafts, tokenPrice, type, eventType }: ISendDraftAnalysis) => {
    const uuid = uuidv4()
    const salt = new Date().getTime()
    const analysisData = drafts.map((payment) => ({
      eventType,
      metadata: {
        type,
        id: payment?.draftMetadata?.id,
        queued: null,
        batchId: `${salt}-${uuid}`,
        tokenAmount: payment.amount,
        fiatAmountUSD: (Number(payment.amount) * tokenPrice).toFixed(2),
        blockchainId: payment.token?.address?.blockchainId,
        cryptocurrency: payment?.token?.label, // Symbol
        createdAt: null,
        chartOfAccount: payment?.chartOfAccounts?.name ?? null,
        createdBy: null,
        destinationAddress: payment.walletAddress?.address,
        isDestinationRecipient: payment?.walletAddress?.isUnknown ?? null,
        files: payment.files?.length,
        hasNotes: payment.note?.length > 0,
        hasReviewer: null,
        status: 'executed'
      }
    }))
  }

  const deletePayments = async ({ recipients: _recipients }: { recipients: IRecipientItemForm[] }) => {
    // delete the payments that created when get quotes
    const paymentIdsForGetQuotes = _recipients
      ?.filter((item) => item?.draftMetadata?.id && !item?.draftMetadata?.isImported)
      ?.map((item) => item.draftMetadata.id)

    await triggerBulkDeletePayments({
      params: {
        organizationId
      },
      body: {
        data: paymentIdsForGetQuotes
      }
    })
  }

  return {
    prepareDataForPreExecute,
    postExecutedStatus,
    postFailedStatus,
    sendPostAnalysis,
    sendDraftAnalysisData,
    getFiatOutQuotes,
    deletePayments
  }
}

export default usePaymentHandler
