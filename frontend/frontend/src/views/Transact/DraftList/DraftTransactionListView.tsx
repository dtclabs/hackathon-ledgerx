import { useAttachAnnotationMutation, useDeleteAnnotationMutation } from '@/api-v2/financial-tx-api'
import { useGetMembersQuery } from '@/api-v2/members-api'
import { useUploadTxFileMutation, IPreviewFileRequest } from '@/api-v2/old-tx-api'

import {
  CurrencyType,
  IPayment,
  ISubmitPaymentBody,
  PaymentStatus,
  useDeletePaymentMutation,
  useFakeBulkDeletePaymentsMutation,
  useFakeBulkSetApprovedMutation,
  useFakeBulkSetCreatedMutation,
  useFakeBulkSetPendingMutation,
  useFakeBulkUpdateReviewerMutation,
  useGetPaymentQuery,
  useUpdatePaymentMutation,
  useUpdatePaymentStatusToApprovedMutation,
  useUpdatePaymentStatusToCreatedMutation,
  useUpdatePaymentStatusToPendingMutation
} from '@/api-v2/payment-api'
import { useLazyGetTokenPriceQuery } from '@/api-v2/pricing-api'
import { SideModal } from '@/components-v2/SideModal'
import { Tabs } from '@/components-v2/Tab-v2'
import Typography from '@/components-v2/atoms/Typography'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { ProfileInfoDisplay } from '@/components-v2/molecules/ProfileInfoDisplay'
import { Table } from '@/components-v2/molecules/Tables/TableV2'
import { useTableHook } from '@/components-v2/molecules/Tables/TableV2/table-v2-ctx'
import { Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import TabItem from '@/components/TabsComponent/TabItem'
import AlertIcon from '@/public/svg/icons/alert-circle-icon.svg'
import { groupedChartOfAccounts, selectChartOfAccountsMap } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { selectVerifiedCryptocurrencyMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { setMakePaymentDrafts } from '@/slice/drafts/drafts-slice'
import { updateReviewData } from '@/slice/transfer/transfer.slice'
import { fiatCurrenciesMapSelector, orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useGetTagsQuery,
  useUpdateTagMutation
} from '@/slice/tags/tags-api'
import { useAppDispatch, useAppSelector } from '@/state'
import { dayInMilliseconds, getUTCTDate } from '@/utils-v2/dateHelper'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { IWalletAddressItem } from '@/views/MakePayment2/types'
import ContactTransactionModal from '@/views/_deprecated/Transactions/components/ContactTransaction/ContactTransaction'
import { yupResolver } from '@hookform/resolvers/yup'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import DeleteDraftModal from './components/DeleteDraftModal'
import DiscardChangesModal from './components/DiscardChangesModal'
import { DraftTransactionDetail } from './components/DraftTransactionDetail'
import DraftTransactionListFilter, { IOption } from './components/DraftTransactionFilter'
import DraftTransactionListLoader from './components/DraftTransactionListLoader'
import DraftTransactionRow from './components/DraftTransactionRow/DraftTransactionRow'
import EmptySearchResultNoData from './components/EmptySearchResultNoData'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import TopBulkActions from './components/TopBulkActions'
import { CREATE_DRAFT_OPTIONS, HEADERS, HEADERS_FAILED_TAB, HEADERS_WITHOUT_REVIEWER } from './copy'
import { amountSchemaForDrafts, amountSchemaForReview, recipientSchema } from './validateSchema'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { RecipientType } from '@/views/Transfer/Transfer.types'
import { extractNameFromUUIDString } from '@/utils-v2/string-utils'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import useCreateDrafts from '@/views/CreateDraftPayment/hooks/useCreateDrafts'
import { validationSchema } from '@/views/CreateDraftPayment/hooks/useDraftForm/draft-form.schema'
import Button from '@/components-v2/atoms/Button'
import SearchIcon from '@/public/svg/search-md.svg'
import FilterIcon from '@/public/svg/filter-funnel-02.svg'
import TextField from '@/components/TextField/TextField'
import DraftFilter from './components/DraftFilter'
import _, { debounce } from 'lodash'
import { TabsV3 } from '@/components-v2/Tab-v3'

export interface IDraftFilters {
  search: string
  accounts: IOption[]
  reviewers: IOption[]
  cryptocurrencies: IOption[]
  startDate: string
  endDate: string
  destinationCurrencyType: { value: CurrencyType; label: string }[]
}
export interface IDraftDetailForm {
  recipient: IWalletAddressItem
  account: { value: string; label: string }
  amount: string
  token: { value: string; label: string; src: any }
  notes: string
  files: any[]
  reviewer?: any
  annotations?: { value: string; label: string }[]
  isSubmitForReview?: boolean
  destinationCurrencyType: CurrencyType
}

const DraftTransactionListView = () => {
  const methods = useForm<IDraftDetailForm>({
    mode: 'onChange',
    defaultValues: { isSubmitForReview: false },
    resolver: yupResolver(validationSchema)
  })

  const { chartOfAccountsOptions, bankAccountOptions, currenciesOptions, tokenOptions, contactOptions } =
    useCreateDrafts()

  const router = useRouter()
  const tempSelectedItemId = useRef<string>(null)
  const tempUpdatedSelectData = useRef<Partial<IPayment>>(null)
  const organizationId = useOrganizationId()
  const provider = useTableHook({})
  const settings = useAppSelector(orgSettingsSelector)
  const verifiedCryptoCurrencyMap = useAppSelector(selectVerifiedCryptocurrencyMap)
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))
  const selectedChain = useAppSelector(selectedChainSelector)
  const dispatch = useAppDispatch()
  const showBanner = useAppSelector(showBannerSelector)
  const groupedCOAs: any = useAppSelector(groupedChartOfAccounts)
  const chainIcons = useAppSelector(selectChainIcons)
  const discardModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const chartOfAccountsMap = useAppSelector(selectChartOfAccountsMap)
  const deleteModalProvider = useModalHook({ defaultState: { isOpen: false } })

  const [activeTab, setActiveTab] = useState<string>('')
  // const [params, setParams] = useState<any>({ statuses: [PaymentStatus.CREATED] })
  const [filters, setFilter] = useState<IDraftFilters>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [isOpenSearch, setIsOpenSearch] = useState(false)
  const [selectedRow, setSelectedRow] = useState<IPayment>(null)
  const [isAddContactOpen, setIsContactOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()
  const [hasChanges, setHasChanges] = useState(true)
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false)
  const [cryptocurrencyPrices, setCryptocurrencyPrices] = useState<any>({})
  const [amount, setAmount] = useState<{ [id: string]: string }>({})
  const [isFetchingCryptocurrencyPrices, setIsFetchingCryptocurrencyPrices] = useState<boolean>(true)
  const initRef = useRef(false)

  const [triggerUpdatePayment, updatePaymentResponse] = useUpdatePaymentMutation()
  const [triggerUpdateAmount, updateAmountResponse] = useUpdatePaymentMutation()
  const [triggerSetPaymentToPending, setPaymentToPendingResponse] = useUpdatePaymentStatusToPendingMutation()
  const [triggerDeletePayment, deletePaymentResponse] = useDeletePaymentMutation()
  const [movePaymentToDraft, movePaymentToDraftResponse] = useUpdatePaymentStatusToCreatedMutation()
  const [triggerSetPaymentToReviewed, setPaymentToReviewedResponse] = useUpdatePaymentStatusToApprovedMutation()
  const [triggerBulkDeletePayments, bulkDeletePaymentsResponse] = useFakeBulkDeletePaymentsMutation()
  const [triggerBulkUpdateReviewer, bulkUpdateReviewerResponse] = useFakeBulkUpdateReviewerMutation()
  const [triggerBulkSetApproved, bulkSetApprovedResponse] = useFakeBulkSetApprovedMutation()
  const [triggerBulkSetCreated, bulkSetCreatedResponse] = useFakeBulkSetCreatedMutation()
  const [triggerBulkSetPending, bulkSetPendingResponse] = useFakeBulkSetPendingMutation()

  const [uploadFile] = useUploadTxFileMutation()
  const [triggerGetPrice] = useLazyGetTokenPriceQuery()

  const { data: tags } = useGetTagsQuery({ organizationId }, { skip: !organizationId })
  const [createTag, createTagRes] = useCreateTagMutation()
  const [deleteTag, deleteTagRes] = useDeleteTagMutation()
  const [updateTag, updateTagRes] = useUpdateTagMutation()

  const { data: members } = useGetMembersQuery(
    { orgId: organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  const { data: wallets } = useGetWalletsQuery(
    { orgId: organizationId, size: 999 },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )
  const { data: contacts } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const formattedFilterTime = useMemo(() => {
    const tempEndTime = filters?.endDate && new Date(new Date(filters?.endDate).getTime() + dayInMilliseconds)
    const startTime = filters?.startDate
      ? getUTCTDate(filters?.startDate, settings?.timezone?.utcOffset).toISOString()
      : null
    const endTime = filters?.endDate ? getUTCTDate(tempEndTime, settings?.timezone?.utcOffset).toISOString() : null
    return { startDate: startTime, endDate: endTime }
  }, [filters?.endDate, filters?.startDate])

  const fetchPaymentsBasedOnStatus = (_status) => ({
    organizationId,
    params: {
      search: filters?.search,
      reviewerIds: filters?.reviewers?.map((reviewer) => reviewer.value),
      cryptocurrencies: filters?.cryptocurrencies?.map((cryptocurrency) => cryptocurrency.label),
      chartOfAccountIds: filters?.accounts?.map((coa) => coa.value),
      startDate: formattedFilterTime?.startDate,
      endDate: formattedFilterTime?.endDate,
      page: provider.state.pageIndex,
      size: provider.state.pageSize,
      statuses: _status,
      destinationCurrencyType: filters?.cryptocurrencies?.length
        ? CurrencyType.CRYPTO
        : filters?.destinationCurrencyType?.length === 1
        ? filters?.destinationCurrencyType?.[0]?.value
        : null
    },
    isOffRampEnabled
  })

  const {
    data: draftPayments,
    isLoading,
    isFetching
  } = useGetPaymentQuery(fetchPaymentsBasedOnStatus(PaymentStatus.CREATED), {
    skip: !organizationId,
    refetchOnMountOrArgChange: true
  })
  const {
    data: pendingPayments,
    isLoading: isLoadingPendingPayments,
    isFetching: isFetchingPendingPayments
  } = useGetPaymentQuery(fetchPaymentsBasedOnStatus(PaymentStatus.PENDING), {
    skip: !organizationId,
    refetchOnMountOrArgChange: true
  })
  const {
    data: approvedPayments,
    isLoading: isLoadingApprovedPayments,
    isFetching: isFetchingApprovedPayments
  } = useGetPaymentQuery(fetchPaymentsBasedOnStatus(PaymentStatus.APPROVED), {
    skip: !organizationId,
    refetchOnMountOrArgChange: true
  })
  const {
    data: invalidPayments,
    isLoading: isLoadingInvalidPayments,
    isFetching: isFetchingInvalidPayments
  } = useGetPaymentQuery(fetchPaymentsBasedOnStatus(PaymentStatus.INVALID), {
    skip: !organizationId,
    refetchOnMountOrArgChange: true
  })
  const {
    data: failedPayments,
    isLoading: isLoadingFailedPayments,
    isFetching: isFetchingFailedPayments
  } = useGetPaymentQuery(fetchPaymentsBasedOnStatus(PaymentStatus.FAILED), {
    skip: !organizationId,
    refetchOnMountOrArgChange: true
  })

  useEffect(() => {
    let totalPages
    switch (activeTab) {
      case '':
        totalPages = draftPayments?.totalPages
        break
      case 'pending-review':
        totalPages = pendingPayments?.totalPages
        break
      case 'reviewed':
        totalPages = approvedPayments?.totalPages
        break
      case 'invalid-data':
        totalPages = draftPayments?.totalPages
        break
      case 'failed':
        totalPages = failedPayments?.totalPages
        break

      default:
        totalPages = 0
        break
    }

    if (totalPages > 0 && provider.state.pageIndex > totalPages - 1) {
      provider.methods.setPageIndex(totalPages - 1)
    }
  }, [
    activeTab,
    approvedPayments?.totalPages,
    draftPayments?.totalPages,
    failedPayments?.totalPages,
    pendingPayments?.totalPages
  ])

  useEffect(() => {
    if (createTagRes.isError) {
      toast.error(
        createTagRes?.error?.data?.message || 'An error has occurred while creating a new tag. Please try again.'
      )
    }
  }, [createTagRes.isError])

  useEffect(() => {
    if (updateTagRes.isError) {
      toast.error(updateTagRes?.error?.data?.message || 'An error has occurred while updating tag. Please try again.')
    }
  }, [updateTagRes.isError])

  useEffect(() => {
    if (bulkDeletePaymentsResponse.isSuccess) {
      provider.methods.selectAllItems([])
      toast.success('All Payments deleted successfully')
    } else {
      toast.error(bulkDeletePaymentsResponse?.error?.message)
      if (bulkDeletePaymentsResponse?.error?.failedItems) {
        provider.methods.selectAllItems([
          ...provider.state.selectedItems.filter((_item) =>
            bulkDeletePaymentsResponse?.error?.failedItems?.includes(_item.id)
          )
        ])
      }
    }
  }, [bulkDeletePaymentsResponse])

  useEffect(() => {
    if (bulkSetApprovedResponse.isSuccess) {
      provider.methods.selectAllItems([])
      toast.success('All Payments have been approved')
    } else {
      toast.error(bulkSetApprovedResponse?.error?.message)
      if (bulkSetApprovedResponse?.error?.failedItems) {
        provider.methods.selectAllItems([
          ...provider.state.selectedItems.filter((_item) =>
            bulkSetApprovedResponse?.error?.failedItems?.includes(_item.id)
          )
        ])
      }
    }
  }, [bulkSetApprovedResponse])

  useEffect(() => {
    if (bulkSetPendingResponse.isSuccess) {
      provider.methods.selectAllItems([])
      toast.success('All Payments sent for review')
    } else {
      toast.error(bulkSetPendingResponse?.error?.message)
      if (bulkSetPendingResponse?.error?.failedItems) {
        provider.methods.selectAllItems([
          ...provider.state.selectedItems.filter((_item) =>
            bulkSetPendingResponse?.error?.failedItems?.includes(_item.id)
          )
        ])
      }
    }
  }, [bulkSetPendingResponse])

  useEffect(() => {
    if (bulkSetCreatedResponse.isSuccess) {
      provider.methods.selectAllItems([])
      toast.success('All Payments moved to drafts')
    } else {
      toast.error(bulkSetCreatedResponse?.error?.message)
      if (bulkSetCreatedResponse?.error?.failedItems) {
        provider.methods.selectAllItems([
          ...provider.state.selectedItems.filter((_item) =>
            bulkSetCreatedResponse?.error?.failedItems?.includes(_item.id)
          )
        ])
      }
    }
  }, [bulkSetCreatedResponse])

  useEffect(() => {
    if (bulkUpdateReviewerResponse.isSuccess) {
      // provider.methods.selectAllItems([])
      toast.success('All Payments reviewer updated successfully')
    } else {
      toast.error(bulkUpdateReviewerResponse?.error?.message)
      if (bulkUpdateReviewerResponse?.error?.failedItems) {
        provider.methods.selectAllItems([
          ...provider.state.selectedItems.filter((_item) =>
            bulkUpdateReviewerResponse?.error?.failedItems?.includes(_item.id)
          )
        ])
      }
    }
  }, [bulkUpdateReviewerResponse])

  useEffect(() => {
    if (!selectedRow) {
      methods.clearErrors()
      methods.reset({ isSubmitForReview: false })
      tempUpdatedSelectData.current = null
      setHasChanges(false)
    }
  }, [selectedRow])

  useEffect(() => {
    if (deletePaymentResponse.isSuccess) {
      toast.success('Payment deleted successfully')
      provider.methods.selectAllItems([
        ...provider.state.selectedItems.filter((_item) => _item.id !== tempSelectedItemId.current)
      ])

      tempSelectedItemId.current = null
      deleteModalProvider.methods.setIsOpen(false)
    } else if (deletePaymentResponse.isError) {
      deleteModalProvider?.methods?.setIsOpen(false)
      toast.error('Failed to delete payment')
    }
  }, [deletePaymentResponse?.isSuccess, deletePaymentResponse?.isError])

  useEffect(() => {
    if (provider?.state?.selectedItems?.length > 0 && !isBulkUpdateOpen) {
      setIsBulkUpdateOpen(true)
    }
  }, [provider?.state?.selectedItems])

  const reviewerOptions = useMemo(
    () =>
      members?.data?.items.map((item) => ({
        value: item.id,
        label: `${item?.firstName} ${item?.lastName}`
      })),
    [members]
  )

  const accountOptions = useMemo(
    () =>
      groupedCOAs?.map((item) => ({
        groupLabel: item.label,
        options: item.options?.map((option) => ({
          ...option,
          showTooltip: option.label.length > 15
        }))
      })) || [],
    [groupedCOAs]
  )

  useEffect(() => {
    if (router?.query?.tab && activeTab !== router?.query?.tab) {
      setActiveTab(router?.query?.tab as string)
    }
  }, [router.query?.tab])

  useEffect(() => {
    if (updatePaymentResponse.isError) {
      methods.setValue('isSubmitForReview', false)
      toast.error('Failed to update payment')
    }
    if (updatePaymentResponse.isSuccess) {
      if (selectedRow) {
        if (
          selectedRow?.status === PaymentStatus.INVALID &&
          updatePaymentResponse?.data?.status !== PaymentStatus.INVALID
        ) {
          provider.methods.selectAllItems([
            ...provider.state.selectedItems.filter((_item) => _item.id !== updatePaymentResponse.data?.id)
          ])
          setSelectedRow(null)
        } else {
          // Set selected row with temp new data
          setSelectedRow((prev) => ({ ...prev, ...tempUpdatedSelectData.current }))
        }
      }
      methods.setValue('isSubmitForReview', false)
      setHasChanges(false)
      toast.success('Payment updated successfully')
    }
  }, [updatePaymentResponse.isError, updatePaymentResponse.isSuccess])

  useEffect(() => {
    if (movePaymentToDraftResponse.isError) {
      toast.error('Failed to move payment to draft')
    }
    if (movePaymentToDraftResponse.isSuccess) {
      setSelectedRow(null)
      const { data } = movePaymentToDraftResponse.data
      provider.methods.selectAllItems([...provider.state.selectedItems.filter((_item) => _item.id !== data.id)])

      toast.success('Payment moved to draft successfully')
    }
  }, [movePaymentToDraftResponse.isError, movePaymentToDraftResponse.isSuccess])

  useEffect(() => {
    if (setPaymentToPendingResponse.isError) {
      if (setPaymentToPendingResponse.error.status === 500) {
        toast.error('Failed to submit payment for review')
      } else {
        toast.error(setPaymentToPendingResponse.error.data.message || 'Failed to submit payment for review')
      }
      methods.setValue('isSubmitForReview', false)
    }
    if (setPaymentToPendingResponse.isSuccess) {
      setSelectedRow(null)
      const { data } = setPaymentToPendingResponse.data
      provider.methods.selectAllItems([...provider.state.selectedItems.filter((_item) => _item.id !== data.id)])

      methods.setValue('isSubmitForReview', false)
      toast.success('Payment submitted for review successfully')
    }
  }, [setPaymentToPendingResponse.isError, setPaymentToPendingResponse.isSuccess])

  useEffect(() => {
    if (setPaymentToReviewedResponse.isError) {
      toast.error('Failed to mark payment as reviewed')
    }
    if (setPaymentToReviewedResponse.isSuccess) {
      setSelectedRow(null)
      const { data } = setPaymentToReviewedResponse.data
      provider.methods.selectAllItems([...provider.state.selectedItems.filter((_item) => _item.id !== data.id)])

      toast.success('Payment marked as reviewed successfully')
    }
  }, [setPaymentToReviewedResponse.isError, setPaymentToReviewedResponse.isSuccess])

  const handleClickAddContact = (_data) => {
    setIsContactOpen(true)
    setSelectedAddress(_data)
  }

  const handleSubmitForReview = async (_draft: IPayment): Promise<void> => {
    const formData = methods.watch()

    if (Object.values(formData).filter((item) => item).length > 1) {
      methods.setValue('isSubmitForReview', true)
      await methods.trigger()
    }

    if (!Object.keys(methods.formState.errors).length) {
      triggerSetPaymentToPending({
        params: {
          organizationId,
          id: _draft?.id ?? selectedRow?.id
        }
      })
    }
  }

  const handleMoveToDraft = (_draft: IPayment) => {
    movePaymentToDraft({
      organizationId,
      id: _draft?.id ?? selectedRow?.id
    })
  }
  const handleMarkAsReviewed = (_draft: IPayment) => {
    triggerSetPaymentToReviewed({
      organizationId,
      id: _draft?.id ?? selectedRow?.id
    })
  }
  const handleChangeAmount = (id: string, _amount: string) => {
    setAmount((prev) => ({ ...prev, [id]: _amount }))
  }

  const handleMakePayment = (_draft: IPayment) => {
    const parsedFiles: IPreviewFileRequest[] = _draft.files?.map((file) => {
      const result = extractNameFromUUIDString(file)

      if (result.isSuccess) {
        return {
          key: file,
          filename: result.data.fileName
        }
      }
      return {
        key: '',
        filename: ''
      }
    })
    dispatch(
      updateReviewData({
        sourceWalletId: '',
        recipients: [
          {
            amount: _draft.destinationAmount,
            chartOfAccountId: _draft?.chartOfAccount?.id ?? '',
            walletAddress: _draft.destinationAddress,
            walletId: _draft.destinationMetadata?.id,
            bankAccount:
              _draft?.destinationCurrencyType === CurrencyType.FIAT
                ? bankAccountOptions?.find((_recipient) => _recipient?.metadata?.id === _draft?.destinationMetadata?.id)
                : null,
            tokenId:
              _draft?.destinationCurrencyType === CurrencyType.FIAT
                ? _draft.destinationCurrency?.code
                : verifiedCryptoCurrencyMap[_draft.destinationCurrency?.symbol?.toLowerCase()]?.publicId,
            metadata: _draft.destinationMetadata?.id
              ? {
                  id: _draft.destinationMetadata?.id,
                  type: _draft.destinationMetadata?.type as RecipientType
                }
              : null,
            purposeOfTransfer: _draft?.metadata?.purposeOfTransfer,
            draftMetadata: {
              id: _draft.id,
              status: _draft.status,
              isImported: true
            },
            files: parsedFiles,
            note: _draft.notes,
            annotations: _draft?.annotations?.map((tag) => ({ value: tag.id, label: tag.name })) || [],
            isUnknown: !_draft.destinationMetadata?.id
          }
        ]
      })
    )
    // dispatch(setMakePaymentDrafts([_draft || selectedRow]))
    router.push(
      `/${organizationId}/transfer/${
        isOffRampEnabled ? (_draft?.destinationCurrencyType === CurrencyType.CRYPTO ? 'crypto' : 'fiat') : ''
      }`
    )
  }

  // allow make bulk payment with same type
  const isAbleToMakeBulkPayment = useMemo(() => {
    const _selectedDrafts = provider?.state?.selectedItems
    const uniqueMap = _.uniq(_.map(_selectedDrafts, 'destinationCurrencyType'))
    return uniqueMap.length === 1
  }, [provider?.state?.selectedItems])

  const uploadFilesToS3 = async (_files) => {
    const fileData = new FormData()

    _files.forEach((file) => {
      fileData.append('files', file)
    })
    const result = await uploadFile({ files: fileData }).unwrap()
    return result?.data ?? []
  }

  const handleSaveChanges = async () => {
    const formData = methods.watch()
    methods.setValue('isSubmitForReview', false)
    await methods.trigger()

    if (!Object.keys(methods.formState.errors).length) {
      const removedFiles = formData.files?.filter((file) => file.id).map((file) => file.id) || []
      const newFiles = formData.files?.filter((file) => !file.id) || []
      let s3Files = []
      if (newFiles?.length > 0) {
        s3Files = await uploadFilesToS3(newFiles)
      }

      const body: Partial<ISubmitPaymentBody> = {
        destinationCurrencyType: formData?.destinationCurrencyType,
        destinationCurrencyId: formData?.token?.value,
        destinationAmount: formData?.amount && formData?.amount !== '' ? formData.amount : null,
        destinationAddress: formData?.recipient?.address || null,
        destinationMetadata: formData?.recipient?.metadata || null,
        notes: formData.notes,
        files: [...removedFiles, ...s3Files],
        chartOfAccountId: formData?.account?.value,
        reviewerId: formData.reviewer?.value,
        annotationIds: formData?.annotations?.map((annotation) => annotation.value)
      }

      if (formData?.recipient?.label) {
        body.destinationName = formData?.recipient?.label
      }

      if (formData?.destinationCurrencyType === CurrencyType.CRYPTO) {
        body.sourceCryptocurrencyId = formData?.token?.value
        body.sourceAmount = formData?.amount && formData?.amount !== '' ? formData.amount : null
      }

      if (!isOffRampEnabled) {
        body.cryptocurrencyId = formData?.token?.value
        body.amount = formData?.amount && formData?.amount !== '' ? formData.amount : null
      }

      const res = await triggerUpdatePayment({
        params: {
          organizationId,
          paymentId: selectedRow.id
        },
        body,
        isOffRampEnabled
      }).unwrap()

      tempUpdatedSelectData.current = {
        ...res
      }

      setAmount((prev) => ({ ...prev, [res.id]: res.destinationAmount || res.amount }))
    }
  }

  const handleDiscardChanges = async () => {
    // TODO - Improve this to make it more scalable
    let originalData = null
    if (activeTab === 'invalid-data') {
      originalData = invalidPayments?.items?.find((item) => item.id === selectedRow?.id)
    } else if (activeTab === '') {
      originalData = draftPayments?.items?.find((item) => item.id === selectedRow?.id)
    } else if (activeTab === 'pending-review') {
      originalData = pendingPayments?.items?.find((item) => item.id === selectedRow?.id)
    } else if (activeTab === 'reviewed') {
      originalData = approvedPayments?.items?.find((item) => item.id === selectedRow?.id)
    } else {
      originalData = failedPayments?.items?.find((item) => item.id === selectedRow?.id)
    }
    const coa = chartOfAccountsMap[originalData?.chartOfAccount?.id]
    const recipient =
      originalData?.destinationCurrencyType === CurrencyType.FIAT
        ? bankAccountOptions?.find((_recipient) => _recipient?.metadata?.id === originalData?.destinationMetadata?.id)
        : contactOptions?.find((_recipient) => _recipient?.metadata?.id === originalData?.destinationMetadata?.id) || {
            value: originalData?.destinationAddress,
            label: originalData?.destinationName ?? null,
            address: originalData?.destinationAddress,
            chainId: originalData?.id,
            metadata: originalData?.destinationMetadata,
            isUnknown: !originalData?.destinationMetadata?.id
          }

    methods.reset({
      recipient,
      account: coa
        ? {
            value: coa?.id,
            label: coa?.code ? `${coa?.code} - ${coa?.name}` : coa?.name
          }
        : null,
      token:
        originalData?.destinationCurrencyType === CurrencyType.FIAT
          ? currenciesOptions?.find(
              (item) => item.value?.toLowerCase() === originalData?.destinationCurrency?.code?.toLowerCase()
            )
          : tokenOptions?.find(
              (item) => item.label?.toLowerCase() === originalData?.destinationCurrency?.symbol?.toLowerCase()
            ),
      amount: originalData?.amount,

      reviewer: reviewerOptions?.find((reviewer) => reviewer.label === originalData?.reviewer?.account?.name) || {
        value: null,
        label: 'Anyone can review'
      },
      notes: originalData?.notes ?? '',
      files: originalData?.files?.map((file) => ({
        name: file.slice(37),
        id: file
      })),
      annotations: originalData?.annotations?.map((annotation) => ({
        label: annotation?.name,
        value: annotation?.id
      })),
      destinationCurrencyType: originalData?.destinationCurrencyType
    })
    if (originalData?.status === PaymentStatus.INVALID) {
      methods.setError('recipient', {
        message:
          'The recipient address was changed in the address book. Please enter/select the correct address and Save to fix the issue.'
      })
    }
    setHasChanges(false)
    discardModalProvider?.methods.setIsOpen(false)
  }
  const handleClickDiscard = () => {
    discardModalProvider.methods.setIsOpen(true)
  }

  const handleDelete = (_data) => {
    deleteModalProvider.methods.setIsOpen(true)
    tempSelectedItemId.current = _data.id
  }

  const handleRedirectPage = (type?: { value: CurrencyType }) => {
    if (isOffRampEnabled) {
      router.push(`/${organizationId}/transact/drafts/create/${type.value === CurrencyType.CRYPTO ? 'crypto' : 'fiat'}`)
    } else {
      router.push(`/${organizationId}/transact/drafts/create-draft`)
    }
  }

  const handleViewDetail = (_data) => {
    setSelectedRow(_data)
  }

  const handleOnClickUpdateReviewer = (_value: any, _payment: IPayment) => {
    const destinationCurrencyId =
      _payment.destinationCurrencyType === CurrencyType.FIAT
        ? _payment.destinationCurrency?.code
        : verifiedCryptoCurrencyMap[_payment.destinationCurrency?.symbol?.toLowerCase()]?.publicId

    const sourceCryptocurrencyId =
      _payment.destinationCurrencyType === CurrencyType.FIAT
        ? null
        : verifiedCryptoCurrencyMap[_payment.destinationCurrency?.symbol?.toLowerCase()]?.publicId

    const body: Partial<ISubmitPaymentBody> = {
      destinationCurrencyType: _payment.destinationCurrencyType,
      destinationCurrencyId,
      destinationAmount: _payment.destinationAmount,
      sourceCryptocurrencyId,
      sourceAmount: _payment.sourceAmount,
      destinationAddress: _payment.destinationAddress,
      destinationMetadata: _payment.destinationMetadata?.id ? _payment.destinationMetadata : null,
      notes: _payment.notes,
      files: _payment.files,
      chartOfAccountId: _payment?.chartOfAccount?.id,
      reviewerId: _value?.value
    }

    if (!isOffRampEnabled) {
      body.cryptocurrencyId = destinationCurrencyId
      body.amount = _payment.destinationAmount
    }

    triggerUpdatePayment({
      params: {
        paymentId: _payment.id,
        organizationId
      },
      body
    })
  }

  const handleUpdateAmount = (_value: { tokenId?: string; amount?: string }, _payment: IPayment) => {
    const body: Partial<ISubmitPaymentBody> = {
      destinationCurrencyType: _payment.destinationCurrencyType,
      destinationCurrencyId: _value.tokenId,
      destinationAmount: _value?.amount && _value?.amount !== '' ? _value.amount : null,
      destinationAddress: _payment.destinationAddress,

      destinationMetadata: _payment.destinationMetadata,
      notes: _payment.notes,
      files: _payment.files,
      chartOfAccountId: _payment?.chartOfAccount?.id,
      reviewerId: _payment?.reviewer?.id
    }

    if (_payment.destinationCurrencyType === CurrencyType.CRYPTO) {
      body.sourceCryptocurrencyId = _value.tokenId
      body.sourceAmount = _value?.amount && _value?.amount !== '' ? _value.amount : null
    }

    if (!isOffRampEnabled) {
      body.cryptocurrencyId = _value.tokenId
      body.amount = _value?.amount && _value?.amount !== '' ? _value.amount : null
    }

    triggerUpdateAmount({
      params: {
        paymentId: _payment.id,
        organizationId
      },
      body
    })
  }

  const onClickCancelDeleteDraft = () => {
    tempSelectedItemId.current = null
  }
  const onClickEmptyDataCta = () => router.push(`/${organizationId}/transact/drafts/create-draft`)

  const onClickDeleteDraft = () => {
    triggerDeletePayment({
      params: {
        organizationId,
        id: tempSelectedItemId.current
      }
    })
  }

  const handleChangeTab = (tab: string) => {
    provider.methods.selectAllItems([])
    if (tab === 'pending-review') {
      setActiveTab(tab)
    } else if (tab === 'reviewed') {
      setActiveTab(tab)
    } else if (tab === 'failed') {
      setActiveTab(tab)
    } else if (tab === 'invalid-data') {
      setActiveTab(tab)
    } else {
      setActiveTab('')
    }
    provider.methods.setPageIndex(0)
    router.push(
      {
        pathname: 'drafts',
        query: {
          organizationId,
          tab,
          page: provider.state.pageIndex
        }
      },
      undefined,
      { shallow: true }
    )
  }

  const draftTransactionTabs = [
    {
      key: '',
      name: `Drafts (${draftPayments?.totalItems || 0})`,
      active: true
    },
    {
      key: 'pending-review',
      name: `Pending Review (${pendingPayments?.totalItems || 0})`,
      active: false
    },
    {
      key: 'reviewed',
      name: `Reviewed (${approvedPayments?.totalItems || 0})`,
      active: false
    },
    {
      key: 'invalid-data',
      name: `Invalid Data (${invalidPayments?.totalItems || 0})`,
      active: false
    },
    {
      key: 'failed',
      name: `Failed (${failedPayments?.totalItems || 0})`,
      active: false
    }
  ]

  const actionHandler: any = useMemo(() => {
    const defaultActions = [
      {
        label: 'View Details',
        onClick: handleViewDetail
      },
      {
        label: 'Delete',
        onClick: handleDelete
      }
    ]
    const submitForReview = {
      label: 'Submit for Review',
      onClick: handleSubmitForReview
    }
    const saveChanges = {
      label: 'Save Changes',
      disabled: true,
      onClick: handleSaveChanges
    }
    const moveToDraft = {
      label: 'Move to Drafts',
      onClick: handleMoveToDraft
    }
    const fixIssues = {
      label: 'Fix Issues',
      onClick: handleViewDetail
    }
    const markAsReviewed = {
      label: 'Mark as Reviewed',
      onClick: handleMarkAsReviewed
    }
    const makePayment = {
      label: 'Make Payment',
      onClick: handleMakePayment
    }
    const retryPayment = {
      label: 'Retry Payment',
      onClick: handleMakePayment
    }
    const cancel = {
      label: 'Cancel',
      onClick: () => {
        setSelectedRow(null)
      }
    }
    switch (activeTab) {
      case '':
        return {
          lineCTA: submitForReview,
          detailCTAs: {
            secondaryCTA: submitForReview,
            primaryCTA: saveChanges
          },
          moreActions: [{ label: 'Edit', onClick: handleViewDetail }, ...defaultActions]
        }
      case 'pending-review':
        return {
          lineCTA: markAsReviewed,
          detailCTAs: {
            secondaryCTA: moveToDraft,
            primaryCTA: markAsReviewed
          },
          moreActions: [{ label: 'Move to Drafts', onClick: handleMoveToDraft }, ...defaultActions]
        }
      case 'reviewed':
        return {
          lineCTA: makePayment,
          detailCTAs: {
            secondaryCTA: moveToDraft,
            primaryCTA: makePayment
          },
          moreActions: [moveToDraft, ...defaultActions]
        }
      case 'failed':
        return {
          lineCTA: moveToDraft,
          detailCTAs: {
            secondaryCTA: moveToDraft,
            primaryCTA: retryPayment
          },
          moreActions: [...defaultActions]
        }
      case 'invalid-data':
        return {
          lineCTA: fixIssues,
          detailCTAs: {
            secondaryCTA: cancel,
            primaryCTA: saveChanges
          },
          moreActions: [...defaultActions]
        }
      default:
        return {
          lineCTA: submitForReview,
          detailCTAs: {
            secondaryCTA: submitForReview,
            primaryCTA: saveChanges
          },
          moreActions: [{ label: 'Edit', onClick: handleViewDetail }, ...defaultActions]
        }
    }
  }, [activeTab, selectedRow])

  const HEADERS_MAP = useMemo(() => {
    const hasReviewerTabs = ['', 'pending-review', 'reviewed']
    if (hasReviewerTabs.includes(activeTab)) {
      return HEADERS
    }
    return HEADERS_WITHOUT_REVIEWER
  }, [activeTab])

  useEffect(() => {
    if (tokenOptions.length > 0 && !initRef.current) {
      setIsFetchingCryptocurrencyPrices(true)
      for (const cryptocurrency of tokenOptions) {
        triggerGetPrice({
          params: {
            cryptocurrencyId: cryptocurrency?.value,
            fiatCurrency: settings?.fiatCurrency?.code,
            date: new Date().toISOString()
          }
        })
          .unwrap()
          .then((res) => {
            setCryptocurrencyPrices((prevState) => ({
              ...prevState,
              [cryptocurrency?.label]: res?.data
            }))
          })
      }
      setIsFetchingCryptocurrencyPrices(false)
      initRef.current = true
    }
  }, [tokenOptions])

  const isFiltered = Boolean(Object?.values(filters ?? {}).filter((item) => item || item?.length > 0)?.length)

  const onAddContactSuccess = (_contact) => {
    const newAddress = _contact?.recipientAddresses?.find(
      (address) => address.address.toLowerCase() === selectedAddress?.toLowerCase()
    )

    if (selectedRow) {
      methods.setValue('recipient', {
        value: newAddress.address,
        label: _contact.type === 'individual' ? _contact.contactName : _contact.organizationName,
        address: newAddress.address,
        src: chainIcons[newAddress.blockchainId],
        chainId: newAddress.blockchainId,
        metadata: {
          id: newAddress.publicId,
          type: 'recipient_address'
        },
        isUnknown: false
      })
      setSelectedRow((prev) => ({
        ...prev,
        destinationName: _contact.type === 'individual' ? _contact.contactName : _contact.organizationName,
        destinationAddress: newAddress.address,
        destinationMetadata: {
          id: newAddress.publicId,
          type: 'recipient_address'
        }
      }))
    }
  }

  const handleBulkDelete = () => {
    const paymentIds = provider?.state?.selectedItems?.map((item) => item.id)
    triggerBulkDeletePayments({
      params: {
        organizationId
      },
      body: {
        data: paymentIds
      }
    })
  }

  const handleBulkMakePayment = () => {
    const _drafts = provider?.state?.selectedItems || []

    const parseDrafts = []

    _drafts.forEach((draft) => {
      const parsedFiles: IPreviewFileRequest[] = draft.files?.map((file) => {
        const result = extractNameFromUUIDString(file)

        if (result.isSuccess) {
          return {
            key: file,
            filename: result.data.fileName
          }
        }
        return {
          key: '',
          filename: ''
        }
      })

      parseDrafts.push({
        amount: draft?.destinationAmount || draft.amount,
        chartOfAccountId: draft?.chartOfAccount?.id ?? '',
        walletAddress: draft.destinationAddress,
        bankAccount:
          draft?.destinationCurrencyType === CurrencyType.FIAT
            ? bankAccountOptions?.find((_recipient) => _recipient?.metadata?.id === draft?.destinationMetadata?.id)
            : null,
        walletId: draft.destinationMetadata?.id,
        tokenId:
          draft?.destinationCurrencyType === CurrencyType.FIAT
            ? draft.destinationCurrency?.code
            : verifiedCryptoCurrencyMap[draft.destinationCurrency?.symbol?.toLowerCase()]?.publicId,
        metadata: draft.destinationMetadata?.id
          ? {
              id: draft.destinationMetadata?.id,
              type: draft.destinationMetadata?.type as RecipientType
            }
          : null,
        purposeOfTransfer: draft?.metadata?.purposeOfTransfer,
        draftMetadata: {
          id: draft.id,
          status: draft.status,
          isImported: true
        },
        files: parsedFiles,
        note: draft.notes,
        annotations: draft?.annotations?.map((tag) => ({ value: tag.id, label: tag.name })) || [],
        isUnknown: !draft.destinationMetadata?.id
      })
    })

    dispatch(updateReviewData({ sourceWalletId: '', recipients: parseDrafts }))

    router.push(
      `/${organizationId}/transfer/${
        isOffRampEnabled ? (_drafts[0]?.destinationCurrencyType === CurrencyType.CRYPTO ? 'crypto' : 'fiat') : ''
      }`
    )
  }

  const handleBulkUpdateReviewer = (_reviewerId) => {
    const parsePaymentPayload = provider?.state?.selectedItems?.map((_payment) => {
      const destinationCurrencyId =
        _payment.destinationCurrencyType === CurrencyType.FIAT
          ? _payment.destinationCurrency?.code?.toLowerCase()
          : verifiedCryptoCurrencyMap[_payment.destinationCurrency?.symbol?.toLowerCase()]?.publicId
      const sourceCryptocurrencyId =
        _payment.destinationCurrencyType === CurrencyType.FIAT
          ? null
          : verifiedCryptoCurrencyMap[_payment.destinationCurrency?.symbol?.toLowerCase()]?.publicId

      const body: Partial<ISubmitPaymentBody> = {
        id: _payment.id,
        destinationCurrencyType: _payment.destinationCurrencyType,
        destinationCurrencyId,
        destinationAmount: _payment.destinationAmount,
        sourceCryptocurrencyId,
        sourceAmount: _payment.sourceAmount,
        destinationAddress: _payment.destinationAddress,
        destinationMetadata: _payment.destinationMetadata,
        notes: _payment.notes,
        files: _payment.files,
        chartOfAccountId: _payment?.chartOfAccount?.id
      }

      if (!isOffRampEnabled) {
        body.cryptocurrencyId = destinationCurrencyId
        body.amount = _payment.destinationAmount
      }

      return body
    })

    triggerBulkUpdateReviewer({
      params: {
        organizationId
      },
      body: {
        data: parsePaymentPayload,
        reviewerId: _reviewerId
      }
    })
  }

  const handleBulkSetCreated = () => {
    const paymentIds = provider?.state?.selectedItems?.map((item) => item.id)
    triggerBulkSetCreated({
      params: {
        organizationId
      },
      body: {
        data: paymentIds
      }
    })
  }

  const handleBulkSetApproved = () => {
    const paymentIds = provider?.state?.selectedItems?.map((item) => item.id)
    triggerBulkSetApproved({
      params: {
        organizationId
      },
      body: {
        data: paymentIds
      }
    })
  }

  const handleBulkSetPending = () => {
    const paymentIds = provider?.state?.selectedItems?.map((item) => item.id)
    triggerBulkSetPending({
      params: {
        organizationId
      },
      body: {
        data: paymentIds
      }
    })
  }
  const onAttachAnnotation = (_value) => {
    const getCurrentTags = methods.getValues('annotations') ?? []

    methods.setValue('annotations', [...getCurrentTags, _value])
    setHasChanges(true)
  }
  const onDeleteAnnotation = (_value) => {
    const getCurrentTags = methods.getValues('annotations') ?? []

    methods.setValue(
      'annotations',
      getCurrentTags.filter((_tag) => _tag.value !== _value.value)
    )
    setHasChanges(true)
  }

  const tagsHandler = useMemo(
    () => ({
      options: tags?.map((_tag) => ({ value: _tag.id, label: _tag.name })) || [],
      onCreate: async (_tagName, _draftId, afterCreate) => {
        const newTag = await createTag({ organizationId, payload: { name: _tagName } }).unwrap()
        afterCreate({ value: newTag.id, label: newTag.name })
        onAttachAnnotation({ value: newTag.id, label: newTag.name })
      },
      onDelete: (_tag) => {
        deleteTag({ organizationId, id: _tag.value })
      },
      onUpdate: (_tag, _newName) => {
        updateTag({ organizationId, id: _tag.value, payload: { name: _newName } })
      },
      onAttachAnnotation,
      onDeleteAnnotation
    }),
    [tags]
  )

  const handleSearch = (e) => {
    setFilter({ ...filters, search: e.target.value })
    provider.methods.setPageIndex(0)
  }

  return (
    <FormProvider {...methods}>
      <Header>
        <Header.Left>
          <Header.Left.Title>Manage Drafts</Header.Left.Title>
        </Header.Left>
        <Header.Right>
          {isOffRampEnabled ? (
            <ButtonDropdown>
              <ButtonDropdown.CTA label="Create Draft" />
              <ButtonDropdown.Options
                extendedClass="min-w-[153px]"
                options={CREATE_DRAFT_OPTIONS}
                onClick={handleRedirectPage}
              />
            </ButtonDropdown>
          ) : (
            <Header.Right.PrimaryCTA label="Create Draft" onClick={handleRedirectPage} />
          )}
        </Header.Right>
      </Header>
      <View.Content>
        <div className="pt-2 h-full">
          {/* <div className="mb-5">
            <DraftTransactionListFilter
              filters={filters}
              setFilters={setFilter}
              reviewerOptions={reviewerOptions}
              assetOptions={tokenOptions}
              accountOptions={accountOptions}
              resetPage={() => {
                provider.methods.setPageIndex(0)
              }}
            />
          </div> */}
          <section id="table" className="pt-2 relative">
            <TabsV3 setActive={handleChangeTab} active={activeTab} tabs={draftTransactionTabs}>
              <TabItem key="">
                <Table
                  data={draftPayments?.items}
                  provider={provider}
                  headers={HEADERS_MAP}
                  tableClassNames="table-fixed"
                  tableHeight={showBanner ? 'h-[calc(100vh-350px)]' : 'h-[calc(100vh-282px)]'}
                  isLoading={isLoading}
                  pagination
                  multiSelect
                  onClickRow={handleViewDetail}
                  totalPages={draftPayments?.totalPages}
                  emptyState={
                    isLoading ? (
                      <DraftTransactionListLoader emptyRows={8} />
                    ) : (
                      <EmptySearchResultNoData
                        title="Create your first draft today!"
                        subtitle="Create payments and save them as drafts."
                        ctaLabel="Create Draft"
                        isFiltered={isFiltered}
                        onClickCta={handleRedirectPage}
                      />
                    )
                  }
                  renderRow={(row) => (
                    <DraftTransactionRow
                      amount={amount[row?.id] || ''}
                      setAmount={handleChangeAmount}
                      item={row}
                      settings={settings}
                      isSidepanelOpen={Boolean(selectedRow)}
                      onClickAddContact={handleClickAddContact}
                      action={actionHandler}
                      chartOfAccountsMap={chartOfAccountsMap}
                      reviewers={reviewerOptions}
                      isLoading={setPaymentToPendingResponse.isLoading || isFetching}
                      onClickUpdateReviewer={handleOnClickUpdateReviewer}
                      cryptocurrencyPrices={cryptocurrencyPrices}
                      assetOptions={tokenOptions}
                      currencyOptions={currenciesOptions}
                      onUpdateAmount={handleUpdateAmount}
                      isFetchingCryptocurrencyPrices={isFetchingCryptocurrencyPrices}
                    />
                  )}
                />
              </TabItem>
              <TabItem key="pending-review">
                <Table
                  data={pendingPayments?.items}
                  provider={provider}
                  headers={HEADERS_MAP}
                  tableClassNames="table-fixed"
                  tableHeight={showBanner ? 'h-[calc(100vh-350px)]' : 'h-[calc(100vh-282px)]'}
                  isLoading={isLoadingPendingPayments}
                  pagination
                  onClickRow={handleViewDetail}
                  multiSelect
                  totalPages={pendingPayments?.totalPages}
                  emptyState={
                    isLoadingPendingPayments ? (
                      <DraftTransactionListLoader emptyRows={8} />
                    ) : (
                      <EmptySearchResultNoData
                        title="You do not have any payments pending for review"
                        isFiltered={isFiltered}
                      />
                    )
                  }
                  renderRow={(row) => (
                    <DraftTransactionRow
                      item={row}
                      settings={settings}
                      isSidepanelOpen={Boolean(selectedRow)}
                      onClickAddContact={handleClickAddContact}
                      action={actionHandler}
                      chartOfAccountsMap={chartOfAccountsMap}
                      reviewers={[]}
                      isLoading={setPaymentToReviewedResponse.isLoading || isFetchingPendingPayments}
                      cryptocurrencyPrices={cryptocurrencyPrices}
                      isFetchingCryptocurrencyPrices={isFetchingCryptocurrencyPrices}
                    />
                  )}
                />
              </TabItem>
              <TabItem key="reviewed">
                <Table
                  data={approvedPayments?.items}
                  provider={provider}
                  headers={HEADERS_MAP}
                  tableClassNames="table-fixed"
                  tableHeight={showBanner ? 'h-[calc(100vh-350px)]' : 'h-[calc(100vh-282px)]'}
                  isLoading={isLoadingApprovedPayments}
                  pagination
                  onClickRow={handleViewDetail}
                  multiSelect
                  totalPages={approvedPayments?.totalPages}
                  emptyState={
                    isLoadingApprovedPayments ? (
                      <DraftTransactionListLoader emptyRows={8} />
                    ) : (
                      <EmptySearchResultNoData
                        title="You do not have payments that have been reviewed"
                        isFiltered={isFiltered}
                      />
                    )
                  }
                  renderRow={(row) => (
                    <DraftTransactionRow
                      item={row}
                      settings={settings}
                      isSidepanelOpen={Boolean(selectedRow)}
                      onClickAddContact={handleClickAddContact}
                      action={actionHandler}
                      chartOfAccountsMap={chartOfAccountsMap}
                      reviewers={[]}
                      isLoading={movePaymentToDraftResponse.isLoading || isFetchingApprovedPayments}
                      cryptocurrencyPrices={cryptocurrencyPrices}
                      isFetchingCryptocurrencyPrices={isFetchingCryptocurrencyPrices}
                    />
                  )}
                />
              </TabItem>
              <TabItem key="invalid-data">
                <Table
                  data={invalidPayments?.items}
                  provider={provider}
                  headers={HEADERS_MAP}
                  onClickRow={handleViewDetail}
                  tableClassNames="table-fixed"
                  tableHeight={showBanner ? 'h-[calc(100vh-350px)]' : 'h-[calc(100vh-282px)]'}
                  isLoading={isLoadingInvalidPayments}
                  totalPages={invalidPayments?.totalPages}
                  multiSelect
                  pagination
                  emptyState={
                    isLoadingInvalidPayments ? (
                      <DraftTransactionListLoader emptyRows={8} />
                    ) : (
                      <EmptySearchResultNoData
                        title="You do not have payments with invalid data"
                        isFiltered={isFiltered}
                      />
                    )
                  }
                  renderRow={(row) => (
                    <DraftTransactionRow
                      item={row}
                      settings={settings}
                      isSidepanelOpen={Boolean(selectedRow)}
                      onClickAddContact={handleClickAddContact}
                      action={actionHandler}
                      chartOfAccountsMap={chartOfAccountsMap}
                      reviewers={reviewerOptions}
                      cryptocurrencyPrices={cryptocurrencyPrices}
                      isFetchingCryptocurrencyPrices={isFetchingCryptocurrencyPrices}
                      isLoading={movePaymentToDraftResponse.isLoading || isFetchingInvalidPayments}
                    />
                  )}
                />
              </TabItem>
              <TabItem key="failed">
                <Table
                  data={failedPayments?.items}
                  provider={provider}
                  headers={HEADERS_FAILED_TAB}
                  tableClassNames="table-fixed"
                  tableHeight={showBanner ? 'h-[calc(100vh-350px)]' : 'h-[calc(100vh-282px)]'}
                  isLoading={isLoadingFailedPayments}
                  onClickRow={handleViewDetail}
                  pagination
                  multiSelect
                  totalPages={failedPayments?.totalPages}
                  emptyState={
                    isLoadingFailedPayments ? (
                      <DraftTransactionListLoader emptyRows={8} />
                    ) : (
                      <EmptySearchResultNoData
                        title="You do not have payments that have failed"
                        isFiltered={isFiltered}
                      />
                    )
                  }
                  renderRow={(row) => (
                    <DraftTransactionRow
                      item={row}
                      isSidepanelOpen={Boolean(selectedRow)}
                      settings={settings}
                      onClickAddContact={handleClickAddContact}
                      action={actionHandler}
                      chartOfAccountsMap={chartOfAccountsMap}
                      reviewers={reviewerOptions}
                      cryptocurrencyPrices={cryptocurrencyPrices}
                      isFetchingCryptocurrencyPrices={isFetchingCryptocurrencyPrices}
                      paymentStatus={PaymentStatus.INVALID}
                    />
                  )}
                />
              </TabItem>
            </TabsV3>
            <div className="absolute right-0 top-[8px]">
              <div className="flex items-center  w-fit gap-1">
                <div className="flex items-center border border-grey-200 rounded-lg">
                  <Button
                    height={24}
                    variant="transparent"
                    classNames="px-2 py-2 h-[30px] w-[30px] border-0"
                    leadingIcon={<Image src={SearchIcon} alt="search" width={20} height={20} />}
                    onClick={() => {
                      setIsOpenSearch(!isOpenSearch)
                    }}
                  />
                  <TextField
                    classNameInput={`focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 w-full h-[24px] transition-width duration-300 ease-in-out  ${
                      isOpenSearch ? 'w-[200px] pr-2' : 'w-0'
                    }`}
                    errorClass="mt-1"
                    name="tab-search"
                    onChange={debounce(handleSearch, 300)}
                    placeholder="Search..."
                  />
                </div>
                <div className="border border-grey-200 rounded-lg">
                  <Button
                    height={24}
                    variant="transparent"
                    classNames="px-2 py-2 h-[30px] w-[30px] border-0"
                    leadingIcon={<Image src={FilterIcon} alt="filter" width={20} height={20} />}
                    onClick={() => {
                      setShowFilter(!showFilter)
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
        <DraftFilter
          showModal={showFilter}
          setShowModal={setShowFilter}
          filters={filters}
          setFilters={setFilter}
          reviewerOptions={reviewerOptions}
          assetOptions={tokenOptions}
          accountOptions={accountOptions}
          resetPage={() => {
            provider.methods.setPageIndex(0)
          }}
        />
      </View.Content>
      <SideModal
        title={
          selectedRow && (
            <div className="flex flex-row items-center">
              {selectedRow?.status === PaymentStatus.INVALID && (
                <div className="mr-2 flex items-center">
                  <Image src={AlertIcon} width={16} height={16} />
                </div>
              )}
              <ProfileInfoDisplay.Avatar name={selectedRow?.destinationMetadata?.id && selectedRow?.destinationName} />
              <Typography
                variant="body1"
                classNames="ml-2 max-w-[160px] truncate"
                styleVariant="semibold"
                color="black"
              >
                {selectedRow?.destinationName || 'Unknown'}
              </Typography>
              <DividerVertical height="h-[20px]" />
              {selectedRow?.createdAt && (
                <Typography variant="caption" color="tertiary" styleVariant="regular">
                  Created on {format(new Date(selectedRow.createdAt), 'dd MMM yyyy')}
                </Typography>
              )}
            </div>
          )
        }
        modalWidth="w-[500px]"
        titleClassName="border-b-0"
        showModal={Boolean(selectedRow)}
        setShowModal={setSelectedRow}
        onClose={() => setSelectedRow(null)}
        data={selectedRow}
        disableOutside={discardModalProvider?.state?.isOpen || isAddContactOpen}
        secondaryCTA={
          hasChanges
            ? {
                label: 'Discard Changes',
                onClick: handleClickDiscard
              }
            : {
                ...actionHandler?.detailCTAs?.secondaryCTA,
                disabled:
                  movePaymentToDraftResponse.isLoading ||
                  setPaymentToPendingResponse.isLoading ||
                  setPaymentToReviewedResponse.isLoading
              }
        }
        primaryCTA={
          hasChanges
            ? {
                label: 'Save Changes',
                disabled: Object.keys(methods?.formState?.errors)?.length > 0,
                onClick: handleSaveChanges
              }
            : {
                ...actionHandler?.detailCTAs?.primaryCTA,
                disabled:
                  movePaymentToDraftResponse.isLoading ||
                  setPaymentToPendingResponse.isLoading ||
                  setPaymentToReviewedResponse.isLoading ||
                  actionHandler?.detailCTAs?.primaryCTA?.disabled
              }
        }
      >
        <DraftTransactionDetail
          selectedData={selectedRow}
          settings={settings}
          hasChanges={hasChanges}
          currencyOptions={currenciesOptions}
          recipientOptions={contactOptions}
          bankAccountOptions={bankAccountOptions}
          verifiedTokens={tokenOptions}
          recipients={contacts?.items || []}
          accountOptions={groupedCOAs}
          reviewerOptions={reviewerOptions}
          wallets={wallets?.items}
          tagsHandler={tagsHandler}
          chartOfAccountsMap={chartOfAccountsMap}
          onSaveContact={handleClickAddContact}
          setHasChanges={setHasChanges}
          updatePaymentResponse={updatePaymentResponse}
          cryptocurrencyPrice={cryptocurrencyPrices[methods.watch('token')?.label.toUpperCase()]}
        />
      </SideModal>
      <ContactTransactionModal
        showModal={isAddContactOpen}
        setShowModal={setIsContactOpen}
        contactAddress={selectedAddress}
        onSuccess={onAddContactSuccess}
      />
      <DeleteDraftModal
        onClickCancel={onClickCancelDeleteDraft}
        onClickDelete={onClickDeleteDraft}
        provider={deleteModalProvider}
      />
      <DiscardChangesModal onDiscardChanges={handleDiscardChanges} provider={discardModalProvider} />
      <TopBulkActions
        handleClosePopup={() => provider.methods.selectAllItems([])}
        isAbleToMakeBulkPayment={isAbleToMakeBulkPayment}
        handleBulkDelete={handleBulkDelete}
        isLoading={
          bulkDeletePaymentsResponse.isLoading ||
          bulkSetApprovedResponse.isLoading ||
          bulkSetPendingResponse.isLoading ||
          bulkSetCreatedResponse.isLoading ||
          bulkUpdateReviewerResponse.isLoading
        }
        handleOnChangeReviewer={handleBulkUpdateReviewer}
        handleBulkSetCreated={handleBulkSetCreated}
        handleBulkSetPending={handleBulkSetPending}
        handleBulkSetApproved={handleBulkSetApproved}
        handleBulkMakePayment={handleBulkMakePayment}
        numberSelected={provider?.state?.selectedItems?.length}
        isOpen={provider?.state?.selectedItems?.length > 0}
        reviewers={reviewerOptions}
        activeTab={activeTab}
      />
    </FormProvider>
  )
}

export default DraftTransactionListView
