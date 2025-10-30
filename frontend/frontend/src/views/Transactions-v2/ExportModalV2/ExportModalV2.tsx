import { useGetFinancialTransactionsQuery } from '@/api-v2/financial-tx-api'
import { IntegrationName } from '@/api-v2/organization-integrations'
import SelectDropdown from '@/components-v2/Select/Select'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { FormGroup } from '@/components-v2/molecules/Forms'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Loading from '@/components/Loading'
import useOrgIntegrationsPolling from '@/hooks-v2/useOrgIntegrationsPolling'
import Arrow from '@/public/svg/icons/arrow-narrow-right.svg'
import CsvIcon from '@/public/svg/icons/csv-icon.svg'
import WarningIcon from '@/public/svg/icons/error-icon-triangle-outlined.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { dayInMilliseconds, getDateWithoutTimezone, getUTCTDate } from '@/utils-v2/dateHelper'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import ExportBankFeeds from './components/ExportBankFeeds'
import ExportJournalEntries from './components/ExportJournalEntries'
import ExportOptionLabel from './components/ExportOptionLabel'
import ExportTxn from './components/ExportTxn'
import {
  EXPORT_METHOD_OPTIONS,
  ExportMethod,
  ExportTo,
  ExportType,
  FILE_TYPE,
  IBankFeedParams,
  IExportModalV2
} from './interface'

const ExportModalV2: React.FC<IExportModalV2> = ({
  provider,
  onClickPrimary,
  filteredItems,
  selectedItems,
  prerequisitesErrors,
  isLoading,
  modifiedCoaQuery,
  isFetching,
  accountingIntegration,
  walletList
}) => {
  const organizationId = useOrganizationId()
  const router = useRouter()

  const { timezone } = useAppSelector(orgSettingsSelector)
  const rootfiService = useAppSelector((state) => state.featureFlag?.rootfiService)
  const [exportMethod, setExportMethod] = useState<{ value: ExportMethod; label: string }>(null)
  const [exportType, setExportType] = useState<{ value: ExportType; label: string }>(null)
  const [exportTo, setExportTo] = useState<{ value: ExportTo; label: string; icon?: any }>(null)

  // State for export bank feeds
  const [bankFeedParams, setBankFeedParams] = useState<IBankFeedParams>({
    wallet: null,
    blockChain: null,
    date: null,
    assets: []
  })

  const { data: orgIntegration } = useOrgIntegrationsPolling({ organizationId })

  const formattedFilterTime = useMemo(() => {
    const tempEndTime =
      bankFeedParams?.date?.endDate && new Date(new Date(bankFeedParams?.date?.endDate).getTime() + dayInMilliseconds)
    const startTime = bankFeedParams?.date?.startDate
      ? getUTCTDate(getDateWithoutTimezone(bankFeedParams?.date.startDate), timezone?.utcOffset).toISOString()
      : null
    const endTime = bankFeedParams?.date?.endDate
      ? getUTCTDate(getDateWithoutTimezone(tempEndTime), timezone?.utcOffset).toISOString()
      : null
    return { startTime, endTime }
  }, [bankFeedParams?.date?.endDate, bankFeedParams?.date?.startDate])

  const { data: bankFeedTransactions, isFetching: isFetchingBankFeedTransactions } = useGetFinancialTransactionsQuery(
    {
      orgId: organizationId,
      params: {
        blockchainIds: [bankFeedParams?.blockChain?.value],
        walletAddresses: [walletList?.find((wallet) => wallet.id === bankFeedParams?.wallet?.value)?.address],
        assetIds: bankFeedParams?.assets?.map((item) => item.value) || [],
        ...formattedFilterTime
      }
    },
    {
      skip:
        !bankFeedParams?.blockChain ||
        !bankFeedParams?.wallet ||
        !bankFeedParams?.assets?.length ||
        !bankFeedParams?.date?.startDate ||
        !bankFeedParams?.date?.endDate
    }
  )

  useEffect(() => {
    if (!provider.state.isOpen) {
      resetModal()
    }
  }, [provider.state.isOpen])

  useEffect(() => {
    if (exportMethod?.value === ExportMethod.BANK_FEEDS) {
      const modal = document.querySelector('.modal-body')
      modal.scrollTo({ behavior: 'smooth', top: 0 })
    }
  }, [exportMethod])

  useEffect(() => {
    if (provider.state.isOpen && organizationId) {
      modifiedCoaQuery({ organizationId, integration: accountingIntegration?.integrationName ?? 'xero' })
    }
  }, [provider.state.isOpen, organizationId, accountingIntegration?.integrationName])

  const exportMethodOptions = useMemo(() => {
    if (!accountingIntegration?.integrationName) {
      return EXPORT_METHOD_OPTIONS.map((_option) => {
        if (_option.value !== ExportMethod.TRANSACTIONS) {
          return { ..._option, disabled: true, tooltip: "You haven't connected to any integration yet" }
        }
        return _option
      })
    }

    const rootfiIntegration = orgIntegration.find((integration) => integration.platform === 'rootfi')

    if (rootfiIntegration?.status === 'migrating') {
      return EXPORT_METHOD_OPTIONS.map((_option) => {
        if (_option.value !== ExportMethod.TRANSACTIONS) {
          return {
            ..._option,
            disabled: true,
            tooltip: 'This service is temporarily unavailable. Please wait a few minutes for process to be completed.'
          }
        }
        return _option
      })
    }

    if (
      rootfiService?.isEnabled &&
      accountingIntegration?.platform === 'merge' &&
      accountingIntegration?.status === 'completed'
    ) {
      return EXPORT_METHOD_OPTIONS.map((_option) => {
        if (_option.value !== ExportMethod.TRANSACTIONS) {
          return {
            ..._option,
            disabled: true,
            tooltip: 'This service is unavailable. Please upgrade to continue.'
          }
        }
        return _option
      })
    }

    if (accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS) {
      return EXPORT_METHOD_OPTIONS.filter((_option) => _option.value !== ExportMethod.BANK_FEEDS)
    }
    return EXPORT_METHOD_OPTIONS
  }, [accountingIntegration, orgIntegration])

  const exportToOptions = useMemo(
    () => [
      {
        value: ExportTo.XERO,
        label: 'Xero',
        icon: XeroLogoIcon,
        disabled: accountingIntegration?.integrationName !== IntegrationName.XERO,
        tooltip: "You haven't connected to this integration yet"
      },
      {
        value: ExportTo.QUICK_BOOKS,
        label: 'QuickBooks',
        icon: QuickBooksIcon,
        disabled: accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS,
        tooltip: "You haven't connected to this integration yet"
      }
    ],
    [accountingIntegration]
  )

  const exportTypeOptions = useMemo(
    () => [
      { value: ExportType.ALL, label: `All (${filteredItems})` },
      { value: ExportType.SELECTION, label: `Current selection (${selectedItems})`, disabled: !selectedItems }
    ],
    [filteredItems, selectedItems]
  )

  useEffect(() => {
    if (exportMethod?.value === ExportMethod.TRANSACTIONS) {
      setExportTo({ value: ExportTo.CSV, label: FILE_TYPE[ExportTo.CSV], icon: CsvIcon })
    } else if ([ExportMethod.JOURNAL_ENTRIES, ExportMethod.BANK_FEEDS].includes(exportMethod?.value)) {
      setExportTo(exportToOptions.find((option) => option.value === accountingIntegration?.integrationName))
    }
  }, [accountingIntegration?.integrationName, exportMethod, exportToOptions])

  useEffect(() => {
    setExportType(
      selectedItems > 0
        ? exportTypeOptions.find((option) => option.value === ExportType.SELECTION)
        : exportTypeOptions.find((option) => option.value === ExportType.ALL)
    )
  }, [exportTypeOptions, selectedItems, exportMethod])

  const resetModal = () => {
    setBankFeedParams({
      wallet: null,
      blockChain: null,
      date: null,
      assets: []
    })
    setExportMethod(null)
    setExportType(null)
    setExportTo(null)
  }

  const handleOnChangeExportMethod = (_option) => {
    setExportMethod(_option)
  }
  const handleChangeExportType = (_option) => {
    setExportType(_option)
  }
  const handleChangeExportTo = (_option) => {
    setExportTo(_option)
  }

  // Bank feed selection change
  const handleChangeWalletSelection = (_option) => {
    setBankFeedParams({
      ...bankFeedParams,
      wallet: _option,
      blockChain: null,
      assets: []
    })
  }
  const handleChangeChainSelection = (_option) => {
    setBankFeedParams({
      ...bankFeedParams,
      blockChain: _option,
      assets: []
    })
  }
  const handleChangeAssetSelections = (_options) => {
    setBankFeedParams({
      ...bankFeedParams,
      assets: _options
    })
  }
  const handleChangeDate = (_dateRange) => {
    setBankFeedParams({
      ...bankFeedParams,
      date: _dateRange
    })
  }

  // CTA handler
  const handleOnCloseModal = () => {
    resetModal()
    provider.methods.setIsOpen(false)
    // remove param generate=true when cancel is clicked
    window.history.replaceState(null, '', `/${router.query.organizationId}/transactions`)
  }
  const handleOnClickPrimary = () => {
    if (exportMethod) {
      if (exportMethod?.value === ExportMethod.BANK_FEEDS) {
        const endDate = new Date(new Date(bankFeedParams.date?.endDate).getTime() + dayInMilliseconds)
        onClickPrimary({
          exportMethod: exportMethod?.value,
          exportTo: exportTo.value,
          walletId: bankFeedParams.wallet?.value,
          blockchainId: bankFeedParams.blockChain?.value,
          assetIds: bankFeedParams.assets?.map((asset) => asset.value),
          startTime: getDateWithoutTimezone(bankFeedParams.date?.startDate),
          endTime: getDateWithoutTimezone(endDate)
        })
      } else if ([ExportMethod.TRANSACTIONS, ExportMethod.JOURNAL_ENTRIES].includes(exportMethod?.value)) {
        onClickPrimary({
          exportMethod: exportMethod?.value,
          exportTo: exportTo.value,
          exportType: exportType.value
        })
      }
    }
  }
  const handleButtonDisable = () => {
    if (isLoading) {
      return true
    }
    if (exportMethod?.value === ExportMethod.TRANSACTIONS) {
      return !filteredItems || !exportType?.value
    }
    if (exportMethod?.value === ExportMethod.JOURNAL_ENTRIES) {
      return !exportTo?.value || isFetching
    }
    if (exportMethod?.value === ExportMethod.BANK_FEEDS) {
      return (
        !bankFeedParams.assets?.length ||
        !bankFeedParams.date?.startDate ||
        !bankFeedParams.date?.endDate ||
        isFetchingBankFeedTransactions ||
        !bankFeedTransactions?.totalItems ||
        isFetching
      )
    }

    return !exportMethod?.value
  }

  const primaryButtonLabel = useMemo(() => {
    if (exportMethod?.value === ExportMethod.TRANSACTIONS) {
      return exportType?.value === ExportType.ALL
        ? `Generate CSV (${filteredItems || '-'})`
        : `Generate CSV (${selectedItems || '-'})`
    }
    if (exportMethod?.value === ExportMethod.BANK_FEEDS) {
      return `Generate (${bankFeedTransactions?.totalItems || '-'})`
    }
    if (exportMethod?.value === ExportMethod.JOURNAL_ENTRIES) {
      return exportType?.value === ExportType.ALL
        ? `Generate (${filteredItems || '-'})`
        : `Generate (${selectedItems || '-'})`
    }

    return 'Generate'
  }, [bankFeedTransactions?.totalItems, exportMethod?.value, exportType?.value, filteredItems, selectedItems])

  return (
    <BaseModal provider={provider} width="600">
      <BaseModal.Header>
        <BaseModal.Header.Title>Export Transactions</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton onClose={handleOnCloseModal} />
      </BaseModal.Header>
      <BaseModal.Body
        extendedClass={`max-h-[50vh] ${
          !isFetching &&
          !prerequisitesErrors.length &&
          exportMethod?.value === ExportMethod.BANK_FEEDS &&
          'overflow-y-auto'
        }`}
      >
        <div className="mt-6">
          <FormGroup label="Select Method" extendClass="font-semibold">
            <SelectDropdown
              name="export-type"
              onChange={handleOnChangeExportMethod}
              value={exportMethod}
              options={exportMethodOptions}
              formatOptionLabel={ExportOptionLabel}
              className="font-normal"
              placeholder="Select Method"
            />
          </FormGroup>
        </div>
        <div className="pt-6">
          {exportMethod?.value === ExportMethod.TRANSACTIONS && (
            <ExportTxn
              exportType={exportType}
              exportTo={exportTo}
              exportTypeOptions={exportTypeOptions}
              onChangeExportType={handleChangeExportType}
              onChangeExportTo={handleChangeExportTo}
            />
          )}
          {[ExportMethod.JOURNAL_ENTRIES, ExportMethod.BANK_FEEDS].includes(exportMethod?.value) && isFetching && (
            <Loading
              height="h-24"
              classNames="!py-0"
              dark
              title={`Checking latest updates from ${
                accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'
              }`}
            />
          )}
          {exportMethod?.value === ExportMethod.JOURNAL_ENTRIES && !prerequisitesErrors.length && !isFetching && (
            <ExportJournalEntries
              exportType={exportType}
              exportTo={exportTo}
              exportTypeOptions={exportTypeOptions}
              exportToOptions={exportToOptions}
              onChangeExportType={handleChangeExportType}
              onChangeExportTo={handleChangeExportTo}
            />
          )}
          {exportMethod?.value === ExportMethod.BANK_FEEDS && !prerequisitesErrors.length && !isFetching && (
            <ExportBankFeeds
              exportTo={exportTo}
              walletList={walletList}
              bankFeedParams={bankFeedParams}
              exportToOptions={exportToOptions}
              onChangeDate={handleChangeDate}
              onChangeExportTo={handleChangeExportTo}
              onChangeChainSelection={handleChangeChainSelection}
              onChangeWalletSelection={handleChangeWalletSelection}
              onChangeAssetSelections={handleChangeAssetSelections}
            />
          )}
          {prerequisitesErrors?.length > 0 &&
            [ExportMethod.JOURNAL_ENTRIES, ExportMethod.BANK_FEEDS].includes(exportMethod?.value) &&
            !isFetching && (
              <div>
                <div className="flex flex-row items-center -mt-1 gap-2 mb-4">
                  <Image src={WarningIcon} height={20} width={20} />
                  <Typography classNames="font-[600]" color="error" variant="body2">
                    Please fix the following errors before exporting to{' '}
                    {accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'}:{' '}
                  </Typography>
                </div>
                <div className="pl-2">
                  {prerequisitesErrors.map((error, index) => (
                    <div className="flex items-center gap-2">
                      <Typography classNames="mt-1 w-[360px]" color="error" variant="body2">
                        {index + 1} - {error.error}
                      </Typography>
                      <Button
                        trailingIcon={<Image src={Arrow} height={12} width={12} />}
                        height={32}
                        label={error.cta.label}
                        variant="ghost"
                        onClick={error.cta.onClick}
                        classNames="flex-1 !text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA onClick={handleOnCloseModal} label="Cancel" />
        <BaseModal.Footer.PrimaryCTA
          onClick={handleOnClickPrimary}
          disabled={handleButtonDisable()}
          label={primaryButtonLabel}
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default ExportModalV2
