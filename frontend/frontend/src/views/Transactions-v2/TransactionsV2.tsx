/* eslint-disable no-prototype-builtins */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable guard-for-in */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useMemo, useEffect, useRef } from 'react'
import ExportIcon from '@/public/svg/icons/share-icon.svg'
import { Button, Input } from '@/components-v2'
import TabItem from '@/components/TabsComponent/TabItem'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import { useRouter } from 'next/router'
import Table from './TxGridTable/TxGridTable'
import ArrowLeft from '@/public/svg/arrowLeft.svg'
import { useAppDispatch, useAppSelector } from '@/state'
import { setCurrentPage } from '@/state/global/actions'
import { toast } from 'react-toastify'
import Image from 'next/legacy/image'
import LargeDoucment from '@/public/svg/icons/large-document-icon.svg'
import RequestIcon from '@/public/svg/logos/request-logo.svg'
import useIsMobile from '@/hooks/useIsMobile'

import {
  ITabStatusParams,
  useLazyExportCSVFileQuery,
  useGetFinancialTransactionsQuery,
  useLazyGetFinancialTransactionQuery,
  useLazyGetFinancialTransactionsQuery,
  ITxFitlerParams,
  useUpdateFinancialTransactionMutation,
  useFakeBulkUpdateFinancialTxMutation,
  TxActivity,
  useLazyGetTransactionFilesQuery,
  useJournayEntryExportCreateMutation,
  useGenerateAllCSVExportsMutation,
  useGenerateBankFeedExportsMutation,
  useGenerateReportExportsMutation,
  useAttachAnnotationMutation,
  useDeleteAnnotationMutation
} from '@/api-v2/financial-tx-api'
import { ExportOnboardingModal } from './ExportOnboardModal'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { SideModal } from '@/components-v2/SideModal'
import { SideModalContent } from './SideModalContent'
import _, { capitalize, debounce, isArray, isEmpty, set } from 'lodash'
import SyncChip from '@/components-v2/molecules/SyncChip'

import { useWalletSync } from '@/hooks-v2/useWalletSync'
import TopBulkActions from './TopBulkActions'
import TxFilter from './TxFilter'
import { useGetWalletGroupsQuery } from '@/api-v2/wallet-group-api'

import { format } from 'date-fns'
import { FormProvider, useForm } from 'react-hook-form'
import { GroupDropdown } from '@/components-v2/GroupDropDown'
import { IOption } from '@/components-v2/GroupDropDown/GroupDropdown'
import DateRangeFilter, { IDateRange } from './TxFilter/DateRangeFilter'
import MultipleDropDown from './TxFilter/MultipleDropDown'
import ContactTransactionModal from '../_deprecated/Transactions/components/ContactTransaction/ContactTransaction'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import LargeClock from '@/public/svg/icons/large-clock.svg'
import { userOrganizationsSelector } from '@/slice/account/account-slice'
import MultiSelectCheckboxTab from '@/components-v2/atoms/MultiSelectCheckboxTab'
import allChainsSvg from '@/public/svg/allChains.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { useGetChartOfAccountsQuery } from '@/api-v2/chart-of-accounts'
import { useGetChartOfAccountsMappingQuery } from '@/api-v2/chart-of-accounts-mapping'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { useLazyModifiedIntegrationQuery, useOrganizationIntegrationsQuery } from '@/api-v2/merge-rootfi-api'
// import { selectAvailableAccounts } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { NewExportModa } from './NewExportModal'
import { IntegrationSyncModal } from './IntegrationSyncModal'
import Typography from '@/components-v2/atoms/Typography'
import LoadingPopUp from '@/components-v2/molecules/LoadingPopUp'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { useSyncInvoicesMutation } from '@/api-v2/invoices-api'
import {
  accountingIntegrationSelector,
  rootfiIntegrationSelector
} from '@/slice/org-integration/org-integration-selector'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { dayInMilliseconds, getUTCTDate } from '@/utils-v2/dateHelper'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import SettingsIcon from '@/public/svg/icons/settings-icon-2.svg'
import { api } from '@/api-v2'
import ExportModalV2 from './ExportModalV2/ExportModalV2'
import { ExportMethod, ExportTo, ExportType, IExportPayLoad } from './ExportModalV2/interface'
import { ButtonDropdown } from '@/components-v2/molecules/ButtonDropdown'
import {
  ACTION_OPTIONS,
  DEFAULT_TRANSACTION_TABLE_COLUMNS,
  TXN_COLUMNS_STORAGE_KEY,
  TXN_FILTERS_STORAGE_KEY,
  TransactionsAction
} from './interface'
import GenerateReportModal from './GenerateReportModal/GenerateReportModal'
import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useGetAnnotationsQuery,
  useGetTagsQuery,
  useUpdateTagMutation
} from '@/slice/tags/tags-api'
import DynamicColumnDropdown from './DynamicColumnDropdown/DynamicColumnDropdown'
import { ITag } from '@/slice/tags/tag-type'
import { OrgIntegrationStatus } from '@/slice/org-integration/org-integration-slice'
import ReactTooltip from 'react-tooltip'

const REQUIRED_MAPPINGS = ['gain', 'loss', 'fee', 'rounding', 'wallet']

const TransactionV2 = () => {
  const { ...methods } = useForm<ITxFitlerParams>({
    defaultValues: JSON.parse(window.localStorage.getItem(TXN_FILTERS_STORAGE_KEY)) || {
      walletAddresses: [],
      startTime: null,
      endTime: null,
      activities: [],
      childTypes: [],
      fromAddresses: [],
      toAddresses: [],
      annotations: [],
      assetIds: [],
      toFiatAmount: '',
      fromFiatAmount: '',
      categories: [],
      exportStatuses: []
    }
  })

  const [selectedTransactionId, setSelectedTransactionId] = useState(null)
  const dispatch = useAppDispatch()
  const orgId = useOrganizationId()
  const listOrganization = useAppSelector(userOrganizationsSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  // Use real supported chains from Redux store
  const uiSupportedChains = supportedChains || []
  const accountingIntegration = useAppSelector(accountingIntegrationSelector)
  const rootfiIntegration = useAppSelector(rootfiIntegrationSelector)
  const { timezone } = useAppSelector(orgSettingsSelector)
  const showBanner = useAppSelector(showBannerSelector)
  const isNewExportsCSVEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewExportsCSVEnabled'))
  const isBankFeedEnabled = useAppSelector((state) => selectFeatureState(state, 'isBankFeedEnabled'))
  const isSpotBalanceEnabled = useAppSelector((state) => selectFeatureState(state, 'isSpotBalanceEnabled'))
  const currentOrganization = listOrganization?.find((item) => item.id === orgId)
  const rootfiService = useAppSelector((state) => state.featureFlag?.rootfiService)

  const router = useRouter()
  const checkboxRef = useRef(null)
  const searchRef = useRef(null)
  const initRef = useRef(false)

  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(25)
  const [activeTab, setActiveTab] = useState<string>('')
  const [params, setParams] = useState<ITabStatusParams>({})
  const [checkedItems, setCheckedItems] = useState({})
  const [xeroCheckedItemsData, setXeroCheckedItemsData] = useState({})
  const [checkedItemsData, setCheckedItemsData] = useState({})
  const [exportType, setExportType] = useState<ExportMethod>(null)
  const [tagsMap, setTagsMap] = useState<{ [id: string]: ITag[] }>({})

  const [filters, setFilters] = useState<ITxFitlerParams>(
    JSON.parse(window.localStorage.getItem(TXN_FILTERS_STORAGE_KEY)) || {
      walletAddresses: [],
      startTime: null,
      endTime: null,
      activities: [],
      childTypes: [],
      fromAddresses: [],
      toAddresses: [],
      annotations: [],
      assetIds: [],
      toFiatAmount: '',
      fromFiatAmount: '',
      categories: [],
      blockchainIds: [],
      correspondingChartOfAccountIds: [],
      exportStatuses: [],
      invoices: []
    }
  )
  const [txnTableColumns, setTxnTableColumns] = useState(
    JSON.parse(window.localStorage.getItem(TXN_COLUMNS_STORAGE_KEY)) || DEFAULT_TRANSACTION_TABLE_COLUMNS
  )

  const [totalItems, setTotalItems] = useState(0)
  const [isAddContactOpen, setIsContactOpen] = useState(false)
  const [displayParent, setDisplayParent] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>()
  const [areAllChainsSelected, setAreAllChainsSelected] = useState<boolean>(
    isFeatureEnabledForThisEnv &&
      !JSON.parse(window.localStorage.getItem(TXN_FILTERS_STORAGE_KEY))?.blockchainIds?.length
  ) // Default to true once deployed to all envs
  const bulkUpdateErrorModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const newExportModalProvider = useModalHook({ defaultState: { isOpen: false } }) // Maybe use redux
  const generateReportProvider = useModalHook({ defaultState: { isOpen: false } })
  const exportOnboardingModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const integrationSyncModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const syncingRequestModalProvider = useModalHook({ defaultState: { isOpen: false } })

  // const { data: availableAccounts } = useGetChartOfAccountsTransactionSelectionQuery(
  //   { organizationId: orgId, params: { status: ['ACTIVE'] } },
  //   { skip: !orgId, refetchOnMountOrArgChange: true }
  // )

  const { data: availableAccounts } = useGetChartOfAccountsQuery(
    { organizationId: orgId, params: { status: ['ACTIVE'] } },
    { skip: !orgId, refetchOnMountOrArgChange: true }
  )
  const [triggerExportJournalEntry, exportJournalEntryApi] = useJournayEntryExportCreateMutation()
  const [syncInvoices, syncInvoicesRes] = useSyncInvoicesMutation()

  const { startWalletSync, lastUpdated, checkWalletSync } = useWalletSync({
    organisationId: orgId
  })

  const formattedFilterTime = useMemo(() => {
    const tempEndTime = filters?.endTime && new Date(new Date(filters?.endTime).getTime() + dayInMilliseconds)
    const startTime = filters?.startTime ? getUTCTDate(filters?.startTime, timezone?.utcOffset).toISOString() : null
    const endTime = filters?.endTime ? getUTCTDate(tempEndTime, timezone?.utcOffset).toISOString() : null
    return { startTime, endTime }
  }, [filters?.endTime, filters?.startTime])

  const {
    data,
    isLoading: isLoadingFinacialTransactions,
    isSuccess: isSuccessFinancialTransactions,
    refetch
  } = useGetFinancialTransactionsQuery(
    {
      orgId,
      page,
      params: {
        size: limit,
        ...filters,
        ...params,
        ...formattedFilterTime,
        correspondingChartOfAccountIds: activeTab === 'no-account' ? 'null' : filters?.correspondingChartOfAccountIds
      }
    },
    { skip: !orgId }
  )

  const { data: tags } = useGetTagsQuery({ organizationId: orgId }, { skip: !orgId })
  const [createTag, createTagRes] = useCreateTagMutation()
  const [deleteTag, deleteTagRes] = useDeleteTagMutation()
  const [updateTag, updateTagRes] = useUpdateTagMutation()
  const { data: annotations } = useGetAnnotationsQuery({ organizationId: orgId }, { skip: !orgId })
  const [attachAnnotation, attachAnnotationRes] = useAttachAnnotationMutation()
  const [deleteAnnotation, deleteAnnotationRes] = useDeleteAnnotationMutation()

  const { data: wallets } = useGetWalletsQuery({ orgId, params: { size: 999 } }, { skip: !orgId })
  const { data: contacts } = useGetContactsQuery(
    { orgId, params: { size: 9999 } },
    { skip: !orgId, refetchOnMountOrArgChange: true }
  )
  const { data: walletGroups } = useGetWalletGroupsQuery({ orgId }, { skip: !orgId })
  const { data: chartOfAccountsMapping } = useGetChartOfAccountsMappingQuery(
    { organizationId: orgId },
    { skip: !orgId }
  )
  const { data: requestIntegration } = useOrganizationIntegrationsQuery(
    { organizationId: orgId, integration: IntegrationName.REQUEST_FINANCE },
    { skip: !orgId }
  )

  const [modifiedCoaQuery, modifiedCoaQueryApi] = useLazyModifiedIntegrationQuery()

  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [bulkUpdateFinacialTx, bulkUpdateFinacialTxResult] = useFakeBulkUpdateFinancialTxMutation()
  const [updateFinnacialTx, updateFinnacialTxResult] = useUpdateFinancialTransactionMutation()
  const [triggerFinanceApi, { data: taskData, isLoading: taskIsLoding }] = useLazyGetFinancialTransactionsQuery()
  const [triggerGetTx, { data: txData, isLoading: isTransactionDetailLoading }] = useLazyGetFinancialTransactionQuery()

  const [triggerExportCSV, { isLoading: isloadingCSV, isSuccess: isSuccessCsv, data: csvData }] =
    useLazyExportCSVFileQuery()
  const [
    triggerExportAllCSV,
    {
      isLoading: isloadingCSVExport,
      isSuccess: isSuccessCsvExport,
      data: csvExportData,
      isError: isErrorCsvExport,
      error: csvGenerateError
    }
  ] = useGenerateAllCSVExportsMutation()

  const [
    triggerExportBankFeeds,
    {
      isLoading: isloadingBankFeedExport,
      isSuccess: isSuccessBankFeedExport,
      isError: isErrorBankFeedExport,
      error: bankFeedGenerateError
    }
  ] = useGenerateBankFeedExportsMutation()

  const [
    triggerExportReport,
    {
      isLoading: isLoadingReportExport,
      isSuccess: isSuccessReportExport,
      isError: isErrorReportExport,
      error: reportGenerateError
    }
  ] = useGenerateReportExportsMutation()

  const [triggerGetFiles, { data: filesData }] = useLazyGetTransactionFilesQuery()
  const organizationId = useOrganizationId()

  // const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)

  const { data: allTransactionsWithoutFilters, refetch: allTransactionsWithoutFiltersRefetch } =
    useGetFinancialTransactionsQuery(
      {
        orgId,
        page: 0
      },
      { skip: !orgId }
    ) // TODO: Remove this after we have introduced the new Xero/Quickbooks endpoint to export filtered transactions

  const { data: allData, refetch: allDataRefetch } = useGetFinancialTransactionsQuery(
    {
      orgId,
      page: 0,
      params: {
        ...filters,
        ...formattedFilterTime
      }
    },
    { skip: !orgId }
  )

  const { data: uncategorizedData, refetch: uncategorizedDataRefetch } = useGetFinancialTransactionsQuery(
    {
      orgId,
      page: 0,
      params: {
        ...filters,
        ...formattedFilterTime,
        correspondingChartOfAccountIds: 'null'
      }
    },
    { skip: !orgId }
  )
  const { data: failedExports, refetch: failedExportDataRefetch } = useGetFinancialTransactionsQuery(
    {
      orgId,
      page: 0,

      params: {
        ...filters,
        ...formattedFilterTime,
        exportStatuses: ['failed']
      }
    },
    { skip: !orgId }
  )

  const { data: missingData, refetch: missingDataRefetch } = useGetFinancialTransactionsQuery(
    {
      orgId,
      page: 0,
      params: {
        ...filters,
        ...formattedFilterTime,
        substatuses: ['missing_price', 'missing_cost_basis']
      }
    },
    { skip: !orgId }
  )

  const integrationName = useMemo(
    () => (accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'),
    [accountingIntegration?.integrationName]
  )

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      window.localStorage.setItem(TXN_FILTERS_STORAGE_KEY, JSON.stringify(filters))
    }
  }, [filters])

  useEffect(() => {
    if (txnTableColumns && Object.keys(txnTableColumns).length > 0) {
      window.localStorage.setItem(TXN_COLUMNS_STORAGE_KEY, JSON.stringify(txnTableColumns))
    }
  }, [txnTableColumns])

  useEffect(() => {
    if (modifiedCoaQueryApi?.isError) {
      dispatch(api.util.invalidateTags(['organization-integrations-list']))
    }
  }, [modifiedCoaQueryApi?.isError])

  useEffect(() => {
    if (!accountingIntegration) {
      newExportModalProvider.methods.setIsOpen(false)
    }
  }, [accountingIntegration])

  useEffect(() => {
    setPage(0)
  }, [...filters.blockchainIds, areAllChainsSelected])

  useEffect(() => {
    if (router.query.generate) {
      newExportModalProvider.methods.setIsOpen(true)
    }
  }, [router.query])

  useEffect(() => {
    if (!initRef.current) {
      const _params: ITabStatusParams = {}
      let _tab = ''

      switch (router.query.tab?.toString()) {
        case 'missing':
          _params.substatuses = ['missing_price', 'missing_cost_basis']
          _tab = 'missing'
          break
        case 'no-account':
          _params.correspondingChartOfAccountIds = 'null'
          _tab = 'no-account'

          break
        case 'failed-export':
          _params.exportStatuses = ['failed']
          _tab = 'failed-export'

          break
        default:
          _tab = ''
          break
      }

      if (router.query.tab) {
        setPage(0)
        setParams({
          ...params,
          ..._params
        })

        setActiveTab(_tab || '')
      }
      if (router.query.id) {
        setParams({
          ...params,
          ..._params,
          search: router.query.id ? router.query.id.toString().trim() : ''
        })

        searchRef.current.value = router.query.id ? router.query.id.toString().trim() : ''
      }
    }
  }, [router.query.id, router.query.tab])

  useEffect(() => {
    if (router.query.id && !initRef.current) {
      const txn = data?.items?.find((item) => item?.hash === router.query.id)
      if (txn) {
        setDisplayParent(true)
        handleOnClickRow(txn)
        initRef.current = true
      } else if (data?.items?.length?.toString()) {
        initRef.current = true
      }
    }
  }, [data, router.query.id])

  useEffect(() => {
    if (isSuccessFinancialTransactions) {
      setTotalItems(data?.totalItems)
    }
  }, [isLoadingFinacialTransactions, isSuccessFinancialTransactions])

  useEffect(() => {
    if (syncInvoicesRes.isSuccess) {
      toast.success('Sync invoice completed')
      syncingRequestModalProvider.methods.setIsOpen(false)
    } else if (syncInvoicesRes.isError) {
      toast.success('Sync invoice failed')
      syncingRequestModalProvider.methods.setIsOpen(false)
    }
  }, [syncInvoicesRes.isError, syncInvoicesRes.isSuccess])

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

  // useEffect(() => {
  //   if (!isWalletSyncing && isWalletSyncing !== undefined && lastUpdated !== '') {
  //     allTransactionsWithoutFiltersRefetch()
  //     allDataRefetch()
  //     uncategorizedDataRefetch()
  //     missingDataRefetch()
  //     refetch()
  //   }
  // }, [isWalletSyncing])

  useEffect(() => {
    if (!isOpen) setSelectedTransactionId(null)
  }, [isOpen])

  useEffect(() => {
    dispatch(setCurrentPage('Transaction Records'))
    if (orgId) {
      triggerFinanceApi({
        orgId,
        page,
        params: {
          substatuses: ['missing_cost_basis', 'missing_price']
        }
      })
    }
  }, [dispatch, orgId])

  useEffect(() => {
    if (isSuccessCsv && !isNewExportsCSVEnabled) {
      triggerSendAnalysis({
        eventType: 'EXPORT_TRANSACTION_CSV',
        metadata: {
          count: csvData?.count
        }
      })
      toast.success('Transaction data exported!')
    }
  }, [isSuccessCsv, isNewExportsCSVEnabled])

  useEffect(() => {
    if (isErrorCsvExport && isNewExportsCSVEnabled) {
      toast.error(csvGenerateError?.data?.message ?? 'Export CSV Failed')
    } else if (isSuccessCsvExport && isNewExportsCSVEnabled) {
      setExportType(ExportMethod.TRANSACTIONS)
      newExportModalProvider.methods.setIsOpen(false)
      const dontShowExportOnboardingModal = window.localStorage.getItem('dont-show-export-onboarding-modal-again')
      const currentBannerOrgs = dontShowExportOnboardingModal && JSON.parse(dontShowExportOnboardingModal)
      if (
        !dontShowExportOnboardingModal ||
        (dontShowExportOnboardingModal && !currentBannerOrgs.includes(`${organizationId}`))
      ) {
        // const currentBannerOrgs = JSON.parse(showExportOnboardModalAgain)
        exportOnboardingModalProvider.methods.setIsOpen(true)
      }
      setCheckedItems({})
      setCheckedItemsData({})
      triggerSendAnalysis({
        eventType: 'EXPORT_TRANSACTION_CSV',
        metadata: {
          count: csvExportData?.count,
          organizationId
        }
      })
      toast.success('Transaction data exported!')
    }
  }, [isSuccessCsvExport, isNewExportsCSVEnabled, isErrorCsvExport])

  useEffect(() => {
    if (isErrorBankFeedExport && isBankFeedEnabled) {
      toast.error(bankFeedGenerateError?.data?.message ?? 'Export Bank Feed Failed')
    } else if (isSuccessBankFeedExport && isBankFeedEnabled) {
      setExportType(ExportMethod.BANK_FEEDS)
      newExportModalProvider.methods.setIsOpen(false)
      const dontShowExportOnboardingModal = window.localStorage.getItem('dont-show-export-onboarding-modal-again')
      const currentBannerOrgs = dontShowExportOnboardingModal && JSON.parse(dontShowExportOnboardingModal)
      if (
        !dontShowExportOnboardingModal ||
        (dontShowExportOnboardingModal && !currentBannerOrgs.includes(`${organizationId}`))
      ) {
        exportOnboardingModalProvider.methods.setIsOpen(true)
      }
      setCheckedItems({})
      setCheckedItemsData({})
      triggerSendAnalysis({
        eventType: 'EXPORT_BANK_FEED',
        metadata: {
          organizationId
        }
      })
      toast.success('Bank feed exported!')
    }
  }, [isSuccessBankFeedExport, isErrorBankFeedExport, isBankFeedEnabled])

  useEffect(() => {
    if (isErrorReportExport && isSpotBalanceEnabled) {
      toast.error(reportGenerateError?.data?.message ?? 'Generate Monthly Report Failed')
    } else if (isSuccessReportExport && isSpotBalanceEnabled) {
      setExportType(ExportMethod.TRANSACTIONS)
      generateReportProvider.methods.setIsOpen(false)
      const dontShowExportOnboardingModal = window.sessionStorage.getItem('dont-show-export-onboarding-modal-again')
      const currentBannerOrgs = dontShowExportOnboardingModal && JSON.parse(dontShowExportOnboardingModal)
      if (
        !dontShowExportOnboardingModal ||
        (dontShowExportOnboardingModal && !currentBannerOrgs.includes(`${organizationId}`))
      ) {
        exportOnboardingModalProvider.methods.setIsOpen(true)
      }
      triggerSendAnalysis({
        eventType: 'EXPORT_MONTHLY_REPORT',
        metadata: {
          organizationId
        }
      })
      toast.success('Monthly Report Generated!')
    }
  }, [isSuccessReportExport, isErrorReportExport, isBankFeedEnabled])

  useEffect(() => {
    if (exportJournalEntryApi.isError) {
      toast.error(exportJournalEntryApi?.error?.data?.message ?? 'Export Journal Entry Failed')
    } else if (exportJournalEntryApi.isSuccess) {
      setExportType(ExportMethod.JOURNAL_ENTRIES)
      toast.success(`Generating the data for your ${integrationName} export`)
      newExportModalProvider.methods.setIsOpen(false)

      const dontShowExportOnboardingModal = window.sessionStorage.getItem('dont-show-export-onboarding-modal-again')
      const currentBannerOrgs = dontShowExportOnboardingModal && JSON.parse(dontShowExportOnboardingModal)
      if (
        !dontShowExportOnboardingModal ||
        (dontShowExportOnboardingModal && !currentBannerOrgs.includes(`${organizationId}`))
      ) {
        // const currentBannerOrgs = JSON.parse(showExportOnboardModalAgain)
        exportOnboardingModalProvider.methods.setIsOpen(true)
      }

      setCheckedItems({})
      setCheckedItemsData({})

      triggerSendAnalysis({
        eventType: 'EXPORT_TRANSACTION_INTEGRATION',
        metadata: {
          organizationId,
          integrationName
        }
      })
    }
  }, [exportJournalEntryApi])

  useEffect(() => {
    if (bulkUpdateFinacialTxResult.isSuccess) {
      const transactionIds = bulkUpdateFinacialTxResult?.originalArgs?.data.map((tx) => tx.id)
      triggerSendAnalysis({
        eventType: 'BULK_UPDATE_TRANSACTION_CATEGORY',
        metadata: {
          transactionIds,
          accountId: bulkUpdateFinacialTxResult?.originalArgs?.data?.[0]?.data?.correspondingChartOfAccountId,
          accountCode: bulkUpdateFinacialTxResult?.originalArgs?.data?.[0]?.data?.correspondingChartOfAccountCode,
          accountName: bulkUpdateFinacialTxResult?.originalArgs?.data?.[0]?.data?.correspondingChartOfAccountName
        }
      })
    } else if (bulkUpdateFinacialTxResult.isError) {
      bulkUpdateErrorModalProvider.methods.setIsOpen(true)
    }
  }, [bulkUpdateFinacialTxResult])

  useEffect(() => {
    if (updateFinnacialTxResult.isError) {
      toast.error('Transaction update failed')
    } else if (updateFinnacialTxResult.isSuccess) {
      triggerSendAnalysis({
        eventType: 'UPDATE_TRANSACTION_CATEGORY',
        metadata: {
          transactionId: updateFinnacialTxResult?.originalArgs?.id,
          accountId: updateFinnacialTxResult?.originalArgs?.payload?.correspondingChartOfAccountId,
          accountCode: updateFinnacialTxResult?.originalArgs?.optimisticAccount?.code,
          accountName: updateFinnacialTxResult?.originalArgs?.optimisticAccount?.name
        }
      })
    }
  }, [updateFinnacialTxResult.isError, updateFinnacialTxResult.isSuccess])

  useEffect(() => {
    checkboxRef.current = null
  }, [activeTab, filters, params])

  const filterCount = useMemo(
    () =>
      filters
        ? filters &&
          Object.keys(filters).filter(
            (item) => item !== 'endTime' && item !== 'blockchainIds' && !!filters[item] && filters[item]?.length > 0
          ).length
        : 0,
    [filters]
  )

  const walletOptions = useMemo(() => {
    const groups = []
    walletGroups?.forEach((item) => {
      groups.push({
        groupLabel: item.name,
        options: []
      })
    })

    wallets?.items?.forEach((wallet) => {
      const group = groups.find((item) => item.groupLabel === wallet.group?.name)
      if (group) {
        group.options.push({
          value: wallet.address,
          label: wallet.name
        })
      }
    })

    return groups.filter((item) => item.options.length > 0)
  }, [walletGroups, wallets])

  const activities = useMemo(
    () =>
      Object.keys(TxActivity).map((item) => ({
        value: TxActivity[item],
        label: TxActivity[item].replace('_', ' ')
      })),
    []
  )

  const tableItems = useMemo(() => data?.items || [], [data?.items])

  const transformData = useMemo(() => {
    const rowMapper = {}
    tableItems?.forEach((item, index) => {
      if (rowMapper[item.financialTransactionParent?.hash]) {
        rowMapper[item.financialTransactionParent?.hash].push({ ...item, isLastRow: index === limit - 1 })
      } else {
        rowMapper[item.financialTransactionParent?.hash] = [{ ...item, isLastRow: index === limit - 1 }]
      }
    })
    const tempData = []
    for (const [key, value] of Object.entries(rowMapper)) {
      tempData.push(value)
    }
    checkboxRef.current = null // adding null to handle shift+click on checkbox selection
    return { parsedData: tempData, rowMapper }
  }, [tableItems, limit])

  const handleGoToPage = (_page) => {
    setPage(_page)
  }

  const handleRetryExport = () => {
    console.log('try again')
  }

  const handleChangeTab = (tab: string) => {
    if (tab === 'missing') {
      setParams({
        search: params?.search || '',
        blockchainIds: params?.blockchainIds || [],
        substatuses: ['missing_price', 'missing_cost_basis']
      })
      setActiveTab(tab)
      setPage(0)
    } else if (tab === 'no-account') {
      setParams({
        search: params?.search || '',
        blockchainIds: params?.blockchainIds || [],
        correspondingChartOfAccountIds: 'null'
      })
      setActiveTab(tab)
      setPage(0)
    } else if (tab === 'failed-export') {
      setParams({
        search: params?.search || '',
        blockchainIds: params?.blockchainIds || [],
        exportStatuses: ['failed']
      })
      setActiveTab(tab)
      setPage(0)
    } else {
      setActiveTab('')
      setParams({
        search: params?.search || '',
        blockchainIds: params?.blockchainIds || []
      })
      setPage(0)
    }

    const query: any = {
      organizationId: orgId
    }
    if (tab) query.tab = tab
    if (router.query.id) query.id = router.query.id

    router.push(
      {
        pathname: 'transactions',
        query
      },
      undefined,
      { shallow: true }
    )
  }

  const handleOnePageBack = () => {
    setPage(page - 1)
  }

  const handleOnePageForward = () => {
    setPage(page + 1)
  }

  const handleChangeLimit = (_limit) => {
    setLimit(_limit)
  }
  const handleOnClickRow = (_row) => {
    // setSelectedTransactionId(_row.id)
    // onInitTempTags(_row.id, _row?.annotations)
    // setIsOpen(true)
    // triggerGetTx({
    //   orgId,
    //   id: _row.id,
    //   parentHash: _row.hash
    // })
    // triggerGetFiles({
    //   orgId,
    //   id: _row.id
    // })
  }

  const handleSyncRequestInvoice = () => {
    syncInvoices({ orgId })
    syncingRequestModalProvider.methods.setIsOpen(true)
  }

  const handleOnClickChildTx = (_row) => setSelectedTransactionId(_row.id)

  const transactionsTabs = [
    {
      key: '',
      name: 'All',
      active: true,
      count: allData?.totalItems ?? 0
    },
    {
      key: 'no-account',
      name: 'No account',
      count: uncategorizedData?.totalItems ?? 0,
      active: false
    },
    {
      key: 'missing',
      name: 'Missing Data',
      count: missingData?.totalItems ?? 0,
      active: false
    },
    {
      key: 'failed-export',
      name: 'Failed to export',
      count: failedExports?.totalItems ?? 0,
      active: false
    }
  ]

  const handleOnChange = (e) => {
    if (e?.target?.id === 'txhash') {
      if (router.query.id) {
        const query = router.query.tab ? { organizationId: orgId, tab: router.query.tab } : { organizationId: orgId }
        router.push(
          {
            pathname: 'transactions',
            query
          },
          undefined,
          { shallow: true }
        )
      }
      setPage(0)
      setParams({
        ...params,
        search: e.target.value
      })
    }
  }

  const handleSyncXero = () => {
    newExportModalProvider.methods.setIsOpen(false)
    integrationSyncModalProvider.methods.setIsOpen(true)
  }

  const handleRedirectToMapping = () => {
    router.push(`/${orgId}/chart-of-accounts/default-mapping`)
  }
  const handelRedirectToImport = () => {
    router.push(`/${organizationId}/chart-of-accounts?importCoa=true`)
  }

  const checkPrerequisiteErrors = useMemo(() => {
    const errors = []
    const isDefaultMappingMissing = chartOfAccountsMapping?.some(
      (item: any) => REQUIRED_MAPPINGS.includes(item.type) && item.chartOfAccount === null
    )
    if (isDefaultMappingMissing) {
      errors.push({
        error: 'Please ensure your account rules are setup before proceeding',
        cta: {
          label: 'Account Rules',
          onClick: handleRedirectToMapping
        }
      })
    }
    if (accountingIntegration && accountingIntegration?.status !== 'completed') {
      errors.push({
        error: `Please complete your ${integrationName} integration`,
        cta: {
          label: `Import ${integrationName} COA`,
          onClick: handelRedirectToImport
        }
      })
    }

    let found = false

    if (modifiedCoaQueryApi.isSuccess) {
      const modifiedCoa = modifiedCoaQueryApi.data
      for (const key in modifiedCoa) {
        if (Object.prototype.hasOwnProperty.call(modifiedCoa, key)) {
          const values = modifiedCoa[key]
          if (values.length > 0) {
            found = true
            break // Exit the loop when a value greater than 0 is found
          }
          if (found) {
            break // Exit the outer loop as well
          }
        }
      }
    }

    if (found) {
      errors.push({
        error: `Please ensure you have synced your ${integrationName} account before proceeding`,
        cta: {
          label: 'Update Now',
          onClick: handleSyncXero
        }
      })
    }
    return errors
  }, [chartOfAccountsMapping, modifiedCoaQueryApi, accountingIntegration])

  const handleOnClickAddContact = (_data) => {
    setIsContactOpen(true)
    setSelectedAddress(_data)
  }

  const handleOnClickCheckbox = (_data) => (e) => {
    e.stopPropagation()

    const parsedData = transformData?.parsedData?.flat(1)
    let inBetween = false
    if (e.shiftKey && checkboxRef.current && _data.id !== checkboxRef.current?.currTxn) {
      const clone = {
        checkedItems: {
          ...checkedItems
        },
        checkedItemsData: {
          ...checkedItemsData
        }
      }
      // select multiple items
      parsedData?.forEach((item) => {
        if (item.id === checkboxRef.current?.currTxn || item.id === _data.id) {
          inBetween = !inBetween
          if (e?.target?.checked) {
            clone.checkedItemsData = {
              ...clone.checkedItemsData,
              [item.id]: item
            }
            clone.checkedItems = {
              ...clone.checkedItems,
              [item.id]: true
            }
          } else {
            delete clone.checkedItemsData[item.id]
            clone.checkedItems = {
              ...clone.checkedItems,
              [item.id]: false
            }
          }
        } else if (inBetween) {
          if (e?.target?.checked) {
            clone.checkedItemsData = {
              ...clone.checkedItemsData,
              [item.id]: item
            }
            clone.checkedItems = {
              ...clone.checkedItems,
              [item.id]: true
            }
          } else {
            delete clone.checkedItemsData[item.id]
            clone.checkedItems = {
              ...clone.checkedItems,
              [item.id]: false
            }
          }
        }
      })

      setCheckedItemsData({
        ...clone.checkedItemsData
      })
      setCheckedItems({
        ...clone.checkedItems
      })
    } else {
      // select single item
      if (!checkedItems[_data.id]) {
        setCheckedItemsData({
          ...checkedItemsData,
          [_data.id]: _data
        })
        setXeroCheckedItemsData({
          ...xeroCheckedItemsData,
          [_data?.financialTransactionParent?.hash]: _data
        })
      } else {
        const clone = { ...checkedItemsData }
        delete clone[_data.id]

        const cloneXero = { ...xeroCheckedItemsData }
        delete cloneXero[_data?.financialTransactionParent?.hash]

        setCheckedItemsData(clone)
        setXeroCheckedItemsData(cloneXero)
      }

      setCheckedItems({
        ...checkedItems,
        [_data.id]: checkedItems[_data.id] === undefined ? true : !checkedItems[_data.id]
      })
    }

    checkboxRef.current = { checked: e.target.checked, currTxn: _data.id }
  }

  const parseAvailableAccounts = useMemo(() => {
    const groupedAccounts = {}
    availableAccounts?.forEach((item) => {
      if (!groupedAccounts[item.type.toUpperCase().trim()]) {
        groupedAccounts[item.type.toUpperCase().trim()] = [
          {
            value: item.id,
            label: item.code ? `${item.code} - ${item.name}` : item.name,
            // disabled: !item.isSelectable,
            code: item.code,
            name: item.name
          }
        ]
      } else {
        groupedAccounts[item.type.toUpperCase().trim()].push({
          value: item.id,
          label: item.code ? `${item.code} - ${item.name}` : item.name,
          // disabled: !item.isSelectable,
          code: item.code,
          name: item.name
        })
      }
    })

    const accountOptions = Object.entries(groupedAccounts)
      .map(([key, options]) => ({
        label: key,
        options
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return accountOptions
  }, [availableAccounts])

  const handleSelectAllTx = () => {
    checkboxRef.current = null
    const isSelectedAll = data.items.every((item) => checkedItems[item.id])

    const clone = { ...checkedItems }
    const cloneData = { ...checkedItemsData }

    if (isSelectedAll) {
      data.items.forEach((item) => {
        clone[item.id] = false
        delete cloneData[item.id]
      })
      setCheckedItemsData(cloneData)
      setCheckedItems(clone)
    } else {
      const filterData = data.items.filter((item) => !checkedItems[item.id])
      filterData.forEach((item) => {
        clone[item.id] = true
        cloneData[item.id] = { ...item }
        setCheckedItemsData(cloneData)
        setCheckedItems(clone)
      })
    }
  }

  const numberSelected = useMemo(() => {
    const values = Object.values(checkedItems)
    const count = values.reduce((n: any, val) => n + (val === true), 0)

    if (count) {
      // @ts-ignore
      return parseInt(count)
    }
    return 0
  }, [checkedItems])

  const handleOnChangeCategory = (_category: any) => {
    toast.success('Chart of account updated')

    const parsedTx = Object.values(checkedItemsData).map((item: any) => ({
      id: item.id,
      data: {
        correspondingChartOfAccountId: _category?.value,
        correspondingChartOfAccountCode: _category?.code ?? '',
        correspondingChartOfAccountName: _category?.name ?? ''
      }
    }))

    bulkUpdateFinacialTx({
      orgId,
      data: parsedTx,
      page,
      filterParams: {
        ...filters,
        ...params,
        correspondingChartOfAccountIds: activeTab === 'no-account' ? 'null' : filters?.correspondingChartOfAccountIds,
        size: limit
      }
    })

    setCheckedItems({})
    setCheckedItemsData({})
  }

  const activityElement = (activity) => <div className="flex items-center w-full pr-2 capitalize">{activity.label}</div>

  const handleSelectWallets = (walletAddresses: IOption[]) => {
    methods.setValue(
      'walletAddresses',
      walletAddresses.map((item) => item.value)
    )
  }
  const handleSelectActivities = (activitiyOptions: IOption[]) => {
    methods.setValue(
      'activities',
      activitiyOptions.map((item) => item.value)
    )
  }

  const handleChangeDate = (date: IDateRange) => {
    methods.setValue('startTime', date.startDate)
    methods.setValue('endTime', date.endDate)
  }

  const handleApply = (value) => {
    setPage(0)
    setFilters({
      ...filters,
      ...value,
      startTime: value?.startTime ? format(new Date(value?.startTime), 'yyyy-MM-dd') : '',
      endTime: value?.endTime ? format(new Date(value?.endTime), 'yyyy-MM-dd') : ''
    })
  }

  const handleClosePopup = () => {
    setCheckedItemsData({})
    setCheckedItems({})
  }

  const handleChangeAccount = (x) => {
    toast.success('Chart of account updated')
    updateFinnacialTx({
      orgId,
      id: x.tx.id,
      page,
      filterParams: {
        ...filters,
        ...params,
        correspondingChartOfAccountIds: activeTab === 'no-account' ? 'null' : filters?.correspondingChartOfAccountIds,
        size: limit
      },
      payload: {
        correspondingChartOfAccountId: x?.category?.value
      },
      optimisticAccount: {
        id: x?.category?.value || x?.category?.id,
        code: x?.category?.code ?? '',
        name: x?.category?.name ?? ''
      }
    })
  }

  const selectedItem = useMemo(() => {
    // @ts-ignore
    const txn = txData?.financialTransactions.find((transaction) => transaction.id === selectedTransactionId)
    if (txn) {
      return {
        ...txn,
        annotations: data?.items?.find((item) => item.id === selectedTransactionId)?.annotations,
        financialTransactionParent: data?.items?.find((item) => item.id === selectedTransactionId)
          .financialTransactionParent
      }
    }
    return null
  }, [selectedTransactionId, txData, data])

  const handleOnClickCta = () => {
    router.push(`/${orgId}/wallets`)
  }

  const handleAllChainSelect = () => {
    setAreAllChainsSelected(true)
    setFilters({ ...filters, blockchainIds: [] })
  }

  const handleChainfilter = (chainIdSelected: string) => {
    if (filters.blockchainIds.includes(chainIdSelected)) {
      setFilters({ ...filters, blockchainIds: filters.blockchainIds.filter((chain) => chain !== chainIdSelected) })
      if (filters.blockchainIds.filter((chain) => chain !== chainIdSelected).length === 0) {
        setAreAllChainsSelected(true)
      }
    } else {
      setFilters({ ...filters, blockchainIds: [...filters.blockchainIds, chainIdSelected] })
      setAreAllChainsSelected(false)
    }
  }

  const handleOnClickExportNew = (_exportType, isSkipExported = false) => {
    let nonEmptyFilters = {}
    const formattedFilter = { ...filters, ...formattedFilterTime }
    for (const key in formattedFilter) {
      if (
        (!isArray(formattedFilter[key]) && formattedFilter[key] !== '' && formattedFilter[key]) ||
        (isArray(formattedFilter[key]) && formattedFilter[key].length)
      ) {
        nonEmptyFilters = { ...nonEmptyFilters, [key]: formattedFilter[key] }
      }
    }
    if (_exportType.type === 'export-csv') {
      if (isNewExportsCSVEnabled) {
        if (_exportType.method === 'csv-all') {
          triggerExportAllCSV({
            organizationId: orgId,
            body: {
              type: 'all',
              fileType: 'text/csv',
              query: { ...nonEmptyFilters }
            }
          })
        } else if (_exportType?.method === 'csv-selected') {
          triggerExportAllCSV({
            organizationId: orgId,
            body: {
              type: 'manual',
              fileType: 'text/csv',
              financialTransactionIds: Object.keys(checkedItemsData)
            }
          })
        }
      } else {
        if (_exportType.method === 'csv-all') {
          triggerExportCSV({
            orgId,
            orgName: currentOrganization?.name
          })
        } else if (_exportType?.method === 'csv-selected') {
          triggerExportCSV({
            orgId,
            orgName: currentOrganization?.name,
            params: {
              ...filters,
              ...params
            }
          })
        }
      }
    } else if (_exportType.type === 'export-xero') {
      if (_exportType.method === 'xero-journal') {
        if (_exportType.xeroMethod === 'xero-all') {
          const type = isSkipExported ? 'unexported' : Object.keys(nonEmptyFilters)?.length ? 'filtered' : 'all'
          triggerExportJournalEntry({
            organizationId: orgId,
            body: {
              type,
              integrationName: accountingIntegration?.integrationName ?? IntegrationName.XERO,
              financialTransactionParentIds: [],
              queryParams: { ...nonEmptyFilters }
            }
          })
        } else {
          if (!isEmpty(checkedItems)) {
            const keysWithTrueValues = []

            // @ts-ignore
            for (const key in checkedItems) {
              // @ts-ignore
              if (checkedItems.hasOwnProperty(key) && checkedItems[key] === true) {
                keysWithTrueValues.push(key)
              }
            }

            const parentHashes = []
            const checkedItemsArray = Object.keys(checkedItemsData).filter((key) =>
              isSkipExported ? checkedItemsData[key].financialTransactionParent.exportStatus !== 'exported' : true
            )
            checkedItemsArray.forEach((key) => {
              parentHashes.push(checkedItemsData[key].financialTransactionParent.hash)
            })

            const uniqueParentHashes = Array.from(new Set(parentHashes))

            triggerExportJournalEntry({
              organizationId: orgId,
              body: {
                type: 'manual',
                integrationName: accountingIntegration?.integrationName ?? IntegrationName.XERO,
                financialTransactionParentIds: uniqueParentHashes
              }
            })
          } else {
            // window.alert('TODO - EXPORT FITLERED')
            // TODO - EXPORT FITLERED
          }
        }
      } else if (isBankFeedEnabled && _exportType.method === 'xero-bank') {
        triggerExportBankFeeds({
          organizationId,
          body: {
            blockchainId: _exportType.blockchainId,
            cryptocurrencyIds: _exportType.assetIds,
            walletId: _exportType.walletId,
            startTime: getUTCTDate(_exportType.startTime, timezone?.utcOffset),
            endTime: getUTCTDate(_exportType?.endTime, timezone?.utcOffset),
            integrationName: accountingIntegration?.integrationName,
            fileType: 'text/csv'
          }
        })
      }
    } else {
      console.log('Nada')
    }
  }

  const handleExportV2 = (payload: IExportPayLoad) => {
    let nonEmptyFilters = {}
    const formattedFilter = { ...filters, ...formattedFilterTime }
    for (const key in formattedFilter) {
      if (
        (!isArray(formattedFilter[key]) && formattedFilter[key] !== '' && formattedFilter[key]) ||
        (isArray(formattedFilter[key]) && formattedFilter[key].length)
      ) {
        nonEmptyFilters = { ...nonEmptyFilters, [key]: formattedFilter[key] }
      }
    }
    // Transactions
    if (payload.exportMethod === ExportMethod.TRANSACTIONS) {
      if (payload?.exportType === ExportType.ALL) {
        triggerExportAllCSV({
          organizationId: orgId,
          body: {
            type: 'all',
            fileType: payload?.exportTo || ExportTo.CSV,
            query: { ...nonEmptyFilters }
          }
        })
      } else {
        triggerExportAllCSV({
          organizationId: orgId,
          body: {
            type: 'manual',
            fileType: payload?.exportTo || ExportTo.CSV,
            financialTransactionIds: Object.keys(checkedItemsData)
          }
        })
      }
    }
    // Journal entries
    else if (payload.exportMethod === ExportMethod.JOURNAL_ENTRIES) {
      if (payload?.exportType === ExportType.ALL) {
        const type = Object.keys(nonEmptyFilters)?.length ? 'filtered' : 'all'
        triggerExportJournalEntry({
          organizationId: orgId,
          body: {
            type,
            integrationName: accountingIntegration?.integrationName ?? IntegrationName.XERO,
            financialTransactionParentIds: [],
            queryParams: { ...nonEmptyFilters }
          }
        })
      } else {
        const keysWithTrueValues = []
        for (const key in checkedItems) {
          if (checkedItems.hasOwnProperty(key) && checkedItems[key] === true) {
            keysWithTrueValues.push(key)
          }
        }
        const parentHashes = []
        const checkedItemsArray = Object.keys(checkedItemsData)
        checkedItemsArray.forEach((key) => {
          parentHashes.push(checkedItemsData[key].financialTransactionParent.hash)
        })

        const uniqueParentHashes = Array.from(new Set(parentHashes))

        triggerExportJournalEntry({
          organizationId: orgId,
          body: {
            type: 'manual',
            integrationName: accountingIntegration?.integrationName ?? IntegrationName.XERO,
            financialTransactionParentIds: uniqueParentHashes
          }
        })
      }
    }
    // Bank feeds
    else if (payload.exportMethod === ExportMethod.BANK_FEEDS) {
      triggerExportBankFeeds({
        organizationId,
        body: {
          blockchainId: payload.blockchainId,
          cryptocurrencyIds: payload.assetIds,
          walletId: payload.walletId,
          startTime: getUTCTDate(payload.startTime, timezone?.utcOffset),
          endTime: getUTCTDate(payload?.endTime, timezone?.utcOffset),
          integrationName: accountingIntegration?.integrationName,
          fileType: 'text/csv'
        }
      })
    }
  }

  const handleGenerateReport = (payload) => {
    triggerExportReport({
      organizationId,
      body: {
        startDate: payload?.startTime,
        endDate: payload?.endTime,
        interval: payload.reportInterval,
        fileType: payload?.exportTo || ExportTo.CSV
      }
    })
  }
  const handleOpenExportModal = () => {
    newExportModalProvider.methods.setIsOpen(true)
  }

  const handleRedirectToDefaultMapping = () => {
    router.push(`/${organizationId}/chart-of-accounts/default-mapping`)
  }

  const handleDropdownClick = (_option) => {
    if (_option.value === TransactionsAction.EXPORT) {
      newExportModalProvider.methods.setIsOpen(true)
    } else if (_option.value === TransactionsAction.GENERATE_REPORT) {
      generateReportProvider.methods.setIsOpen(true)
    }
  }

  // TODO - Improve this logic
  const isTransactionMissingMapping = useMemo(() => {
    let noTransactionMissingMapping = 0
    for (const key in checkedItemsData) {
      if (checkedItemsData.hasOwnProperty(key)) {
        const value = checkedItemsData[key]

        if (value?.correspondingChartOfAccount === null) {
          noTransactionMissingMapping++
        }
      }
    }

    return noTransactionMissingMapping
  }, [checkedItems])

  const tagsHandler = useMemo(
    () => ({
      options: tags?.map((_tag) => ({ value: _tag.id, label: _tag.name })) || [],
      onCreate: async (_tagName, _txnId) => {
        const newTag = await createTag({ organizationId: orgId, payload: { name: _tagName } }).unwrap()

        if (_txnId) {
          setTagsMap((prev) => ({ ...prev, [_txnId]: [...(prev[_txnId] || []), newTag] }))

          attachAnnotation({
            organizationId: orgId,
            childId: _txnId,
            annotationId: newTag.id,
            tagName: newTag.name,
            page,
            filterParams: {
              ...filters,
              ...params,
              correspondingChartOfAccountIds:
                activeTab === 'no-account' ? 'null' : filters?.correspondingChartOfAccountIds,
              size: limit
            }
          })
        }
      },
      onDelete: (_tag) => {
        setTagsMap((prev) => _.mapValues(prev, (_tags) => _tags.filter((t) => t.id !== _tag.value)))

        deleteTag({
          organizationId: orgId,
          id: _tag.value,
          page,
          filterParams: {
            ...filters,
            ...params,
            correspondingChartOfAccountIds:
              activeTab === 'no-account' ? 'null' : filters?.correspondingChartOfAccountIds,
            size: limit
          }
        })
      },
      onUpdate: (_tag, _newName) => {
        setTagsMap((prev) =>
          _.mapValues(prev, (_tags) => _tags.map((t) => (t.id === _tag.value ? { ...t, name: _newName } : t)))
        )

        updateTag({ organizationId: orgId, id: _tag.value, payload: { name: _newName } })
      },
      onAttachAnnotation: (_tag, _txnId) => {
        setTagsMap((prev) => ({ ...prev, [_txnId]: [...(prev[_txnId] || []), { id: _tag.value, name: _tag.label }] }))

        attachAnnotation({
          organizationId: orgId,
          childId: _txnId,
          annotationId: _tag.value,
          tagName: _tag.label,
          page,
          filterParams: {
            ...filters,
            ...params,
            correspondingChartOfAccountIds:
              activeTab === 'no-account' ? 'null' : filters?.correspondingChartOfAccountIds,
            size: limit
          }
        })
      },
      onDeleteAnnotation: (_tag, _txnId) => {
        setTagsMap((prev) => ({ ...prev, [_txnId]: prev[_txnId]?.filter((t) => t.id !== _tag.value) || [] }))

        deleteAnnotation({
          organizationId: orgId,
          childId: _txnId,
          annotationId: _tag.value,
          page,
          filterParams: {
            ...filters,
            ...params,
            correspondingChartOfAccountIds:
              activeTab === 'no-account' ? 'null' : filters?.correspondingChartOfAccountIds,
            size: limit
          }
        })
      }
    }),
    [tags, filters, params, activeTab, limit, page]
  )

  const onInitTempTags = (txnId: string, _tags: ITag[]) => {
    if (!tagsMap[txnId]) {
      setTagsMap((prev) => ({ ...prev, [txnId]: _tags }))
    }
  }
  const isRootfiUpgradeRequired = useMemo(() => {
    if (rootfiService?.isEnabled && accountingIntegration?.platform === 'merge') {
      return true
    }

    if ([OrgIntegrationStatus.FAILED, OrgIntegrationStatus.MIGRATING].includes(rootfiIntegration?.status)) {
      return true
    }

    return false
  }, [rootfiIntegration, accountingIntegration, rootfiService])

  const isMobile = useIsMobile()

  return (
    <div className="bg-white p-4 rounded-lg">
      <FormProvider {...methods}>
        <Header>
          <Header.Left>
            <Header.Left.Title>Transactions</Header.Left.Title>
            {/* {wallets?.items.length > 0 && (
              <div className="pl-4">
                <SyncChip
                  disabled={wallets?.items?.length === 0}
                  onClick={startWalletSync}
                  isSyncing={isWalletSyncing}
                  lastUpdated={lastUpdated}
                />
              </div>
            )} */}
          </Header.Left>
          {!isMobile && (
            <Header.Right>
              <Header.Right.SecondaryCTA
                data-tip="rootfi-upgrade-required"
                data-for="rootfi-upgrade-required"
                leadingIcon={<Image src={SettingsIcon} height={15} width={15} />}
                label="Account Rules"
                disabled={!availableAccounts || isRootfiUpgradeRequired || availableAccounts.length === 0}
                onClick={handleRedirectToDefaultMapping}
              />
              {isRootfiUpgradeRequired && (
                <ReactTooltip
                  id="rootfi-upgrade-required"
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="left"
                  className="w-[250px] !px-[10px]"
                >
                  <Typography variant="caption" styleVariant="semibold" classNames="mb-1">
                    {rootfiIntegration?.status === 'migrating'
                      ? 'Upgrade in progress'
                      : rootfiIntegration?.status === 'failed'
                      ? 'Failed to migrate'
                      : 'Upgrade Required'}
                  </Typography>
                  <Typography variant="caption">
                    {rootfiIntegration?.status === 'migrating'
                      ? 'This service is temporarily unavailable. Please wait a few minutes for process to be completed.'
                      : 'This service is temporarily unavailable. Please upgrade to continue.'}
                  </Typography>
                </ReactTooltip>
              )}
              {requestIntegration?.status === 'completed' && (
                <Header.Right.SecondaryCTA
                  leadingIcon={<Image src={RequestIcon} height={15} width={15} />}
                  label="Sync Invoices"
                  onClick={handleSyncRequestInvoice}
                />
              )}
              {wallets?.items?.length > 0 &&
                (!isSpotBalanceEnabled ? (
                  <Header.Right.PrimaryCTA
                    label="Export"
                    onClick={handleOpenExportModal}
                    leadingIcon={<Image src={ExportIcon} />}
                  />
                ) : (
                  <ButtonDropdown>
                    <ButtonDropdown.CTA label="Actions" />
                    <ButtonDropdown.Options
                      extendedClass="min-w-[153px]"
                      options={ACTION_OPTIONS}
                      onClick={handleDropdownClick}
                    />
                  </ButtonDropdown>
                ))}
            </Header.Right>
          )}
        </Header>
        <View.Content>
          {!isMobile && isFeatureEnabledForThisEnv && (
            <div className="flex my-4 gap-x-3">
              <MultiSelectCheckboxTab
                label="All Tokens"
                imageUrl={allChainsSvg}
                id="allChainsFilter"
                onChange={handleAllChainSelect}
                checked={areAllChainsSelected}
                checkboxGroupName="chainsFilter"
              />
              {uiSupportedChains?.map((chain) => (
                <MultiSelectCheckboxTab
                  label={chain.name}
                  imageUrl={chain.imageUrl}
                  checked={filters.blockchainIds.includes(chain.id) && !areAllChainsSelected}
                  onChange={() => handleChainfilter(chain.id)}
                  checkboxGroupName="chainsFilter"
                  id={chain.id}
                  key={chain.id}
                />
              ))}
            </div>
          )}
          {numberSelected > 0 && !newExportModalProvider.state.isOpen && !integrationSyncModalProvider.state.isOpen && (
            <TopBulkActions
              categories={parseAvailableAccounts}
              handleClosePopup={handleClosePopup}
              onClickChangeCategory={handleOnChangeCategory}
              // onClickIgnoreTx={handleOnClickIgnoreTx}
              numberSelected={numberSelected}
              isLoading={bulkUpdateFinacialTxResult.isLoading}
            />
          )}
          {Object.keys(checkedItems).length > 0}

          {/* {wallets?.items?.length === 0 ? (
          // <NoWalletsView />
          <div
            className={`${
              showBanner ? 'h-[calc(100vh-413px)]' : 'h-[calc(100vh-345px)]'
            } flex justify-center items-center flex-col`}
          >
            <EmptyData>
              <EmptyData.Icon icon={LargeClock} />
              <EmptyData.Title>Don't see any past transactions?</EmptyData.Title>
              <EmptyData.Subtitle>Import your wallet to view transactions.</EmptyData.Subtitle>
              <EmptyData.CTA onClick={handleOnClickCta} label="Import Wallet" />
            </EmptyData>
          </div>
        ) : ( */}
          <>
            <section id="filter" className="flex flex-row items-center justify-between flex-1 sm:hidden">
              <div className="flex flex-row gap-2 items-center flex-1 mr-3">
                <div className="w-full">
                  {/* <TextField /> */}
                  <Input
                    placeholder="Search by txn hash, reference..."
                    id="txhash"
                    onChange={debounce(handleOnChange, 300)}
                    isSearch
                    classNames="h-[32px]"
                    ref={searchRef}
                  />
                </div>
                <DividerVertical height="h-6" space="m-0" />
                <div className="w-full">
                  <GroupDropdown
                    options={walletOptions}
                    className="h-[34px] rounded"
                    name="walletAddresses"
                    title="Wallet"
                    selection={
                      filters?.walletAddresses?.map((item) => ({
                        value: item,
                        label: item
                      })) || []
                    }
                    setSelection={handleSelectWallets}
                    widthBtn="w-full"
                    dropdownWidth="w-full"
                    applyable
                    isReset
                    onApply={methods.handleSubmit(handleApply)}
                    onClear={() => {
                      toast.success('Filter cleared')
                      setPage(0)
                      methods.reset({ ...filters, walletAddresses: [] })
                      setFilters({
                        ...filters,
                        walletAddresses: []
                      })
                    }}
                  />
                </div>
                <div className="w-full">
                  <DateRangeFilter
                    selection={{
                      startDate: filters?.startTime ? new Date(filters?.startTime) : null,
                      endDate: filters?.endTime ? new Date(filters?.endTime) : null
                    }}
                    className="h-[34px] rounded"
                    setSelection={handleChangeDate}
                    widthBtn="w-full"
                    dropdownWidth="w-full"
                    isReset
                    applyable
                    onApply={methods.handleSubmit(handleApply)}
                    onClear={() => {
                      toast.success('Filter cleared')
                      setPage(0)
                      methods.reset({ ...filters, startTime: undefined, endTime: undefined })
                      setFilters({
                        ...filters,
                        startTime: undefined,
                        endTime: undefined
                      })
                    }}
                  />
                </div>
                <div className="w-full min-w-[220px]">
                  <MultipleDropDown
                    options={activities}
                    name="activities"
                    className="h-[34px] rounded"
                    title="Activity"
                    suffix="Activities"
                    selection={
                      filters?.activities?.map((item) => ({
                        value: item
                      })) || []
                    }
                    setSelection={handleSelectActivities}
                    widthBtn="w-full"
                    dropdownWidth="w-full"
                    element={activityElement}
                    isReset
                    applyable
                    onApply={methods.handleSubmit(handleApply)}
                    onClear={() => {
                      toast.success('Filter cleared')
                      setPage(0)
                      methods.reset({ ...filters, activities: [] })
                      setFilters({
                        ...filters,
                        activities: []
                      })
                    }}
                  />
                </div>
              </div>

              <Button
                variant="outlined"
                color="secondary"
                size="sm"
                onClick={() => {
                  setShowFilter(!showFilter)
                }}
                className="a hover:bg-grey-200 min-w-[125px]"
              >
                <Typography variant="caption" classNames="pt-[2px]">
                  All Filters {filterCount ? `(${filterCount})` : ''}
                </Typography>
                <img src="/svg/filter-funnel-02.svg" alt="filter" height={16} width={16} className="ml-1" />
              </Button>
            </section>
            <section id="table" className="pt-2 relative">
              <UnderlineTabs
                setActive={handleChangeTab}
                active={activeTab}
                tabs={transactionsTabs}
                classNameBtn="font-semibold text-sm px-6 py-[10px]"
                wrapperClassName="border-b-[1px] border-grey-200 mb-4"
                className="sm:overflow-x-auto no-scrollbar"
              >
                <TabItem key="">
                  {isLoadingFinacialTransactions || (data?.items && data.items.length > 0) ? (
                    <Table
                      totalItems={data?.totalItems || tableItems?.length}
                      limit={data?.limit || limit}
                      currentPage={data?.currentPage || page}
                      totalPages={data?.totalPages || 1}
                      data={transformData.parsedData}
                      handleGoToPage={handleGoToPage}
                      handleOnePageBack={handleOnePageBack}
                      handleOnePageForward={handleOnePageForward}
                      handleOnClickRow={handleOnClickRow}
                      onClickAddContact={handleOnClickAddContact}
                      handleOnClickCheckbox={handleOnClickCheckbox}
                      checkedItems={checkedItems}
                      chartOfAccounts={parseAvailableAccounts}
                      onClickChangeCategory={handleChangeAccount}
                      onSelectAllTx={handleSelectAllTx}
                      originalData={tableItems}
                      handleChangeLimit={handleChangeLimit}
                      onRetryExport={handleRetryExport}
                      loading={isLoadingFinacialTransactions && Boolean(orgId)}
                      txnTableColumns={txnTableColumns}
                      tagsHandler={tagsHandler}
                      onInitTempTags={onInitTempTags}
                      tagsMap={tagsMap}
                    />
                  ) : (
                    <div
                      className={`${
                        showBanner ? 'h-[calc(100vh-413px)]' : 'h-[calc(100vh-345px)]'
                      } flex justify-center items-center flex-col`}
                      style={{ border: '1px solid #CECECC' }}
                    >
                      <EmptyData>
                        <EmptyData.Icon icon={LargeDoucment} />
                        <EmptyData.Title>No Transactions Found</EmptyData.Title>
                      </EmptyData>
                    </div>
                  )}
                </TabItem>
                <TabItem key="no-account">
                  {isLoadingFinacialTransactions || (data?.items && data.items.length > 0) ? (
                    <Table
                      totalItems={data?.totalItems || tableItems?.length}
                      limit={data?.limit || limit}
                      currentPage={data?.currentPage || page}
                      totalPages={data?.totalPages || 1}
                      data={transformData.parsedData}
                      handleGoToPage={handleGoToPage}
                      handleOnePageBack={handleOnePageBack}
                      handleOnePageForward={handleOnePageForward}
                      handleOnClickRow={handleOnClickRow}
                      onClickAddContact={handleOnClickAddContact}
                      handleOnClickCheckbox={handleOnClickCheckbox}
                      checkedItems={checkedItems}
                      chartOfAccounts={parseAvailableAccounts}
                      onClickChangeCategory={handleChangeAccount}
                      onSelectAllTx={handleSelectAllTx}
                      originalData={tableItems}
                      onRetryExport={handleRetryExport}
                      handleChangeLimit={handleChangeLimit}
                      loading={isLoadingFinacialTransactions && Boolean(orgId)}
                      txnTableColumns={txnTableColumns}
                      tagsHandler={tagsHandler}
                      onInitTempTags={onInitTempTags}
                      tagsMap={tagsMap}
                    />
                  ) : (
                    <div
                      className={`${
                        showBanner ? 'h-[calc(100vh-413px)]' : 'h-[calc(100vh-345px)]'
                      } flex justify-center items-center flex-col`}
                      style={{ border: '1px solid #CECECC' }}
                    >
                      <EmptyData>
                        <EmptyData.Icon icon={LargeDoucment} />
                        <EmptyData.Title>No Transactions Found</EmptyData.Title>
                      </EmptyData>
                    </div>
                  )}
                </TabItem>
                <TabItem key="missing">
                  {isLoadingFinacialTransactions || (data?.items && data.items.length > 0) ? (
                    <Table
                      totalItems={data?.totalItems || tableItems?.length}
                      limit={data?.limit || limit}
                      currentPage={data?.currentPage || page}
                      totalPages={data?.totalPages || 1}
                      data={transformData.parsedData}
                      handleGoToPage={handleGoToPage}
                      handleOnePageBack={handleOnePageBack}
                      handleOnePageForward={handleOnePageForward}
                      handleOnClickRow={handleOnClickRow}
                      onClickAddContact={handleOnClickAddContact}
                      handleOnClickCheckbox={handleOnClickCheckbox}
                      checkedItems={checkedItems}
                      chartOfAccounts={parseAvailableAccounts}
                      onClickChangeCategory={handleChangeAccount}
                      onSelectAllTx={handleSelectAllTx}
                      originalData={tableItems}
                      onRetryExport={handleRetryExport}
                      handleChangeLimit={handleChangeLimit}
                      loading={isLoadingFinacialTransactions && Boolean(orgId)}
                      txnTableColumns={txnTableColumns}
                      tagsHandler={tagsHandler}
                      tagsMap={tagsMap}
                      onInitTempTags={onInitTempTags}
                    />
                  ) : (
                    <div
                      className={`${
                        showBanner ? 'h-[calc(100vh-413px)]' : 'h-[calc(100vh-345px)]'
                      } flex justify-center items-center flex-col`}
                      style={{ border: '1px solid #CECECC' }}
                    >
                      <EmptyData>
                        <EmptyData.Icon icon={LargeDoucment} />
                        <EmptyData.Title>No Transactions Found</EmptyData.Title>
                      </EmptyData>
                    </div>
                  )}
                </TabItem>
                <TabItem key="failed-export">
                  {isLoadingFinacialTransactions || (failedExports?.items && failedExports.items.length > 0) ? (
                    <Table
                      totalItems={data?.totalItems}
                      limit={data?.limit}
                      currentPage={data?.currentPage}
                      totalPages={data?.totalPages}
                      data={transformData.parsedData}
                      handleGoToPage={handleGoToPage}
                      handleOnePageBack={handleOnePageBack}
                      handleOnePageForward={handleOnePageForward}
                      handleOnClickRow={handleOnClickRow}
                      onClickAddContact={handleOnClickAddContact}
                      handleOnClickCheckbox={handleOnClickCheckbox}
                      checkedItems={checkedItems}
                      chartOfAccounts={parseAvailableAccounts}
                      onClickChangeCategory={handleChangeAccount}
                      onSelectAllTx={handleSelectAllTx}
                      originalData={data?.items}
                      onRetryExport={handleRetryExport}
                      handleChangeLimit={handleChangeLimit}
                      loading={isLoadingFinacialTransactions}
                      txnTableColumns={txnTableColumns}
                      tagsHandler={tagsHandler}
                      onInitTempTags={onInitTempTags}
                      tagsMap={tagsMap}
                    />
                  ) : (
                    <div
                      className={`${
                        showBanner ? 'h-[calc(100vh-413px)]' : 'h-[calc(100vh-345px)]'
                      } flex justify-center items-center flex-col`}
                      style={{ border: '1px solid #CECECC' }}
                    >
                      <EmptyData>
                        <EmptyData.Icon icon={LargeDoucment} />
                        <EmptyData.Title>No Transactions Found</EmptyData.Title>
                      </EmptyData>
                    </div>
                  )}
                </TabItem>
              </UnderlineTabs>
              <div className="absolute right-0 top-3 sm:!hidden">
                <DynamicColumnDropdown
                  columns={txnTableColumns}
                  onChange={(_columns, checked) => {
                    setTxnTableColumns((prev) => ({ ...prev, [_columns]: checked }))
                  }}
                />
              </div>
            </section>
          </>
          {/* )} */}
          <TxFilter
            setPage={setPage}
            showModal={showFilter}
            chartOfAccountsList={parseAvailableAccounts || []}
            setShowModal={setShowFilter}
            filters={filters}
            setFilters={setFilters}
            walletList={wallets?.items || []}
            contactList={contacts?.items || []}
            activitiesOptions={activities}
            walletOptions={walletOptions}
            tagOptions={annotations?.map((_annotation) => ({
              label: _annotation.name,
              value: _annotation.id
            }))}
            accountingIntegration={accountingIntegration}
          />
          <SideModal
            renderActionButtons={false}
            title={
              displayParent ? (
                'Transaction Details'
              ) : (
                <div className="flex flex-row items-center">
                  <Image className="cursor-pointer" onClick={() => setDisplayParent(true)} src={ArrowLeft} width={40} />{' '}
                  {capitalize(selectedItem?.typeDetail?.label)}
                  <DividerVertical />
                  <div className="flex flex-row gap-2 justify-end items-center text-sm font-medium">
                    <img alt="" src={selectedItem?.cryptocurrency.image.small} width={15} />
                    <p style={{ color: selectedItem?.type === 'deposit' ? '#0BA740' : '#B41414' }}>
                      {selectedItem?.cryptocurrencyAmount}
                    </p>
                    <p>{selectedItem?.cryptocurrency?.symbol}</p>
                  </div>
                </div>
              )
            }
            titleClassName="border-b-0"
            showModal={isOpen}
            setShowModal={setIsOpen}
            onClose={() => {
              setDisplayParent(false)
            }}
          >
            <SideModalContent
              onClickChildTx={handleOnClickChildTx}
              displayParent={displayParent}
              setDisplayParent={setDisplayParent}
              data={txData}
              isLoading={isTransactionDetailLoading}
              files={filesData}
              resetTab={!isOpen || displayParent}
              chartOfAccounts={parseAvailableAccounts}
              selectedItem={selectedItem}
              isResetData={!isOpen}
              isConnectedRequest={requestIntegration?.status === 'completed'}
              tagsHandler={tagsHandler}
              tags={tagsMap[selectedTransactionId]}
            />
          </SideModal>

          <ContactTransactionModal
            showModal={isAddContactOpen}
            setShowModal={setIsContactOpen}
            contactAddress={selectedAddress}
          />
          {isSpotBalanceEnabled ? (
            <ExportModalV2
              walletList={wallets?.items}
              filteredItems={data?.totalItems}
              provider={newExportModalProvider}
              modifiedCoaQuery={modifiedCoaQuery}
              onClickPrimary={handleExportV2}
              accountingIntegration={accountingIntegration}
              prerequisitesErrors={checkPrerequisiteErrors}
              isFetching={modifiedCoaQueryApi?.isFetching}
              selectedItems={Object.values(checkedItems).filter((checked) => checked).length}
              isLoading={
                exportJournalEntryApi.isLoading ||
                (isNewExportsCSVEnabled ? isloadingCSVExport : isloadingCSV) ||
                (isloadingBankFeedExport && isBankFeedEnabled)
              }
            />
          ) : (
            <NewExportModa
              onClickPrimary={handleOnClickExportNew}
              provider={newExportModalProvider}
              selectedItems={Object.values(checkedItems).filter((checked) => checked).length}
              unexportedItems={
                Object.values(checkedItemsData).length
                  ? Object.values(checkedItemsData).filter(
                      (item: any) => item.financialTransactionParent.exportStatus !== 'exported'
                    ).length
                  : null
              }
              filteredItems={data?.totalItems}
              totalItems={totalItems}
              walletList={wallets?.items}
              totalUnfilteredItems={allTransactionsWithoutFilters?.totalItems}
              prerequisitesErrors={checkPrerequisiteErrors}
              isLoading={
                exportJournalEntryApi.isLoading ||
                (isNewExportsCSVEnabled ? isloadingCSVExport : isloadingCSV) ||
                (isloadingBankFeedExport && isBankFeedEnabled)
              }
              transactionsMissingMapping={isTransactionMissingMapping}
              modifiedCoaQuery={modifiedCoaQuery}
              isFetching={modifiedCoaQueryApi?.isFetching}
              accountingIntegration={accountingIntegration}
            />
          )}
          {isSpotBalanceEnabled && (
            <GenerateReportModal
              provider={generateReportProvider}
              onClickPrimary={handleGenerateReport}
              isLoading={isLoadingReportExport}
              isSuccess={isSuccessReportExport}
            />
          )}
          {/* <BulkUpdateErrorModal
          provider={bulkUpdateErrorModalProvider}
          title={bulkUpdateFinacialTxResult.error}
          decription="There are some transactions's chart of account can't be updated because they are using default mapping"
          onClickPrimaryCTA={() => {
            bulkUpdateErrorModalProvider.methods.setIsOpen(false)
          }}
        /> */}
          <IntegrationSyncModal
            provider={integrationSyncModalProvider}
            organizationId={orgId}
            modifiedCoaQueryApi={modifiedCoaQueryApi.data}
          />
          <ExportOnboardingModal
            provider={exportOnboardingModalProvider}
            accountingIntegration={accountingIntegration}
            exportType={exportType}
          />
          <LoadingPopUp
            title="Syncing invoices from Request"
            decription="Syncing invoices to transactions..."
            provider={syncingRequestModalProvider}
          />
        </View.Content>
      </FormProvider>
    </div>
  )
}

export default TransactionV2
