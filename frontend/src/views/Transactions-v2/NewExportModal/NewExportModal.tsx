import { useEffect, useMemo, useState } from 'react'
import Image from 'next/legacy/image'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Typography from '@/components-v2/atoms/Typography'
import SelectDropdown from '@/components-v2/Select/Select'
import CsvIcon from '@/public/svg/icons/csv-icon.svg'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import WarningIcon from '@/public/svg/icons/error-icon-triangle-outlined.svg'
import { FormGroup } from '@/components-v2/molecules/Forms'
import { useOrganizationId } from '@/utils/getOrganizationId'
import ExportCsv from './ExportCsv'
import ExportXero from './ExportXero'
import { selectMissingAccountMappings } from '@/slice/chart-of-account-mappings/chart-of-accounts-mappings-selectors'
import { useAppSelector } from '@/state'
import ExportTypeLabel from './ExportTypeLabel'
import Button from '@/components-v2/atoms/Button'
import Arrow from '@/public/svg/icons/arrow-narrow-right.svg'
import Loading from '@/components/Loading'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { isQuickBooksEnabled } from '@/config-v2/constants'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useGetFinancialTransactionsQuery } from '@/api-v2/financial-tx-api'
import { dayInMilliseconds, getDateWithoutTimezone, getUTCTDate } from '@/utils-v2/dateHelper'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useRouter } from 'next/router'

const NewExportModal = ({
  provider,
  onClickPrimary,
  totalItems,
  totalUnfilteredItems,
  filteredItems,
  selectedItems,
  transactionsMissingMapping,
  prerequisitesErrors,
  isLoading,
  modifiedCoaQuery,
  isFetching,
  unexportedItems,
  accountingIntegration,
  walletList
}) => {
  const organizationId = useOrganizationId()
  const router = useRouter()

  const missingMappings = useAppSelector(selectMissingAccountMappings)
  const isNewExportsCSVEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewExportsCSVEnabled'))
  const { timezone } = useAppSelector(orgSettingsSelector)

  const [integrationType, setIntegrationType] = useState(null)
  const [exportMethod, setExportMethod] = useState<any>({})
  const [xeroMethod, setXeroMethod] = useState<any>({})
  const [selectedWallet, setSelectedWallet] = useState<{ value: string; label: string }>(null)
  const [selectedChain, setSelectedChain] = useState<{ value: string; label: string }>(null)
  const [selectedAssets, setSelectedAssets] = useState<{ value: string; label: string }[]>([])
  const [selectedDate, setSelectedDate] = useState<{ startDate: Date; endDate: Date }>(null)
  const [isSkipExported, setIsSkipExported] = useState(false)

  const formattedFilterTime = useMemo(() => {
    const tempEndTime = selectedDate?.endDate && new Date(new Date(selectedDate?.endDate).getTime() + dayInMilliseconds)
    const startTime = selectedDate?.startDate
      ? getUTCTDate(getDateWithoutTimezone(selectedDate.startDate), timezone?.utcOffset).toISOString()
      : null
    const endTime = selectedDate?.endDate
      ? getUTCTDate(getDateWithoutTimezone(tempEndTime), timezone?.utcOffset).toISOString()
      : null
    return { startTime, endTime }
  }, [selectedDate?.endDate, selectedDate?.startDate])

  const { data: bankFeedTransactions, isFetching: isFetchingBankFeedTransactions } = useGetFinancialTransactionsQuery(
    {
      orgId: organizationId,
      params: {
        blockchainIds: [selectedChain?.value],
        walletAddresses: [walletList?.find((wallet) => wallet.id === selectedWallet?.value)?.address],
        assetIds: selectedAssets?.map((item) => item.value) || [],
        ...formattedFilterTime
      }
    },
    {
      skip:
        !selectedChain ||
        !selectedWallet ||
        !selectedAssets?.length ||
        !selectedDate?.startDate ||
        !selectedDate?.endDate
    }
  )

  useEffect(() => {
    if (!provider.state.isOpen) {
      resetModal()
    }
  }, [provider.state.isOpen])

  useEffect(() => {
    if (provider.state.isOpen && organizationId) {
      modifiedCoaQuery({ organizationId, integration: accountingIntegration?.integrationName ?? 'xero' })
    }
  }, [provider.state.isOpen, organizationId, accountingIntegration?.integrationName])

  useEffect(() => {
    if (selectedItems && selectedItems > 0) {
      setXeroMethod({
        value: 'xero-selected',
        label: isNewExportsCSVEnabled ? `Current selection (${selectedItems})` : 'Current Selection'
      })
    } else {
      setXeroMethod({})
    }
  }, [selectedItems, provider.state.isOpen])

  useEffect(() => {
    if (integrationType?.value === 'export-csv') {
      setExportMethod(
        selectedItems && selectedItems > 0
          ? {
              value: 'csv-selected',
              label: `Current selection (${selectedItems})`
            }
          : {
              value: 'csv-all',
              label: isNewExportsCSVEnabled ? `All (${filteredItems})` : 'All (Recommended)'
            }
      )
    }
  }, [integrationType])

  useEffect(() => {
    if (exportMethod?.value === 'xero-bank') {
      const modal = document.querySelector('.modal-body')
      modal.scrollTo({ behavior: 'smooth', top: 0 })
    }
  }, [exportMethod])

  const resetModal = () => {
    setExportMethod('')
    setSelectedWallet(null)
    setSelectedChain(null)
    setSelectedAssets([])
    setSelectedDate(null)
    setIntegrationType(null)
    setXeroMethod({})
    setIsSkipExported(false)
  }

  const handleOnChangeExportType = (_option) => {
    setExportMethod(null)
    setIntegrationType(_option)
  }
  const onSelectCsvExportType = (_option) => {
    setExportMethod(_option)
  }

  const handleOnClickPrimary = () => {
    if (exportMethod) {
      if (exportMethod?.value === 'xero-bank') {
        const endDate = new Date(new Date(selectedDate.endDate).getTime() + dayInMilliseconds)

        onClickPrimary(
          {
            type: integrationType.value,
            method: exportMethod?.value,
            xeroMethod: xeroMethod?.value,
            walletId: selectedWallet?.value,
            blockchainId: selectedChain?.value,
            assetIds: selectedAssets?.map((asset) => asset.value),
            startTime: getDateWithoutTimezone(selectedDate.startDate),
            endTime: getDateWithoutTimezone(endDate)
          },
          isSkipExported
        )
      } else {
        onClickPrimary(
          {
            type: integrationType.value,
            method: exportMethod?.value,
            xeroMethod: xeroMethod?.value
          },
          isSkipExported
        )
      }
    }
  }

  const handleOnClickExportXero = (_option) => {
    setExportMethod(_option)
  }

  const handleOnClickExportItems = (_option) => {
    setXeroMethod(_option)
  }
  const handleChangeWalletSelection = (_option) => {
    setSelectedWallet(_option)
    setSelectedChain(null)
    setSelectedAssets([])
  }
  const handleChangeChainSelection = (_option) => {
    setSelectedChain(_option)
    setSelectedAssets([])
  }
  const handleChangeAssetSelections = (_option) => {
    setSelectedAssets(_option)
  }
  const handleChangeDate = (_option) => {
    setSelectedDate(_option)
  }

  const handleOnCloseModal = () => {
    resetModal()
    provider.methods.setIsOpen(false)
    // remove param generate=true when cancel is clicked
    window.history.replaceState(null, '', `/${router.query.organizationId}/transactions`)
  }

  const handleSkipExported = (e) => {
    setIsSkipExported(e.target.checked)
  }

  const handleButtonDisable = () => {
    if (isLoading) {
      return true
    }

    // @ts-ignore
    if (integrationType?.value === 'export-xero') {
      if (exportMethod?.value === 'xero-bank') {
        return (
          !selectedAssets?.length ||
          !selectedDate?.startDate ||
          !selectedDate?.endDate ||
          isFetchingBankFeedTransactions
        )
      }
      if (xeroMethod?.value === 'xero-selected') {
        if (selectedItems === 0) {
          return true
        }
        return isSkipExported || !exportMethod?.value
      }
      return (
        // !integrationType.value || !xeroMethod.value || missingMappings?.length > 0 || transactionsMissingMapping > 0
        !integrationType.value || !xeroMethod.value
      )
    }
    return !integrationType || !exportMethod
  }

  const exportTypeOptions = useMemo(() => {
    const options = [
      { value: 'export-csv', label: 'CSV', icon: CsvIcon },
      {
        value: 'export-xero',
        label: 'Xero',
        icon: XeroLogoIcon,
        disabled: accountingIntegration?.integrationName !== IntegrationName.XERO,
        tooltip: "You haven't connected to this integration yet"
      }
    ]

    if (isQuickBooksEnabled) {
      options.push({
        value: 'export-xero',
        label: 'QuickBooks',
        icon: QuickBooksIcon,
        disabled: accountingIntegration?.integrationName !== IntegrationName.QUICKBOOKS,
        tooltip: "You haven't connected to this integration yet"
      })
    }

    return options
  }, [accountingIntegration?.integrationName, accountingIntegration?.status])

  const getPrimaryButtonLabel = () => {
    if (integrationType?.value === 'export-xero') {
      if (exportMethod?.value === 'xero-bank') {
        let txnsCount: string | number = '-'
        if (isFetchingBankFeedTransactions) {
          txnsCount = '-'
        } else if (
          selectedChain &&
          selectedWallet &&
          selectedAssets?.length &&
          selectedDate?.startDate &&
          selectedDate?.endDate
        ) {
          txnsCount = bankFeedTransactions?.totalItems
        }
        return `Generate (${txnsCount})`
      }

      if (xeroMethod?.value === 'xero-all') {
        return `Generate (${filteredItems})`
      }
      return `Generate (${selectedItems})`
    }
    // TODO: Add individual selection label when we have the API ready for it
    if (exportMethod?.value === 'csv-all') {
      return `Generate CSV (${filteredItems})`
    }

    if (exportMethod?.value === 'csv-selected') {
      return `Generate CSV (${selectedItems})`
    }
    return 'Generate CSV'
  }

  return (
    <BaseModal provider={provider} width="600">
      <BaseModal.Header>
        <BaseModal.Header.Title>Export Transactions</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton onClose={handleOnCloseModal} />
      </BaseModal.Header>
      <BaseModal.Body extendedClass={`max-h-[50vh] ${exportMethod?.value === 'xero-bank' && 'overflow-y-auto'}`}>
        {/* <div className="pr-24">
          <Typography color="secondary" variant="body2">
            Export your transaction to Xero/QuickBooks or download a CSV to use on other platforms
          </Typography>
        </div> */}
        <div className="mt-6">
          <FormGroup label="Export To" extendClass="font-semibold">
            <SelectDropdown
              name="export-type"
              onChange={handleOnChangeExportType}
              value={integrationType}
              formatOptionLabel={ExportTypeLabel}
              options={exportTypeOptions}
              className="font-normal"
            />
          </FormGroup>
        </div>
        <div className="pt-8 pb-4">
          {integrationType?.value === 'export-csv' && (
            <ExportCsv
              exportType={exportMethod}
              totalItems={totalItems}
              filteredItems={filteredItems}
              selectedItems={selectedItems}
              totalUnfilteredItems={totalUnfilteredItems}
              onSelectCsvExportType={onSelectCsvExportType}
            />
          )}
          {integrationType?.value === 'export-xero' && isFetching && (
            <Loading
              height="h-24"
              classNames="!py-0"
              dark
              title={`Checking latest updates from ${
                accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'
              }`}
            />
          )}
          {integrationType?.value === 'export-xero' && prerequisitesErrors.length === 0 && !isFetching && (
            <ExportXero
              totalItems={totalItems}
              walletList={walletList}
              totalUnfilteredItems={totalUnfilteredItems}
              filteredItems={filteredItems}
              selectedItems={selectedItems}
              exportType={xeroMethod}
              onSelectXeroExportType={handleOnClickExportXero}
              onSelectExportItems={handleOnClickExportItems}
              onChangeChainSelection={handleChangeChainSelection}
              onChangeWalletSelection={handleChangeWalletSelection}
              onChangeAssetSelections={handleChangeAssetSelections}
              onChangeDate={handleChangeDate}
              selectedChain={selectedChain}
              selectedWallet={selectedWallet}
              selectedAssets={selectedAssets}
              // prequesiteErrors={hasXeroSyncData || missingMappings.length > 0}
              exportMethod={exportMethod}
              onSkipExported={handleSkipExported}
              isSkipExported={isSkipExported}
              unexportedItems={unexportedItems}
              accountingIntegration={accountingIntegration}
            />
          )}
          {prerequisitesErrors.length > 0 && integrationType?.value === 'export-xero' && !isFetching && (
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
          label={
            isNewExportsCSVEnabled
              ? getPrimaryButtonLabel()
              : integrationType?.value === 'export-xero'
              ? 'Generate'
              : 'Export'
          }
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default NewExportModal
