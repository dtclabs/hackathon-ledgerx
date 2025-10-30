/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState, useRef, useMemo } from 'react'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import XeroIcon from '@/public/svg/icons/xero-logo-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import GreyCheckIcon from '@/public/svg/icons/grey-check-icon.svg'
import {
  useJournalEntryExportsQuery,
  useDeleteJournalEntryMutation,
  useExportJournalEntryMutation,
  useGetCSVExportsQuery,
  useLazyDownloadCSVFileQuery,
  useGetBankFeedExportsQuery,
  useLazyDownloadBankFeedExportQuery,
  useGetReportExportsQuery,
  useLazyDownloadReportExportQuery
} from '@/api-v2/financial-tx-api'

import { useOrganizationId } from '@/utils/getOrganizationId'
import { EmptyData } from '../EmptyData/EmptyData2'
import Typography from '@/components-v2/atoms/Typography'
import { capitalize } from 'lodash'
import DeleteIcon from '@/public/svg/icons/delete-icon-red.svg'
import { toast } from 'react-toastify'
import { useOutsideClick } from '@/hooks/useOutsideClick'

import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { useAppDispatch, useAppSelector } from '@/state'
import { api } from '@/api-v2'
import { isMonetisationEnabled, isQuickBooksEnabled } from '@/config-v2/constants'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { SubscriptionStatus } from '@/api-v2/subscription-api'
import { IntegrationName } from '@/api-v2/organization-integrations'
import ExportIcon from '@/public/svg/icons/share-icon-black.svg'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import TabItem from '@/components/TabsComponent/TabItem'
import tickIcon from '@/public/svg/empty-data-icons/tick-with-grey-circle.svg'
import sheetIcon from '@/public/svg/icons/excel-sheet.svg'
import PdfIcon from '@/public/image/pdf.png'
import Pill from '@/components-v2/atoms/Pill'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useGetCryptoCurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { ExportTo, ExportMethod, FILE_TYPE } from '@/views/Transactions-v2/ExportModalV2/interface'

const PROCESS_STATES = ['generating', 'exporting']

const ExportsDialog = ({ accountingIntegration, toggleRunning }) => {
  const [journalPolling, setJournalPolling] = useState(5000)
  const [csvPolling, setCsvPolling] = useState(5000)
  const [reportsPolling, setReportsPolling] = useState(5000)
  const [bankFeedPolling, setBankFeedPolling] = useState(5000)
  const [activeTab, setActiveTab] = useState<string>('integrationExports')
  const organizationId = useOrganizationId()
  const [isOpen, setIsOpen] = useState(false)
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)
  const wallets = useAppSelector(walletsSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const { data: cryptocurrencies } = useGetCryptoCurrenciesQuery({})
  const isBankFeedEnabled = useAppSelector((state) => selectFeatureState(state, 'isBankFeedEnabled'))
  const isSpotBalanceEnabled = useAppSelector((state) => selectFeatureState(state, 'isSpotBalanceEnabled'))

  const EXPORT_TAB_MAP = {
    integrationExports: 'integrationExports',
    bankFeeds: 'bankFeeds',
    generatedExports: 'generatedExports'
  }
  const EXPORT_TABS = [
    {
      key: EXPORT_TAB_MAP.integrationExports,
      name: 'Integration Exports'
    },
    // {
    //   key: 'bankFeeds',
    //   name: 'Bank Feeds',
    //   hidden: !isBankFeedEnabled
    // },
    ...(isBankFeedEnabled &&
    (!accountingIntegration?.integrationName || accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS)
      ? [{ key: EXPORT_TAB_MAP.bankFeeds, name: 'Bank Feeds' }]
      : []),
    {
      key: EXPORT_TAB_MAP.generatedExports,
      name: 'Generated Exports'
    }
  ]

  const {
    data: txnsExports,
    isLoading: isCSVLoading,
    isSuccess: isCSVSuccess,
    isFetching: isCSVFetching
  } = useGetCSVExportsQuery({ organizationId }, { skip: !organizationId, pollingInterval: csvPolling })

  const {
    data: balanceReports,
    isLoading: balanceReportsLoading,
    isSuccess: balanceReportsSuccess,
    isFetching: balanceReportsFetching
  } = useGetReportExportsQuery(
    { organizationId, types: ['spot_balance'], size: 5 },
    { skip: !organizationId, pollingInterval: reportsPolling }
  )

  const { data, isLoading, isSuccess, isFetching } = useJournalEntryExportsQuery(
    {
      organizationId,
      params: {
        integrationName: accountingIntegration?.integrationName
      }
    },
    {
      skip: !organizationId || !accountingIntegration?.integrationName,
      pollingInterval: journalPolling
    }
  )

  const {
    data: bankFeedExports,
    isLoading: isBankFeedLoading,
    isSuccess: isBankFeedSuccess,
    isFetching: isBankFeedFetching
  } = useGetBankFeedExportsQuery({ organizationId }, { skip: !organizationId, pollingInterval: bankFeedPolling })

  const dispatch = useAppDispatch()

  const [triggerDeleteJournalEntry, deleteJournalEntryApi] = useDeleteJournalEntryMutation()
  const [triggerExportJournalEntry, exportJournalEntryApi] = useExportJournalEntryMutation()

  const wrapperRef = useRef(null)
  const router = useRouter()

  useOutsideClick(wrapperRef, () => setIsOpen(false))

  const toggleDialog = () => {
    setIsOpen(!isOpen)
  }

  const redirectToGenerate = () => {
    router.push(`/${organizationId}/transactions?generate=true`)
    setIsOpen(!isOpen)
  }

  const redirectToIntegration = () => {
    router.push(`/${organizationId}/integrations`)
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (isCSVSuccess) {
      const isAllEndState = txnsExports?.filter((item) => PROCESS_STATES.includes(item?.status))
      if (isAllEndState?.length > 0) {
        setCsvPolling(5000)
      } else {
        setCsvPolling(0)
      }
    } else {
      setCsvPolling(0)
    }
  }, [isCSVSuccess, isCSVLoading, isCSVFetching])

  useEffect(() => {
    if (balanceReportsSuccess) {
      const isAllEndState = balanceReports?.filter((item) => PROCESS_STATES.includes(item?.status))
      if (isAllEndState?.length > 0) {
        setReportsPolling(5000)
      } else {
        setReportsPolling(0)
      }
    } else {
      setReportsPolling(0)
    }
  }, [balanceReportsSuccess, balanceReportsLoading, balanceReportsFetching])

  const generatedExports = useMemo(() => {
    if (balanceReports?.length || txnsExports?.length) {
      const txnsExportsMap = txnsExports?.map((item) => ({ ...item, type: ExportMethod.TRANSACTIONS })) || []
      const reportExportsMap = balanceReports?.map((item) => ({ ...item, type: ExportMethod.REPORT })) || []

      const mergedCSVExports = isSpotBalanceEnabled ? [...txnsExportsMap, ...reportExportsMap] : [...txnsExportsMap]

      const lastFiveCSVExports = mergedCSVExports?.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 5)
      return lastFiveCSVExports
    }

    return []
  }, [balanceReports, txnsExports])

  useEffect(() => {
    if (isBankFeedSuccess) {
      const isAllEndState = bankFeedExports?.filter((item) => PROCESS_STATES.includes(item?.status))
      if (isAllEndState?.length > 0) {
        setBankFeedPolling(5000)
      } else {
        setBankFeedPolling(0)
      }
    } else {
      setBankFeedPolling(0)
    }
  }, [isBankFeedSuccess, isBankFeedLoading, isBankFeedFetching])

  useEffect(() => {
    if (isSuccess) {
      const isAllEndState = data?.filter((item) => PROCESS_STATES.includes(item?.status))
      if (isAllEndState?.length > 0) {
        setJournalPolling(5000)
        toggleRunning(true)
      } else {
        setJournalPolling(0)
        toggleRunning(false)
        // dispatch(setIsExportedFinish(true))
        dispatch(api.util.invalidateTags(['transactions']))
      }
    } else {
      setJournalPolling(0)
      toggleRunning(false)
      // dispatch(setIsExportedFinish(true))
      dispatch(api.util.invalidateTags(['transactions']))
    }
  }, [isSuccess, isLoading, isFetching])

  useEffect(() => {
    if (deleteJournalEntryApi.isSuccess) {
      toast.success('Successfully deleted journal entry')
    } else if (deleteJournalEntryApi.isError) {
      toast.error(deleteJournalEntryApi.error?.data?.message ?? 'Error deleting journal entry')
    }
  }, [deleteJournalEntryApi])

  useEffect(() => {
    if (exportJournalEntryApi.isSuccess) {
      toast.success(
        `Processing your ${
          accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'
        } export`
      )
    } else if (exportJournalEntryApi.isError) {
      toast.error(exportJournalEntryApi.error?.data?.message ?? 'Error exporting journal entry')
    }
  }, [exportJournalEntryApi])

  const deleteJournalEntry = (_id) => {
    triggerDeleteJournalEntry({ organizationId, id: _id })
  }

  const onClickExportEntry = (_id) => {
    triggerExportJournalEntry({ organizationId, id: _id })
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {isMonetisationEnabled && subscriptionPlan?.status !== SubscriptionStatus.EXPIRED && (
        <Button
          leadingIcon={<Image src={ExportIcon} />}
          variant="whiteWithBlackBorder"
          height={32}
          label="Past Exports"
          onClick={toggleDialog}
          classNames="!font-normal"
        />
      )}

      {isOpen && (
        <div className="absolute right-0" style={{ zIndex: 1000 }}>
          <div className="bg-white w-[600px] h-[500px] overflow-auto shadow-md drop-shadow rounded-lg mt-2 scrollbar">
            <div className="pt-6 pl-6 pr-6 pb-3">
              <div className="flex items-center gap-3">
                <Typography variant="heading3" classNames="mb-1 whitespace-nowrap">
                  Exports
                </Typography>
              </div>
            </div>
            <UnderlineTabs
              tabs={EXPORT_TABS}
              active={activeTab}
              setActive={(tab) => setActiveTab(tab)}
              classNameBtn="font-semibold text-sm px-6 font-inter"
              wrapperClassName=" border-b-[1px] border-grey-200"
            >
              <TabItem key={EXPORT_TAB_MAP.integrationExports}>
                {!data && !accountingIntegration && (
                  <div className="px-8 flex flex-col items-center justify-center text-center min-h-[387px]">
                    <EmptyData>
                      <div className="flex">
                        <div className="mr-[-13px] p-0 z-10">
                          <EmptyData.Icon icon={XeroIcon} />
                        </div>
                        <div>
                          <EmptyData.Icon icon={QuickBooksIcon} />
                        </div>
                      </div>

                      <EmptyData.Title>Want to export your transactions to your accounting software?</EmptyData.Title>
                      <EmptyData.Subtitle>
                        Connect with your preferred accounting software to continue.
                      </EmptyData.Subtitle>
                      <EmptyData.CTA onClick={redirectToIntegration} label="Connect Now" />
                    </EmptyData>
                  </div>
                )}
                {!data && accountingIntegration && (
                  <div className="pb-20 px-8 flex flex-col items-center justify-center min-h-[387px]">
                    <EmptyData>
                      <EmptyData.Icon icon={tickIcon} />
                      <EmptyData.Title>You are all caught up!</EmptyData.Title>
                      <EmptyData.Subtitle>
                        Up to 5 batch of generated journal entries will appear here and will be ready to export to
                        Xero/Quickbooks.
                      </EmptyData.Subtitle>
                      <EmptyData.CTA onClick={redirectToGenerate} label="Generate Now" />
                    </EmptyData>
                  </div>
                )}
                {data?.length > 0 && (
                  <div>
                    {data?.map((entry, index) => (
                      <JournalEntryItem
                        key={index}
                        index={index}
                        accountingIntegration={accountingIntegration}
                        onClickExportEntry={onClickExportEntry}
                        onClickDeleteEntry={deleteJournalEntry}
                        {...entry}
                      />
                    ))}
                  </div>
                )}
              </TabItem>
              {isBankFeedEnabled && (
                <TabItem key={EXPORT_TAB_MAP.bankFeeds}>
                  {!bankFeedExports && (
                    <div className="pb-20 px-8 flex flex-col items-center justify-center min-h-[387px]">
                      <EmptyData>
                        <EmptyData.Icon icon={tickIcon} />
                        <EmptyData.Title>You are all caught up!</EmptyData.Title>
                        <EmptyData.Subtitle>Up to 5 bank feeds downloads will appear here.</EmptyData.Subtitle>
                        <EmptyData.CTA onClick={redirectToGenerate} label="Generate Now" />
                      </EmptyData>
                    </div>
                  )}
                  {bankFeedExports?.length > 0 && (
                    <div>
                      {bankFeedExports?.map((entry, index) => (
                        <BankFeedExportItem
                          keyId={index}
                          index={index}
                          wallet={wallets?.find((wallet) => wallet.id === entry.walletId)}
                          blockchain={supportedChains?.find((chain) => chain.id === entry.blockchainId)}
                          asset={cryptocurrencies?.data?.find((item) => item.publicId === entry.cryptocurrencyId)}
                          {...entry}
                        />
                      ))}
                    </div>
                  )}
                </TabItem>
              )}
              <TabItem key={EXPORT_TAB_MAP.generatedExports}>
                {!generatedExports?.length && (
                  <div className="pb-20 px-8 flex flex-col items-center justify-center min-h-[387px]">
                    <EmptyData>
                      <EmptyData.Icon icon={tickIcon} />
                      <EmptyData.Title>You are all caught up!</EmptyData.Title>
                      <EmptyData.Subtitle>Up to 5 file downloads will appear here.</EmptyData.Subtitle>
                      <EmptyData.CTA onClick={redirectToGenerate} label="Export Transactions" />
                    </EmptyData>
                  </div>
                )}
                {generatedExports?.length > 0 && (
                  <div>
                    {generatedExports?.map((entry, index) => (
                      <CSVExportItem keyId={index} index={index} {...entry} />
                    ))}
                  </div>
                )}
              </TabItem>
            </UnderlineTabs>
          </div>
        </div>
      )}
    </div>
  )
}

const JournalEntryItem = ({
  id,
  name,
  key,
  index,
  status,
  onClickDeleteEntry,
  generatedAt,
  onClickExportEntry,
  generatedSuccessfulCount,
  generatedFailedCount,
  completedAt,
  updatedAt,
  exportedSuccessfulCount,
  exportedFailedCount,
  accountingIntegration
}) => {
  const handleDeleteEntry = () => {
    onClickDeleteEntry(id)
  }

  const handleExportEntry = () => {
    onClickExportEntry(id)
  }

  return (
    <div className="flex flex-row px-6 py-4 border-b border-[#F1F1EF]">
      <div>
        <div
          style={{
            borderRadius: '50%',
            border: '1px solid #EAECF0',
            height: 45,
            width: 45,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Image
            src={accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroIcon}
            alt="Integration Logo"
            height={30}
            width={30}
          />
        </div>
      </div>
      <div className="pl-6 flex-1">
        <div className="flex gap-2 items-center">
          <Typography variant="body2" styleVariant="semibold">
            {capitalize(name)}
          </Typography>
          <Pill label={capitalize(accountingIntegration?.integrationName)} bgColor="#F2F4F7" fontColor="#1D2939" />
        </div>

        <Typography variant="caption" color="secondary" classNames="pt-1">
          Generated on: {generatedAt ? format(new Date(generatedAt), 'dd/MM/yyyy') : '-'}
        </Typography>
        <Typography variant="caption" color="secondary">
          Generated - Success: {generatedSuccessfulCount} /{' '}
          <span className={generatedFailedCount > 0 && 'text-error-500'}>Failed: {generatedFailedCount}</span>
        </Typography>
        <Typography classNames="pt-1" variant="caption" color="secondary">
          {status === 'aborted' && `Cancelled on: ${format(new Date(updatedAt), 'dd/MM/yyyy')}`}
          {status === 'completed' && `Exported on: ${format(new Date(completedAt), 'dd/MM/yyyy')}`}
        </Typography>
        {(status === 'exporting' || status === 'completed') && (
          <Typography variant="caption" color="secondary">
            Exported - Success: {exportedSuccessfulCount} /{' '}
            <span className={exportedFailedCount > 0 && 'text-error-500'}>Failed: {exportedFailedCount}</span>
          </Typography>
        )}
      </div>
      <div className="basis-2/5 h-[100%] justify-center">
        <div className="flex h-[100%] items-center justify-end">
          {status === 'generated_failed' && (
            <div className="flex items-center flex-row gap-3">
              <Typography variant="caption" color="error">
                Failed
              </Typography>
              <Button
                onClick={handleDeleteEntry}
                variant="ghost"
                height={32}
                label=""
                leadingIcon={<Image src={DeleteIcon} />}
              />
            </div>
          )}
          {status === 'generating' && (
            <Typography variant="caption" color="secondary">
              {`${capitalize(status)}...`}
            </Typography>
          )}
          {status === 'exporting' && (
            <Typography variant="caption" color="secondary">
              {`${capitalize(status)} to ${capitalize(accountingIntegration?.integrationName)}...`}
            </Typography>
          )}
          {status === 'generated' && (
            <div className="flex flex-row gap-2">
              <Button onClick={handleExportEntry} variant="whiteWithBlackBorder" height={32} label="Export" />
              <Button
                onClick={handleDeleteEntry}
                variant="ghost"
                height={32}
                label=""
                leadingIcon={<Image src={DeleteIcon} />}
              />
            </div>
          )}
          {status === 'aborted' && (
            <Typography color="error" variant="caption">
              Cancelled
            </Typography>
          )}
          {status === 'completed' && (
            <div className="flex flex-row gap-2">
              <Image src={GreyCheckIcon} height={10} width={10} />
              <Typography color="secondary" variant="caption">
                {exportedFailedCount || generatedFailedCount
                  ? `Exported ${exportedSuccessfulCount}/${generatedFailedCount + generatedSuccessfulCount}`
                  : 'Exported'}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CSVExportItem = ({ id, name, keyId, status, completedAt, type, fileType }) => {
  const organizationId = useOrganizationId()
  const [triggerDownloadCSV, { isError: isDownloadCSVError, isLoading }] = useLazyDownloadCSVFileQuery()
  const [triggerDownloadReport, { isError: isDownloadReportError, isLoading: isDownloadReportLoading }] =
    useLazyDownloadReportExportQuery()

  useEffect(() => {
    if (isDownloadCSVError) {
      toast.error('There was a problem with downloading your file. Please try again')
    }
  }, [isDownloadCSVError])

  useEffect(() => {
    if (isDownloadReportError) {
      toast.error('There was a problem with downloading your file. Please try again')
    }
  }, [isDownloadReportError])

  const handleDownloadCSV = () => {
    if (type === ExportMethod.TRANSACTIONS) {
      triggerDownloadCSV({ orgId: organizationId, id, fileName: name })
    } else if (type === ExportMethod.REPORT) {
      triggerDownloadReport({ orgId: organizationId, id, fileName: name })
    }
  }

  return (
    <div className="flex flex-row px-6 py-4 border-b border-[#F1F1EF]" key={keyId}>
      <div
        style={{
          borderRadius: '50%',
          border: '1px solid #EAECF0',
          height: 45,
          width: 45,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div className="h-5">
          <Image src={fileType === ExportTo.PDF ? PdfIcon : sheetIcon} alt="file" height={20} width={20} />
        </div>
      </div>
      <div className="pl-6 flex-1">
        <div className="flex gap-2 items-center">
          <Typography variant="body2" styleVariant="semibold" classNames="capitalize">
            {capitalize(name)}
          </Typography>
          <Pill label={FILE_TYPE[fileType || ExportTo.CSV] || 'CSV'} bgColor="#F2F4F7" fontColor="#1D2939" />
        </div>
        <Typography classNames="pt-1" variant="caption" color="secondary">
          {`Generated on: ${status === 'completed' ? format(new Date(completedAt), 'dd/MM/yyyy') : ''}`}
        </Typography>
      </div>
      <div className="basis-1/3 h-full justify-center">
        <div className="flex h-full items-center justify-end">
          {status === 'failed' && (
            <div className="flex items-center flex-row gap-3">
              <Typography variant="caption" color="error">
                <p>Generate Failed.</p>
                <p>Please try again.</p>
              </Typography>
            </div>
          )}
          {status === 'generating' && (
            <Typography variant="caption" color="secondary">
              Generating file...
            </Typography>
          )}
          {status === 'completed' && (
            <div className="flex flex-row gap-2">
              <Button
                onClick={handleDownloadCSV}
                variant="whiteWithBlackBorder"
                height={32}
                label={isLoading ? 'Downloading...' : 'Download'}
                width="w-[130px]"
                disabled={type === ExportMethod.TRANSACTIONS ? isLoading : isDownloadReportLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const BankFeedExportItem = ({ id, keyId, status, completedAt, wallet, blockchain, asset, totalCount, createdAt }) => {
  const organizationId = useOrganizationId()
  const [triggerDownloadBankFeed, { isError: isDownloadError, isLoading }] = useLazyDownloadBankFeedExportQuery()

  useEffect(() => {
    if (isDownloadError) {
      toast.error('There was a problem with downloading your Bank feed export. Please try again')
    }
  }, [isDownloadError])

  const transactionCount = `${totalCount} ${totalCount > 1 ? 'Transactions' : 'Transaction'}`

  const name = `${createdAt ? format(new Date(createdAt), 'dd/MM/yyyy') : ''} ${
    totalCount !== null ? `- ${transactionCount} ` : ''
  }`

  const handleDownloadBankFeedExport = () => {
    triggerDownloadBankFeed({ orgId: organizationId, id, fileName: name.trim() })
  }

  return (
    <div className="flex flex-row px-6 py-4 border-b border-[#F1F1EF]" key={keyId}>
      <div
        style={{
          borderRadius: '50%',
          border: '1px solid #EAECF0',
          height: 45,
          width: 45,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Image src={XeroIcon} alt="Integration Logo" height={30} width={30} />
      </div>
      <div className="pl-6 flex-1">
        <div className="flex gap-1 items-center">
          <Typography styleVariant="semibold">{name}</Typography>
          <Pill label={asset?.symbol} icon={asset?.image?.small} bgColor="#F2F4F7" fontColor="#1D2939" />
        </div>
        <Typography classNames="pt-1" variant="caption" color="secondary">
          Wallet: <b>{wallet?.name}</b>
        </Typography>
        <Typography classNames="pt-1" variant="caption" color="secondary">
          Chain: <b>{blockchain?.name}</b>
        </Typography>
        <Typography classNames="pt-1" variant="caption" color="secondary">
          Generated on: {status === 'completed' ? format(new Date(completedAt), 'dd/MM/yyyy') : ''}
        </Typography>
      </div>
      <div className="basis-1/3 h-[100%] justify-center">
        <div className="flex h-[100%] items-center justify-end">
          {status === 'failed' && (
            <div className="flex items-center flex-row gap-3">
              <Typography variant="caption" color="error">
                <p>Generate Failed.</p>
                <p>Please try again.</p>
              </Typography>
            </div>
          )}
          {status === 'generating' && (
            <Typography variant="caption" color="secondary">
              Generating...
            </Typography>
          )}
          {status === 'completed' && (
            <div className="flex flex-row gap-2">
              <Button
                onClick={handleDownloadBankFeedExport}
                variant="whiteWithBlackBorder"
                height={32}
                label={isLoading ? 'Downloading...' : 'Download'}
                width="w-[130px]"
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExportsDialog
