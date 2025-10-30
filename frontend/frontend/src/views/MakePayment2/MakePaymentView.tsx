/* eslint-disable no-promise-executor-return */
/* eslint-disable no-else-return */
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import Image from 'next/legacy/image'
import { v4 as uuidv4 } from 'uuid'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/state'
import { toChecksumAddress } from 'ethereumjs-util'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import Gnosis from '@/public/svg/Gnosis.svg'
import Disperse from '@/public/svg/Disperse.svg'
import View, { Header } from '@/components-v2/templates/AuthenticatedView/AuthenticatedView'
import Typography from '@/components-v2/atoms/Typography'
import { yupResolver } from '@hookform/resolvers/yup'
import Button from '@/components-v2/atoms/Button'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { useWeb3React } from '@web3-react/core'
import SourceWallet from './components/MakePaymentStep/SectionSourceWallet'
import Recipients from './components/MakePaymentStep/SectionRecipients'
import ReviewPayment from './components/ReviewPaymentStep'
import { IMakePaymentForm } from './types'
import { api } from '@/api-v2'
import { useSetTokenApproval } from '@/hooks-v2/useSetTokenApproval'
import { DISPERSE_CONTRACT_MAP } from '@/constants-v2/contract-addresses'
import { BigNumber } from 'ethers'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { ImportRecipientsModal } from './components/ImportRecipientsModal'
import { useCheckBalance } from '@/hooks-v2/useCheckBalance'
import { selectNetworkRPCMap } from '@/slice/chains/chain-selectors'
import NotificationSending from '@/components/NotificationSending/NotificationSending'
import { SourceType } from '@/slice/wallets/wallet-types'
import { getDisperseContract, getErc20Contract } from '@/utils/contractHelpers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import useSafe from '@/hooks/useSafe'
import { usePostAnalysisForPayoutMutation, useBatchSendAnalysisMutation } from '@/api-v2/analysis-api'
import { isAllowed } from '@/hooks/contract'
import { addBreadcrumb } from '@sentry/nextjs'
import { log } from '@/utils-v2/logger'
import InsufficientBalanceModal from './components/InsufficientBalanceModal'
import { useUploadTxFileMutation } from '@/api-v2/old-tx-api'
import AddNewRecipientModal from '../Recipients/components/AddNewRecipientModal/AddNewRecipientModal'
import { EProcessStatus } from '../Organization/interface'
import { toast } from 'react-toastify'
import { selectVerifiedCryptocurrencies } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import * as yup from 'yup'
import { schema, sourceWalletSchema, walletAddressSchema } from './components/MakePaymentStep/form-schema'
import { isEmpty, uniq } from 'lodash'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import TokenApprovalModal from './components/TokenApprovalModal'
import {
  IPayment,
  PaymentStatus,
  usePostPaymentsMutation,
  useUpdatePaymentStatusToExecutedMutation,
  useUpdatePaymentStatusToExecutingMutation,
  useUpdatePaymentStatusToFailedMutation
} from '@/api-v2/payment-api'
import ContactTransactionModal from '../_deprecated/Transactions/components/ContactTransaction/ContactTransaction'
import { ImportDraftsModal } from './components/ImportDraftPaymentsModal'
import ReactTooltip from 'react-tooltip'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { makePaymentDraftsSelector } from '@/slice/drafts/drafts-selectors'
import { setMakePaymentDrafts } from '@/slice/drafts/drafts-slice'
import { useSelectAvailableSource } from '@/hooks-v2/make-payments/useSelectAvailableSource'
import { useSyncPendingTransactionsMutation } from '@/slice/wallets/wallet-api'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import AlertBanner from '@/components-v2/molecules/Alert/Alert'

interface ITokenApproval {
  tokenAddress: string
}

export enum SourceOfRecipient {
  MANUAL = 'manual',
  DRAFTS = 'drafts'
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function findFirstCoin(cryptocurrencies, selectedChainId) {
  for (let i = 0; i < cryptocurrencies.length; i++) {
    const currency = cryptocurrencies[i]
    for (let j = 0; j < currency.addresses.length; j++) {
      const address = currency.addresses[j]

      if (address.blockchainId === selectedChainId && address.type === 'Coin') {
        const coinInfo = currency.addresses.find(
          (item) => item.blockchainId === selectedChainId && item.type === 'Coin'
        )
        return { ...currency, native: coinInfo }
      }
    }
  }
  return null // Return null if no matching cryptocurrency is found
}

const MakePaymentView = () => {
  const walletToAddAsContact = useRef(null)
  const dispatch = useAppDispatch()
  const { account, library } = useWeb3React()
  const isShowingBanner = useAppSelector(showBannerSelector)
  const selectedChain = useAppSelector(selectedChainSelector)
  const makePaymentDrafts: IPayment[] = useAppSelector(makePaymentDraftsSelector)
  const isDraftTransactionsEnabled = useAppSelector((state) => selectFeatureState(state, 'isDraftTransactionsEnabled'))
  const NETWORK_RPC_MAP = useAppSelector(selectNetworkRPCMap)
  const [uploadFile] = useUploadTxFileMutation()
  const { sources, isLoading: isSourcesLoading } = useSelectAvailableSource()

  const uploadCsvModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const importDraftsModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const insufficientBalanceModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const tokenApprovalModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const importContactModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const [syncPendingTrigger] = useSyncPendingTransactionsMutation()
  const [sendingTransfer, setSendingTransfer] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [openAddRecipientModal, setOpenAddRecipientModal] = useState(false)
  const [status, setStatus] = useState<string>(EProcessStatus.PENDING)
  const [triggerBatchSendAnalysis] = useBatchSendAnalysisMutation()
  const [connectedAccountStatus, setConnectedAccountStatus] = useState<{
    connectedAccount: string
    isChanged: boolean
  }>()
  const [paymentIds, setPaymentIds] = useState<string[]>([])
  const { getBalance } = useCheckBalance()
  const safeService = useSafeServiceClient()
  const { safe, loadSafe } = useSafe()

  const {
    error: tokenApprovalError,
    isLoading: tokenApprovalLoading,
    setApproval,
    transaction: tokenApprovalTransaction
  } = useSetTokenApproval()
  const router = useRouter()
  const organizationId = useOrganizationId()
  const [error, setErrorMsg] = useState<any>('')
  const [step, setStep] = useState('create')
  const [preReviewStepsLoading, setPreReviewStepsLoading] = useState(false)
  const [tokensWithInsufficientBalance, setTokensWithInsufficientBalance] = useState({})
  const [isManualPayments, setIsManualPayments] = useState(false)
  const [isDraftPayments, setIsDraftPayments] = useState(false)
  const [threshold, setThreshold] = useState<number>()
  const [postPayments, postPaymentsResult] = usePostPaymentsMutation()
  const [postPaymentsAsExecuting, postPaymentsAsExecutingResult] = useUpdatePaymentStatusToExecutingMutation()
  const [postPaymentSuccess, postPaymentSuccessResult] = useUpdatePaymentStatusToExecutedMutation()
  const [postPaymentFailure, postPaymentFailureResult] = useUpdatePaymentStatusToFailedMutation()
  const [postPayoutAnalysis] = usePostAnalysisForPayoutMutation()
  const [triggerGetPrice] = useLazyGetTokenPriceQuery()
  const verifiedTokens = useAppSelector(selectVerifiedCryptocurrencies)
  const chartOfAccounts = useAppSelector(chartOfAccountsSelector)

  const { data: contact } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const defaultToken = useMemo(() => {
    const initialToken = findFirstCoin(verifiedTokens, selectedChain?.id)

    if (initialToken) {
      return {
        value: '',
        label: initialToken.symbol,
        src: initialToken.image?.thumb,
        type: initialToken.native?.type,
        address: initialToken.native?.address,
        decimal: initialToken.native?.decimal,
        publicId: initialToken.publicId
      }
    }
    return {
      value: '',
      label: 'ETH',
      src: 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/cryptocurrency-images/ETH_ethereum_71573a87-6766-433a-9c5e-b96526a78138_small.png',
      address: null,
      type: 'Coin',
      decimal: 18,
      publicId: '7ed5dadd-09ca-4844-9a47-2970d259f7ef'
    }
  }, [selectedChain, verifiedTokens])

  const methods = useForm<IMakePaymentForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      recipients: [
        {
          walletAddress: null,
          files: [],
          s3Files: [], // TODO-PENDING- Better naming
          amount: '',
          token: {
            value: '',
            label: defaultToken.label,
            src: defaultToken.src,
            address: defaultToken.address,
            type: defaultToken.type,
            decimal: defaultToken.decimal,
            publicId: defaultToken.publicId
          },
          chartOfAccounts: null,
          note: '',
          source: ''
        }
      ],
      notes: '',
      files: [],
      sourceWallet: {
        address: '',
        label: '',
        id: '',
        totalPrice: '',
        type: '',
        value: ''
      }
    },
    resolver: yupResolver(
      schema.clone().shape({
        sourceWallet: sourceWalletSchema
          .test(
            'check-multicurrency-for-eoa',
            'Multi-currency transfers are not supported for EOA wallets. Please choose a Safe wallet to transfer in multiple currencies.',
            (value) => {
              // @ts-ignore
              if (value.type?.toLowerCase() === SourceType.ETH) {
                const recipients = methods.getValues('recipients')
                const recipientCurrencies = uniq(recipients.map((recipient) => recipient.token.label))
                if (recipientCurrencies.length > 1) return false
                return true
              }
              return true
            }
          )
          .test('is-connect-wallet', 'Connect your wallet and select the wallet you want to pay from.', (value) => {
            if (account) return true
            return false
          }),
        recipients: schema.fields.recipients.clone().of(
          schema.fields.recipients.innerType.concat(
            yup.object().shape({
              walletAddress: walletAddressSchema.test(
                'check-eoa-send-to-safe',
                'Transfers to smart contract wallets via disperse is not yet supported. Please provide a different address.',
                async (value) => {
                  if (methods.getValues('sourceWallet')?.type?.toLowerCase() === SourceType.ETH) {
                    try {
                      const safeInfo = await safeService.getSafeInfo(toChecksumAddress(value.value))
                      return !safeInfo
                    } catch (err) {
                      log.debug(
                        'Exception when sending to a wallet address is a safe',
                        ['Exception when sending to a wallet address is a safe'],
                        { actualErrorObject: err },
                        `${window.location.pathname}`
                      )
                      return true
                    }
                  }
                  return true
                }
              ),
              token: yup.object().test('check-usdt-for-eoa', 'USDT cannot be paid from an EOA wallet', (value) => {
                if (
                  value.label === 'USDT' &&
                  methods.getValues('sourceWallet')?.type?.toLowerCase() === SourceType.ETH
                ) {
                  return false
                }
                return true
              })
            })
          )
        )
      })
    )
  })
  const { append: recipientAppend } = useFieldArray<any>({
    control: methods.control,
    name: 'recipients',
    keyName: 'id'
  })

  useEffect(() => {
    // TODO - In future move this to platform
    if (connectedAccountStatus?.connectedAccount !== account) {
      setConnectedAccountStatus({
        connectedAccount: account,
        isChanged: true
      })
    } else {
      setConnectedAccountStatus({
        connectedAccount: account,
        isChanged: false
      })
    }
  }, [account, step])

  useEffect(() => {
    const recipients = methods.getValues('recipients')
    recipients.forEach((recipient, index) => {
      methods.setValue(`recipients.${index}.token`, {
        value: '',
        label: defaultToken.label,
        src: defaultToken.src,
        address: defaultToken.address,
        type: defaultToken.type,
        decimal: defaultToken.decimal,
        publicId: defaultToken.publicId
      })
    })
  }, [selectedChain?.id])

  useEffect(() => {
    const setPaymentFromState = (paymentDetails) => {
      if (
        !isEmpty(paymentDetails) &&
        [PaymentStatus.PENDING, PaymentStatus.APPROVED, PaymentStatus.FAILED].includes(paymentDetails.status)
      ) {
        const tokenToAdd = verifiedTokens.find((token) => token.symbol === paymentDetails.cryptocurrency.symbol)
        const tokenAddress = tokenToAdd?.addresses?.find((address) => address?.blockchainId === selectedChain?.id)

        const chartOfAccount = chartOfAccounts?.find((coa) => coa?.id === paymentDetails?.chartOfAccount?.id) || null

        recipientAppend({
          walletAddress: {
            address: paymentDetails.destinationAddress,
            value: paymentDetails.destinationAddress,
            label: paymentDetails.destinationName,
            chainId: selectedChain?.id,
            isUnknown: !paymentDetails.destinationName,
            metadata: paymentDetails.destinationMetadata
          },
          source: SourceOfRecipient.DRAFTS,
          files: (paymentDetails?.files || [])?.map((file) => ({
            name: file.slice(37),
            id: file
          })),
          amount: paymentDetails.amount,
          token: {
            address: tokenAddress,
            publicId: tokenToAdd?.publicId,
            label: tokenToAdd?.symbol,
            src: tokenToAdd?.image?.thumb,
            value: tokenToAdd?.publicId
          },
          chartOfAccounts: chartOfAccount,
          note: paymentDetails.notes,
          draftMetadata: {
            status: paymentDetails.status,
            id: paymentDetails.id
          }
        })
      }
    }

    if (makePaymentDrafts?.length) {
      const existingRecipients = methods.getValues('recipients')
      methods.setValue(
        'recipients',
        existingRecipients.filter((item) => item?.walletAddress)
      )
      makePaymentDrafts.forEach((_draft, index) => {
        if (isEmpty(methods.getValues('recipients')?.find((recipient) => recipient?.draftMetadata?.id === _draft.id))) {
          setPaymentFromState(_draft)
        }
      })
      dispatch(setMakePaymentDrafts([]))
    }
  }, [makePaymentDrafts])

  // Trigger execution once new payments are created and/or existing payments are updated as executing
  useEffect(() => {
    // Both manual and draft payments are created
    if (
      isDraftPayments &&
      isManualPayments &&
      postPaymentsAsExecutingResult.isSuccess &&
      postPaymentsResult.isSuccess &&
      paymentIds.length > 0
    ) {
      triggerOnChainExecution()
    }
    // Only manual payments
    else if (postPaymentsResult.isSuccess && paymentIds.length > 0 && !isDraftPayments && isManualPayments) {
      triggerOnChainExecution()
    }
    // Only Draft Payments
    else if (postPaymentsAsExecutingResult.isSuccess && isDraftPayments && !isManualPayments) {
      triggerOnChainExecution()
    }
  }, [
    postPaymentsResult.isSuccess,
    paymentIds,
    isDraftPayments,
    isManualPayments,
    postPaymentsAsExecutingResult.isSuccess
  ])

  // If POST /payments or POST /payments/set-executing call fails don't allow the user to proceed with the payments.
  useEffect(() => {
    if (postPaymentsResult.isError || postPaymentsAsExecutingResult.isError) {
      setSendingTransfer(false)
      setShowErrorModal(true)
      // If posting fresh payments is successful but posting existing payments as executing fails
      // remove the paymentIds so on clicking retry new payment line items will be created
      setPaymentIds([])
    }
  }, [postPaymentsResult.isError, postPaymentsAsExecutingResult.isError])

  // For newly posted payments make sure to get the payment Ids
  // for subsequent set-executed and set-failed API calls
  useEffect(() => {
    if (postPaymentsResult.isSuccess) {
      setPaymentIds(postPaymentsResult.data.map((paymentDetail) => paymentDetail?.id))
    }
  }, [postPaymentsResult.isSuccess])

  // Once payments are successfully set as executed or failed
  // reset the paymentIds for the next transfer. This will be true even if the set-executed or set-failed API calls fail because the transfer will already have been put on chain and completed/failed and for our data the payment will be stuck in executing state which can be reconciled later.
  useEffect(() => {
    if (
      postPaymentSuccessResult.isSuccess ||
      postPaymentFailureResult.isSuccess ||
      postPaymentSuccessResult.isError ||
      postPaymentFailureResult.isError
    ) {
      setPaymentIds([]) // Reset payment ids in case user decides to make another payment
      setIsDraftPayments(false)
      setIsManualPayments(false)
    }
  }, [postPaymentSuccessResult, postPaymentFailureResult])

  useEffect(() => {
    if (
      account &&
      methods.getValues('sourceWallet')?.address &&
      methods.getValues('sourceWallet')?.type?.toLowerCase() === SourceType.GNOSIS
    ) {
      loadSafe(methods.getValues('sourceWallet').address)
    }
  }, [loadSafe, methods.getValues('sourceWallet')?.address, account])

  const sourceRef = useRef(null)
  const paymentsRef = useRef(null)

  useEffect(() => {
    if (shouldScroll) {
      const recipientErrors = methods.formState?.errors?.recipients?.filter((_error) => _error)
      if (methods.formState?.errors?.sourceWallet?.message) {
        sourceRef.current.scrollIntoView({ behavior: 'smooth' })
      } else if (recipientErrors?.length > 0) {
        paymentsRef.current.scrollIntoView({ behavior: 'smooth' })
      }
      setShouldScroll(false)
    }
  }, [methods.formState?.errors?.recipients, methods.formState?.errors?.sourceWallet?.message])

  // Remove token approval modal once token is approved
  useEffect(() => {
    if (!tokenApprovalError && !tokenApprovalLoading && tokenApprovalTransaction) {
      tokenApprovalModalProvider.methods.setIsOpen(false)
      setPreReviewStepsLoading(false)
    }
  }, [tokenApprovalTransaction, tokenApprovalLoading, tokenApprovalError])

  useEffect(() => {
    if (status === EProcessStatus.SUCCESS) {
      setOpenAddRecipientModal(false)
      toast.success('New recipient successfully added')
      setStatus('')
    }
    if (status === EProcessStatus.FAILED) {
      setOpenAddRecipientModal(false)
      toast.error(error || 'Add new recipient failed')
      setStatus('')

      log.error(
        'Error while adding a recipient on make payments page',
        ['Error while adding a recipient on make payments page'],
        {},
        `${window.location.pathname}`
      )
    }
  }, [status])

  const triggerOnChainExecution = async () => {
    // Check the source wallet and call the function accordingly
    if (methods.getValues('sourceWallet')?.type?.toLowerCase() === SourceType.GNOSIS) {
      await handleSendByGnosis()
    } else {
      await handleSendByEoa()
    }
  }

  const handleCreateRecipient = () => {
    setOpenAddRecipientModal(true)
  }

  const handleTokenApproval = async ({ tokenAddress }: ITokenApproval) => {
    const signer = library?.getSigner()

    const rpcUrl = NETWORK_RPC_MAP[selectedChain?.id][0]

    setApproval(tokenAddress, DISPERSE_CONTRACT_MAP[selectedChain?.id], '20', rpcUrl, signer)
  }

  const handleAcceptNavigateToPendingTab = () => {
    setShowSuccessModal(false)
    if (threshold !== 1) {
      router.push(`/${router.query.organizationId}/pendingApproval`)
    } else if (threshold === 1) {
      router.back()
    }
  }

  const handleNavigateToPrevPage = () => {
    setShowSuccessModal(false)
    router.push(`/${organizationId}/transactions`)
  }

  const handleContinueTransfer = () => {
    methods.reset({
      recipients: [
        {
          walletAddress: null,
          files: [],
          s3Files: [],
          amount: '',
          token: {
            value: '',
            label: defaultToken.label,
            src: defaultToken.src,
            address: defaultToken.address,
            type: defaultToken.type,
            decimal: defaultToken.decimal
          },
          chartOfAccounts: null,
          note: '',
          source: ''
        }
      ],
      notes: '',
      files: [],
      sourceWallet: methods.watch('sourceWallet')
    })

    setShowSuccessModal(false)
    setStep('create')
  }

  const handleError = () => {
    setShowErrorModal(false)
  }

  const getSafeThreshold = async (_address) => {
    const safeInfo = await safeService.getSafeInfo(_address)
    setThreshold(safeInfo.threshold)
  }

  // Execute transaction for EOA using Metamask and Disperse
  const handleSendByEoa = async () => {
    let txHash: string
    let decimals: number
    let executedTransaction: any
    let tokenPrice: number
    const addresses = methods.getValues('recipients').map((item) => item?.walletAddress?.value)
    const totalTokens = methods.getValues('recipients').reduce((prev, cur) => String(+prev + +cur.amount), '0')
    const signer = await library.getSigner()
    const disperse = getDisperseContract(DISPERSE_CONTRACT_MAP[selectedChain?.id], signer)
    if (disperse) {
      const tokenToSend = methods.getValues('recipients')[0].token

      try {
        if (tokenToSend?.address && tokenToSend?.type !== 'Coin') {
          const contract = getErc20Contract(tokenToSend?.address, signer)
          try {
            const result = await triggerGetPrice({
              params: {
                cryptocurrencyId: tokenToSend?.publicId,
                fiatCurrency: 'USD',
                date: new Date().toISOString()
              }
            })
            tokenPrice = result?.data?.data
          } catch (err) {
            log.error(
              'Error while fetching token price from prices API - Disperse',
              ['Error while fetching token price from prices API - Disperse'],
              { actualErrorObject: err && JSON.stringify(err) },
              `${window.location.pathname}`
            )
            tokenPrice = 0 // Set to zero in case of error so the total amount column in the analytics table will be 0
          }

          decimals = await contract.decimals()
          const amount = methods
            .getValues('recipients')
            .map((item) => parseUnits(item.amount.toString(), decimals).toString())

          try {
            const estimateGas = await disperse.estimateGas.disperseToken(tokenToSend.address, addresses, amount)
            executedTransaction = await disperse.disperseToken(tokenToSend.address, addresses, amount, {
              value: estimateGas
            })
          } catch (e: any) {
            executedTransaction = await disperse.disperseToken(tokenToSend.address, addresses, amount)
          }
        } else {
          const totalAmount = methods
            .getValues('recipients')
            .map((item) => item.amount)
            .reduce((a, b) => a.add(BigNumber.from(parseEther(b.toString()))), BigNumber.from(0))

          const selectedToken = methods.getValues('recipients')[0].token
          try {
            const result = await triggerGetPrice({
              params: {
                cryptocurrencyId: selectedToken?.publicId,
                fiatCurrency: 'USD',
                date: new Date().toISOString()
              }
            })
            tokenPrice = result?.data?.data
          } catch (err) {
            log.error(
              'Error while fetching token price from prices API',
              ['Error while fetching token price from prices API'],
              { actualErrorObject: err && JSON.stringify(err) },
              `${window.location.pathname}`
            )
            tokenPrice = 0 // Set to zero in case of error so the total amount column in the analytics table will be 0
          }
          executedTransaction = await disperse.disperseEther(
            addresses,
            methods.getValues('recipients').map((item) => parseEther(item.amount).toString()),
            {
              value: totalAmount.toString()
            }
          )
        }
        await executedTransaction.wait()
        txHash = executedTransaction.hash

        // Set successful payments as executed
        const successfulPayments = []
        const successfulManualPayments = paymentIds?.map((paymentId) => ({
          id: paymentId,
          hash: txHash
        }))
        const draftsData = []
        const successfulDraftPayments = methods
          .getValues('recipients')
          .filter((recipient) => {
            if (recipient.source === SourceOfRecipient.DRAFTS) {
              draftsData.push(recipient)
              return recipient
            }
            return false
          })
          ?.map((recipient) => ({ id: recipient?.draftMetadata?.id, hash: txHash }))
        successfulPayments.push(successfulManualPayments)
        successfulPayments.push(successfulDraftPayments)
        const uuid = uuidv4()
        const salt = new Date().getTime()
        const analysisData = draftsData.map((payment) => ({
          eventType: 'EXECUTED_DRAFT_PAYMENT',
          metadata: {
            type: 'eoa',
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

        triggerBatchSendAnalysis(analysisData)

        postPaymentSuccess({
          params: {
            organizationId
          },
          body: successfulPayments.flat()
        })

        // Post analysis for the successful payments
        postPayoutAnalysis({
          blockchainId: selectedChain?.id,
          type: 'disperse',
          sourceType: 'eoa_wallet',
          sourceAddress: methods.getValues('sourceWallet').value,
          sourceWalletId: methods.getValues('sourceWallet').id,
          hash: txHash, // TODO-PENDING Confirm if we will be sending this
          applicationName: 'full_app',
          totalLineItems: methods.getValues('recipients').length,
          notes: methods.getValues('notes'),
          lineItems: methods.getValues('recipients').map((recipient) => ({
            address: recipient.walletAddress.address,
            cryptocurrencyId: recipient.token.publicId,
            amount: recipient.amount,
            chartOfAccountId: recipient?.chartOfAccounts?.value,
            notes: recipient?.note,
            files: recipient?.s3Files
          })),
          totalAmount: (Number(totalTokens) * tokenPrice).toFixed(2),
          valueAt: new Date().toISOString()
        })

        setShowSuccessModal(false)
        setSendingTransfer(false)
        setShowSuccessModal(true)
      } catch (errorMsg: any) {
        addBreadcrumb({
          category: 'HQ-Log',
          data: {
            organizationId,
            chain: selectedChain?.id,
            sourceAddress: methods.getValues('sourceWallet').value,
            recipients: methods.getValues('recipients').map((recipient) => ({
              address: recipient.walletAddress.address,
              cryptocurrencyId: recipient.token.publicId,
              amount: recipient.amount,
              chartOfAccountId: recipient?.chartOfAccounts?.value,
              notes: recipient?.note,
              files: recipient?.s3Files
            })),
            comment: methods.getValues('notes'),
            numberOfRecipients: methods.getValues('recipients')?.length
          }
        })

        // Set status for failed payments
        const failedPayments = []
        const failedManualPayments = paymentIds?.map((paymentId) => paymentId)
        const failedDraftPayments = methods
          .getValues('recipients')
          .filter((recipient) => recipient.source === SourceOfRecipient.DRAFTS)
          ?.map((recipient) => recipient?.draftMetadata?.id)
        failedPayments.push(failedManualPayments)
        failedPayments.push(failedDraftPayments)

        postPaymentFailure({
          params: {
            organizationId
          },
          body: {
            ids: failedPayments.flat()
          }
        })

        log.error(
          'Error while sending a transfer via Metamask',
          ['Error while sending a transfer via Metamask'],
          { actualErrorObject: JSON.stringify(errorMsg) },
          `${window.location.pathname}`
        )
        setShowErrorModal(true)
        setSendingTransfer(false)
        if (!errorMsg.message.includes('isExecuted')) {
          setErrorMsg(errorMsg.code as string)
        }
      }
    }
  }

  // Execute transaction for Safe
  const handleSendByGnosis = async () => {
    if (safe) {
      let transactionExecuted
      const transactions = []
      let txHash: string
      let safeTxHash: string

      await Promise.all(
        /* eslint-disable consistent-return */
        methods.getValues('recipients').map(async (recipient) => {
          try {
            if (recipient.token?.address) {
              const contract = getErc20Contract(recipient.token?.address, library?.getSigner())

              const decimals = await contract.decimals()

              const encodeData = contract.interface.encodeFunctionData('transfer', [
                recipient.walletAddress.address,
                parseUnits(recipient.amount.toString().replace(/\s/g, ''), decimals).toString()
              ])

              transactions.push({
                to: toChecksumAddress(recipient.token?.address),
                data: encodeData,
                value: '0'
              })
            } else {
              transactions.push({
                to: toChecksumAddress(recipient.walletAddress.address),
                data: '0x',
                value: parseEther(recipient.amount.toString().replace(/\s/g, '')).toString()
              })
            }
          } catch (err) {
            log.error(
              'Error while mapping recipients to safe transactions - Before putting it on chain to Safe',
              ['Error while mapping recipients to safe transactions - Before putting it on chain to Safe'],
              { actualErrorObject: JSON.stringify(err) },
              `${window.location.pathname}`
            )
            setSendingTransfer(false)
            setShowErrorModal(true)

            // Set status for failed payments
            const failedPayments = []
            const failedManualPayments = paymentIds?.map((paymentId) => paymentId)
            const failedDraftPayments = methods
              .getValues('recipients')
              .filter((recipientObj) => recipientObj.source === SourceOfRecipient.DRAFTS)
              ?.map((recipientObject) => recipientObject?.draftMetadata?.id)
            failedPayments.push(failedManualPayments)
            failedPayments.push(failedDraftPayments)

            postPaymentFailure({
              params: {
                organizationId
              },
              body: {
                ids: failedPayments.flat()
              }
            })

            return new Promise((resolvePr, reject) => reject())
          }
        })
      )
      try {
        // ------------------- Calculate Total USD amount --------------
        const cryptocurrencies = methods.getValues('recipients').map((recipient) => recipient.token)
        const cryptoCurrencyPriceMap = {}
        try {
          await Promise.all(
            cryptocurrencies.map(async (cryptocurrency) => {
              const price = await triggerGetPrice({
                params: {
                  cryptocurrencyId: cryptocurrency?.publicId,
                  fiatCurrency: 'USD',
                  date: new Date().toISOString()
                }
              })

              cryptoCurrencyPriceMap[cryptocurrency?.publicId] = price?.data?.data
            })
          )
        } catch (err) {
          log.error(
            'Error while fetching token price from prices API - Safe',
            ['Error while fetching token price from prices API - Safe'],
            { actualErrorObject: err && JSON.stringify(err) },
            `${window.location.pathname}`
          )
        }

        // Find payment total based on all line items
        const paymentTotal = await methods.getValues('recipients')?.reduce((acc, user) => {
          const token = user?.token?.publicId
          const tokenAmount = parseFloat(user?.amount)
          const tokenPrice = cryptoCurrencyPriceMap[token]
          const userValue = tokenAmount * tokenPrice
          // Add to total value
          acc += userValue
          return acc
        }, 0)
        // ---------------------------------------------------------------
        const nonce = await safeService.getNextNonce(methods.getValues('sourceWallet').address)

        if (transactions && transactions.length > 0) {
          const safeTransaction = await safe.createTransaction({
            safeTransactionData: transactions,
            options: { nonce }
          })
          const safeInfo = await safeService.getSafeInfo(methods.getValues('sourceWallet').address)
          safeTxHash = await safe.getTransactionHash(safeTransaction)
          setThreshold(safeInfo.threshold)
          if (safeInfo.threshold !== 1) {
            const signedTransaction = await safe.signTypedData(safeTransaction)

            const transactionConfig = {
              safeAddress: methods.getValues('sourceWallet').address,
              safeTransactionData: safeTransaction.data,
              safeTxHash,
              senderAddress: account,
              senderSignature: signedTransaction.data
            }

            await safeService.proposeTransaction(transactionConfig)
            await safeService.confirmTransaction(safeTxHash, signedTransaction.data)
          } else {
            transactionExecuted = await safe.executeTransaction(safeTransaction)
            const { hash } = transactionExecuted
            txHash = hash
          }
          const successfulPayments = []
          const successfulManualPayments = paymentIds?.map((paymentId) => ({
            id: paymentId,
            hash: txHash,
            safeHash: safeTxHash
          }))
          const successfulDraftPayments = methods
            .getValues('recipients')
            .filter((recipient) => recipient.source === SourceOfRecipient.DRAFTS)
            ?.map((recipient) => ({
              id: recipient?.draftMetadata?.id,
              hash: txHash,
              safeHash: safeTxHash,
              ...recipient
            }))
          successfulPayments.push(successfulManualPayments)
          successfulPayments.push(successfulDraftPayments)

          const uuid = uuidv4()
          const salt = new Date().getTime()
          const analysisData = successfulPayments.flat().map((payment) => ({
            eventType: 'EXECUTED_DRAFT_PAYMENT',
            metadata: {
              type: 'safe',
              queued: safeInfo?.threshold !== 1,
              id: payment?.draftMetadata?.id,
              batchId: `${salt}-${uuid}`,
              tokenAmount: payment.amount,
              // TODO - Fix typing
              // @ts-ignore
              fiatAmountUSD: (Number(payment.amount) * cryptoCurrencyPriceMap[payment.token?.id]).toFixed(2),
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

          triggerBatchSendAnalysis(analysisData)

          postPaymentSuccess({
            params: {
              organizationId
            },
            body: successfulPayments.flat()
          })

          postPayoutAnalysis({
            blockchainId: selectedChain?.id,
            type: 'safe',
            sourceType: 'gnosis_safe',
            sourceAddress: methods.getValues('sourceWallet').value,
            sourceWalletId: methods.getValues('sourceWallet').id,
            hash: txHash, // TODO-PENDING Confirm if we will be sending this
            applicationName: 'full_app',
            totalLineItems: methods.getValues('recipients').length,
            notes: methods.getValues('notes'),
            lineItems: methods.getValues('recipients').map((recipient) => ({
              address: recipient.walletAddress.address,
              cryptocurrencyId: recipient.token.publicId,
              amount: recipient.amount,
              chartOfAccountId: recipient?.chartOfAccounts?.value,
              notes: recipient?.note,
              files: recipient?.s3Files
            })),
            totalAmount: paymentTotal.toFixed(2),
            valueAt: new Date().toISOString()
          })
        }
        // TODO - Adding this temporarily to fix the issue of the transaction not being added to the transactions list
        syncPendingTrigger({ organisationId: organizationId })
          .unwrap()
          .then(async () => {
            await sleep(5000)
            dispatch(api.util.invalidateTags(['pending-transactions']))
            setSendingTransfer(false)
            setShowSuccessModal(true)
          })
      } catch (errorMsg: any) {
        setSendingTransfer(false)
        setShowErrorModal(true)

        addBreadcrumb({
          category: 'HQ-Log',
          data: {
            organizationId,
            chain: selectedChain?.id,
            sourceAddress: methods.getValues('sourceWallet').value,
            recipients: methods.getValues('recipients').map((recipient) => ({
              address: recipient.walletAddress.address,
              cryptocurrencyId: recipient.token.publicId,
              amount: recipient.amount,
              chartOfAccountId: recipient?.chartOfAccounts?.value,
              notes: recipient?.note,
              files: recipient.files.map((file) => file.name)
            })),
            comment: methods.getValues('notes'),
            numberOfRecipients: methods.getValues('recipients')?.length
          }
        })

        // Set status for failed payments
        const failedPayments = []
        const failedManualPayments = paymentIds?.map((paymentId) => paymentId)
        const failedDraftPayments = methods
          .getValues('recipients')
          .filter((recipient) => recipient.source === SourceOfRecipient.DRAFTS)
          ?.map((recipient) => recipient?.draftMetadata?.id)
        failedPayments.push(failedManualPayments)
        failedPayments.push(failedDraftPayments)

        postPaymentFailure({
          params: {
            organizationId
          },
          body: {
            ids: failedPayments.flat()
          }
        })

        log.error(
          'Error when sending transfer via Gnosis',
          ['Error when sending transfer via Gnosis'],
          { actualErrorObject: JSON.stringify(errorMsg) },
          `${window.location.pathname}`
        )

        if (
          !errorMsg.message.includes('Contract with a Signer cannot override') &&
          !errorMsg.message.includes('isExecuted')
        ) {
          setErrorMsg(errorMsg as string)
        }
      }
    }
  }

  // Check how many are draft payments and how many are manual new line items
  // If draft - set them to executing
  // If manual - create new with the status executing
  // only and only after both calls are complete start the payment process
  // If either of the call fails then we do not let the user proceed with the payment
  // and on clicking retry we need to check which call failed and how to reconcile that
  // creating new line items would be okay for manual ones I guess

  const handleSendFunds = async () => {
    setSendingTransfer(true)
    const draftPayments = methods
      .getValues('recipients')
      .filter((recipient) => recipient.source === SourceOfRecipient.DRAFTS)
    const newlyCreatedPayments = methods
      .getValues('recipients')
      .filter((recipient) => recipient.source === SourceOfRecipient.MANUAL)

    if (newlyCreatedPayments.length > 0) {
      setIsManualPayments(true)
      const postPaymentArray = newlyCreatedPayments.map((recipient) => ({
        destinationAddress: recipient.walletAddress.address,
        destinationName: recipient.walletAddress.label,
        destinationMetadata: recipient.walletAddress?.metadata?.id
          ? {
              id: recipient.walletAddress?.metadata?.id,
              type: recipient.walletAddress?.metadata?.type
            }
          : null,
        status: 'executing',
        paymentType: methods.getValues('sourceWallet').type === 'gnosis' ? 'safe' : 'disperse',
        cryptocurrencyId: recipient.token.publicId,
        amount: recipient.amount,
        blockchainId: selectedChain?.id,
        sourceWalletId: methods.getValues('sourceWallet').id,
        chartOfAccountId: recipient?.chartOfAccounts?.value,
        notes: recipient?.note,
        files: recipient?.s3Files,
        remarks: methods.getValues('notes')
      }))
      try {
        postPayments({
          params: {
            organizationId
          },
          body: postPaymentArray
        })
      } catch (err) {
        console.log(err)
      }
    }

    if (draftPayments.length > 0) {
      setIsDraftPayments(true)
      const paymentIdsFromDrafts = draftPayments.map((recipient) => recipient?.draftMetadata?.id)
      try {
        postPaymentsAsExecuting({
          params: {
            organizationId
          },
          body: {
            ids: paymentIdsFromDrafts,
            blockchainId: selectedChain?.id,
            sourceWalletId: methods.getValues('sourceWallet').id,
            paymentType: methods.getValues('sourceWallet').type === 'gnosis' ? 'safe' : 'disperse',
            remarks: methods.getValues('notes'),
            proposedTransactionHash: '0x' // Placeholder
          }
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  const handleFormSubmit = async () => {
    // This will only trigger as long as Yup validations on Create Payment Step passes

    if (step === 'create') {
      setPreReviewStepsLoading(true)
      const _currentSource = methods.getValues('sourceWallet')
      const _recentToken = methods.getValues('recipients')[0].token

      // TODO - Temp hack around matic token
      if (_currentSource?.type !== 'gnosis' && _recentToken?.address && _recentToken?.type !== 'Coin') {
        const contract = getErc20Contract(_recentToken?.address, library?.getSigner())

        const isAllowance = await isAllowed(contract, account, DISPERSE_CONTRACT_MAP[selectedChain?.id])

        if (!isAllowance) {
          tokenApprovalModalProvider.methods.setIsOpen(true)
          return
        }
        tokenApprovalModalProvider.methods.setIsOpen(false)
      } else {
        tokenApprovalModalProvider.methods.setIsOpen(false)
      }

      let countOverBalance = {}
      const amountMap = new Map()

      methods.getValues('recipients').forEach((recipient) => {
        const tokenSymbol = recipient.token.label
        if (amountMap.has(tokenSymbol)) {
          const currentObj = amountMap.get(tokenSymbol)
          const updatedValue = parseFloat(currentObj.amount) + parseFloat(recipient.amount)

          return amountMap.set(tokenSymbol, { ...currentObj, amount: updatedValue.toString() })
        }

        return amountMap.set(tokenSymbol, {
          symbol: tokenSymbol,
          amount: recipient.amount,
          availableBalanceInWallet: 0,
          tokenAddress: recipient.token?.address,
          tokenDecimal: recipient.token?.decimal
        })
      })

      const keysInMap = []
      amountMap.forEach(async (amountObj, key) => {
        keysInMap.push(key)
      })

      await Promise.all(
        keysInMap.map(async (key) => {
          const currentObj = amountMap.get(key)
          const rpcUrl = NETWORK_RPC_MAP[selectedChain?.id][0]
          const availableBalance = await getBalance(_currentSource?.address, currentObj.tokenAddress, rpcUrl, {
            decimals: currentObj.tokenDecimal
          })

          amountMap.set(key, {
            ...currentObj,
            availableBalanceInWallet: availableBalance
          })
        })
      )

      // TODO- This can be better as it's getting redundant but that's an optimization for later
      amountMap.forEach((amountObj, key) => {
        if (parseFloat(amountObj.amount) > parseFloat(amountObj.availableBalanceInWallet)) {
          countOverBalance = { ...countOverBalance, [key]: amountObj }
        }
      })

      if (Object.entries(countOverBalance).length > 0) {
        setTokensWithInsufficientBalance(countOverBalance)
        insufficientBalanceModalProvider.methods.setIsOpen(true)
      } else {
        const promisesToFileUpload = methods.getValues('recipients').map(async (recipient, index) => {
          const formData = new FormData()
          recipient.files.forEach((file) => {
            formData.append('files', file)
          })
          const result = await uploadFile({ files: formData }).unwrap()
          if (result?.data.length > 0) {
            methods.setValue(`recipients.${index}.s3Files`, result.data)
          }
        })

        await Promise.all(promisesToFileUpload)
        setPreReviewStepsLoading(false)
        setStep('review')
      }
    } else {
      handleSendFunds()
    }
  }
  const handleBackToCreate = () => {
    setStep('create')
  }

  const renderFooterPrimaryLabel = () => {
    const sourceWalletType = methods.getValues('sourceWallet').type.toLowerCase()

    if (
      step === 'review' &&
      (sourceWalletType === SourceType.ETH || (sourceWalletType === SourceType.GNOSIS && threshold === 1))
    ) {
      return 'Confirm & Pay'
    }
    if (step === 'review' && sourceWalletType === SourceType.GNOSIS) {
      return 'Confirm & Queue'
    }
    return 'Next: Review Payment'
  }

  const handleOnClickUploadCSV = () => {
    uploadCsvModalProvider.methods.setIsOpen(true)
  }
  const handleClickImportDrafts = () => {
    importDraftsModalProvider.methods.setIsOpen(true)
  }

  const onClickAddNewContact = (_address, _index) => {
    walletToAddAsContact.current = { address: _address, index: _index }
    importContactModalProvider?.methods?.setIsOpen(true)
  }

  // On adding contact
  const onAddContactSuccess = (_contact) => {
    const contacts = methods.watch('recipients')

    if (contacts) {
      contacts.forEach((_item, _index) => {
        if (_item.walletAddress.address === walletToAddAsContact.current?.address) {
          const contactMap = {
            ..._item.walletAddress,
            label: _contact.type === 'individual' ? _contact.contactName : _contact.organizationName,
            address: walletToAddAsContact.current?.address,
            isUnknown: false,
            metadata: {
              id: _contact.publicId,
              type: 'recipient_address'
            }
          }
          methods.setValue(`recipients.${_index}.walletAddress`, contactMap)
        }
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)}>
        <Header>
          <Header.Left>
            <Header.Left.Title>Make Payment</Header.Left.Title>
            <DividerVertical height="h-6" space="mx-4" />

            <Typography variant="caption" styleVariant="semibold" classNames="text-gray-700">
              Powered by
            </Typography>
            <div className="px-1">
              <Image src={Disperse} width={14} height={14} />
            </div>
            <Typography variant="caption" styleVariant="underline" href="https://disperse.app/">
              Disperse
            </Typography>
            <Typography variant="caption" classNames="text-gray-700 text-sm px-2">
              &amp;
            </Typography>
            <div className="pr-1">
              <Image src={Gnosis} width={14} height={14} />
            </div>
            <Typography variant="caption" styleVariant="underline" href="https://app.safe.global/welcome">
              Safe
            </Typography>
          </Header.Left>
        </Header>
        <View.Content className={isShowingBanner ? '!h-[calc(100vh-328px)]' : '!h-[calc(100vh-260px)]'}>
          <div className="mb-4">
            <AlertBanner isVisible variant="warning">
              <AlertBanner.Text>
                Please be informed that{' '}
                <a
                  rel="noreferrer"
                  href="https://blog.ethereum.org/2024/02/27/dencun-mainnet-announcement"
                  target="_blank"
                  className="underline cursor-pointer font-semibold"
                >
                  Ethereum’s Dencun Upgrade
                </a>{' '}
                is happening today at approximately 13.55 UTC/ 2155 SGT. We recommend to not make any transfers during
                that period to avoid potential network instability. Other features of LedgerX (ledgerx.com) will still
                operate as per normal.
              </AlertBanner.Text>
            </AlertBanner>
          </div>
          {step === 'create' && (
            <>
              <div ref={sourceRef} className="flex gap-6 mb-3">
                <SourceWallet
                  availableSource={sources}
                  isSourcesLoading={isSourcesLoading}
                  connectedAccount={account}
                  isChangedAccount={connectedAccountStatus?.isChanged}
                  getSafeThreshold={getSafeThreshold}
                />
              </div>
              <div ref={paymentsRef} className="flex rounded-2xl gap-6 mb-3">
                <Recipients
                  selectedChain={{
                    blockchain: selectedChain?.id,
                    chainId: selectedChain?.chainId
                  }}
                  recipients={contact?.items || []}
                  onClickUploadCSV={handleOnClickUploadCSV}
                  onClickImportDrafts={handleClickImportDrafts}
                  onCreateRecipient={handleCreateRecipient}
                  sourceWalletType={methods.getValues('sourceWallet')?.type}
                  onClickAddNewContact={onClickAddNewContact}
                  sectionTitle="Add the payments you want to make"
                />
              </div>
            </>
          )}
          {step === 'review' && <ReviewPayment formData={methods.getValues()} />}
        </View.Content>
        <View.Footer>
          <section id="footer-buttons" className="flex flex-row gap-4 p-4 pt-0 bg-white">
            {step === 'review' && <Button onClick={handleBackToCreate} variant="grey" label="Back" height={48} />}
            <Button
              data-tip="disable-make-payment-cta"
              data-for="disable-make-payment-cta"
              variant="black"
              height={48}
              type="submit"
              onClick={() => {
                setShouldScroll(true)
              }}
              loadingWithLabel={preReviewStepsLoading}
              label={renderFooterPrimaryLabel()}
              disabled={
                preReviewStepsLoading ||
                !methods.getValues('sourceWallet').id ||
                !methods.getValues('recipients').some((recipient) => recipient.walletAddress && recipient.amount)
              }
            />
            {(!methods.getValues('sourceWallet').id ||
              !methods.getValues('recipients').some((recipient) => recipient.walletAddress && recipient.amount)) && (
              <ReactTooltip
                id="disable-make-payment-cta"
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg"
              >
                Please connect a wallet and add a recipient address and amount to proceed
              </ReactTooltip>
            )}
          </section>
        </View.Footer>
      </form>
      <ImportRecipientsModal provider={uploadCsvModalProvider} />
      {isDraftTransactionsEnabled && <ImportDraftsModal provider={importDraftsModalProvider} />}
      <TokenApprovalModal
        provider={tokenApprovalModalProvider}
        token={methods.getValues('recipients')[0].token.label}
        sourceWalletName={methods.getValues('sourceWallet').label}
        handleOnClickCancelForApproval={() => {
          tokenApprovalModalProvider.methods.setIsOpen(false)
          setPreReviewStepsLoading(false)
        }}
        handleTokenApprovalForSourceWallet={() => {
          const recipient = methods.getValues('recipients')[0]
          const tokenAddress = recipient.token.address
          handleTokenApproval({ tokenAddress })
        }}
        tokenApprovalLoading={tokenApprovalLoading}
      />
      {openAddRecipientModal && (
        <AddNewRecipientModal
          setError={setErrorMsg}
          setStatus={setStatus}
          showModal={openAddRecipientModal}
          setShowModal={setOpenAddRecipientModal}
          selectedChain={selectedChain}
        />
      )}
      <InsufficientBalanceModal
        provider={insufficientBalanceModalProvider}
        tokensWithInsufficientBalance={tokensWithInsufficientBalance}
        setPreReviewStepsLoading={setPreReviewStepsLoading}
      />
      <NotificationSending
        showModal={sendingTransfer}
        setShowModal={setSendingTransfer}
        title="Sending transfer."
        subTitle="Please wait until the transfer is completed."
      />
      <ContactTransactionModal
        showModal={importContactModalProvider?.state?.isOpen}
        setShowModal={importContactModalProvider?.methods?.setIsOpen}
        contactAddress={walletToAddAsContact.current?.address}
        onSuccess={onAddContactSuccess}
      />
      {showSuccessModal ? (
        methods.getValues('sourceWallet').type.toLowerCase() === SourceType.ETH ? (
          <NotificationPopUp
            type="success"
            title="Transfer successfully sent!"
            description="Thanks for using our transfer service."
            option
            setShowModal={setShowSuccessModal}
            showModal={showSuccessModal}
            declineText="Skip"
            acceptText="Send Another Transfer"
            onClose={handleNavigateToPrevPage}
            onAccept={handleContinueTransfer}
          />
        ) : (
          methods.getValues('sourceWallet').type.toLowerCase() === SourceType.GNOSIS && (
            <NotificationPopUp
              type="success"
              title={`${threshold === 1 ? 'Transfer successfully sent!' : 'Transfer submitted to pending queue!'}`}
              description={`${
                threshold === 1
                  ? 'Thanks for using our transfer service.'
                  : 'Other organization members will need to approve the transaction in order for it to be executed'
              }`}
              option
              setShowModal={setShowSuccessModal}
              showModal={showSuccessModal}
              declineText={`${threshold === 1 ? 'Skip' : 'Continue to Pending Queue'}`}
              acceptText="Send Another Transfer"
              onClose={handleAcceptNavigateToPendingTab}
              onAccept={handleContinueTransfer}
            />
          )
        )
      ) : (
        <NotificationPopUp
          type="error"
          title="Unable to send transfer."
          description="There was an issue in transfer. Please try again."
          declineText="Cancel"
          option
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={handleError}
          onAccept={() => {
            setShowErrorModal(false)
          }}
        />
      )}
    </FormProvider>
  )
}
export default MakePaymentView
