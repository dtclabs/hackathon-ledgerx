import { IntegrationName } from '@/api-v2/organization-integrations'
import Typography from '@/components-v2/atoms/Typography'
import { FormGroup } from '@/components-v2/molecules/Forms'
import SelectDropdown from '@/components-v2/Select/Select'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { useAppSelector } from '@/state'
import DateRangeFilter from '../TxFilter/DateRangeFilter'
import { useMemo } from 'react'
import { useGetOrganisationCryptocurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { useOrganizationId } from '@/utils/getOrganizationId'
import AssetOptionLabel from '@/components-v2/Select/FormatOptionLabel/AssetOptionLabel'
import AlertIcon from '@/public/svg/icons/info-circle.svg'
import Image from 'next/legacy/image'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import ChainOptionLabel from '@/components-v2/Select/FormatOptionLabel/ChainOptionLabel'

const MAX_BANK_FEED_EXPORTS = 5

const XeroCsv = ({
  onSelectXeroExportType,
  onSelectExportItems,
  onChangeWalletSelection,
  onChangeChainSelection,
  onChangeAssetSelections,
  onChangeDate,
  totalItems,
  walletList,
  totalUnfilteredItems,
  filteredItems,
  selectedItems,
  exportType,
  exportMethod,
  selectedWallet,
  selectedChain,
  selectedAssets,
  onSkipExported,
  isSkipExported,
  unexportedItems = 0,
  accountingIntegration
}) => {
  const organizationId = useOrganizationId()
  const supportedChains = useAppSelector(supportedChainsSelector)
  const isBankFeedEnabled = useAppSelector((state) => selectFeatureState(state, 'isBankFeedEnabled'))
  const isNewExportsCSVEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewExportsCSVEnabled'))

  const { data: assets, isFetching: isFetchingAsset } = useGetOrganisationCryptocurrenciesQuery(
    {
      organisationId: organizationId,
      params: {
        walletIds: [selectedWallet?.value],
        blockchainIds: [selectedChain?.value]
      }
    },
    { skip: !selectedWallet?.value || !selectedChain?.value }
  )

  const chainOptions = useMemo(() => {
    if (selectedWallet?.value) {
      const wallet = walletList?.find((item) => item.id === selectedWallet?.value)
      const supportedChainsForWallet = supportedChains?.filter((chain) =>
        wallet?.supportedBlockchains?.includes(chain.id)
      )
      return supportedChainsForWallet?.map((item) => ({ value: item.id, label: item.name, image: item.imageUrl }))
    }
    return []
  }, [exportMethod, selectedWallet])

  const assetOptions = useMemo(() => {
    if (!isFetchingAsset && selectedChain?.value && selectedWallet?.value) {
      return assets?.data.map((item) => ({
        image: item.image.small,
        label: item.symbol,
        value: item.publicId,
        disabled: selectedAssets?.length === MAX_BANK_FEED_EXPORTS
      }))
    }
    return []
  }, [isFetchingAsset, assets, selectedChain, selectedAssets])

  const renderTotalItems = () => {
    if (exportType.value === 'xero-all') {
      return `${filteredItems}`
    }
    if (exportType.value === 'xero-selected') {
      return `${selectedItems}`
    }
    return '0'
  }

  const renderTotalSkipItems = () => {
    if (exportType.value === 'xero-all') {
      return totalItems - unexportedItems
    }
    if (exportType.value === 'xero-selected') {
      return selectedItems ? selectedItems - unexportedItems : filteredItems - unexportedItems
    }
    return 0
  }

  return (
    <>
      <div className="flex justify-between">
        <div className="flex-1 flex flex-col gap-2">
          <FormGroup label="Select Method" extendClass="font-semibold">
            <SelectDropdown
              className="font-normal"
              name="export-type"
              onChange={onSelectXeroExportType}
              options={[
                { value: 'xero-journal', label: 'Journal Entries' },
                {
                  value: 'xero-bank',
                  label: isBankFeedEnabled ? 'Bank Feeds' : 'Bank Feeds (Coming Soon)',
                  disabled: !isBankFeedEnabled
                }
              ]}
              value={exportMethod}
            />
          </FormGroup>
          {exportMethod?.value === 'xero-journal' && (
            <Typography color="secondary" variant="caption">
              Please note that journal entries will have to be generated before we can export them to{' '}
              {accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'}.
            </Typography>
          )}
          {isBankFeedEnabled && exportMethod?.value === 'xero-bank' && (
            <div className="flex items-center gap-2 bg-[#E5F6FF] rounded-lg px-3 py-2 mt-2">
              <Image src={AlertIcon} width={16} height={16} />
              <Typography color="primary">
                Please make the following selections that you want to generate as bank feeds.
              </Typography>
            </div>
          )}
        </div>
      </div>
      <div className="relative mt-8">
        <div className="flex justify-between">
          <div className="flex-1">
            {exportMethod?.value === 'xero-journal' && (
              <FormGroup label="Select Data" extendClass="mb-6 font-semibold">
                <SelectDropdown
                  className="font-normal"
                  name="export-items"
                  onChange={onSelectExportItems}
                  options={[
                    {
                      value: 'xero-all',
                      label: isNewExportsCSVEnabled ? `All (${filteredItems})` : 'All (Recommended)',
                      disabled: !filteredItems
                    },
                    {
                      value: 'xero-selected',
                      label: isNewExportsCSVEnabled ? `Current selection (${selectedItems})` : 'Current selection',
                      disabled: !selectedItems
                    }
                  ]}
                  value={exportType?.value ? exportType : null}
                />
              </FormGroup>
            )}
            {isBankFeedEnabled && exportMethod?.value === 'xero-bank' && (
              <>
                <FormGroup label="Select Date Range" extendClass="mb-6 font-semibold">
                  <DateRangeFilter widthBtn="w-full" dropdownWidth="w-fit" setSelection={onChangeDate} />
                </FormGroup>
                <FormGroup label="Select Wallet" extendClass="mb-6 font-semibold">
                  <SelectDropdown
                    className="font-normal"
                    name="export-items"
                    onChange={onChangeWalletSelection}
                    options={walletList?.map((item) => ({ value: item.id, label: item.name }))}
                    placeholder="Select Wallet"
                    value={selectedWallet}
                  />
                </FormGroup>
                <FormGroup label="Select Chain" extendClass="mb-6 font-semibold">
                  <SelectDropdown
                    className="font-normal"
                    disabled={!selectedWallet?.value}
                    name="export-items"
                    onChange={onChangeChainSelection}
                    options={chainOptions}
                    placeholder="Select Chain"
                    formatOptionLabel={ChainOptionLabel}
                    value={selectedChain}
                  />
                </FormGroup>
                <div className="flex flex-row justify-between mb-2">
                  <Typography variant="body2" color="primary" styleVariant="semibold">
                    Select Asset(s)
                  </Typography>
                  <Typography variant="body2" color="primary">
                    Max: <b>{MAX_BANK_FEED_EXPORTS}</b>
                  </Typography>
                </div>

                <SelectDropdown
                  isMulti
                  className="font-normal"
                  disabled={!selectedChain?.value || isFetchingAsset}
                  name="export-items"
                  onChange={onChangeAssetSelections}
                  options={assetOptions}
                  closeMenuOnSelect={false}
                  formatOptionLabel={AssetOptionLabel}
                  menuPlacement="top"
                  placeholder="Select Asset"
                  value={selectedAssets}
                />
              </>
            )}
          </div>
          {exportType?.value && !isNewExportsCSVEnabled && (
            <div className="absolute   right-0">
              <Typography color="secondary" variant="caption">
                No of Txns. <b>{renderTotalItems()}</b>
              </Typography>
            </div>
          )}
        </div>
      </div>
      {/* <div className="mt-4 flex items-center">
        <Checkbox
          isChecked={isSkipExported}
          onChange={onSkipExported}
          label="Skip those that have already been exported"
          className="flex gap-2 text-sm text-dashboard-main py-2"
        />
        {isSkipExported && exportType.value === 'xero-selected' && renderTotalItems() !== '0' && (
          <p className="text-sm text-slate-400 pl-1">
            ({renderTotalSkipItems()} {renderTotalSkipItems() > 1 ? 'txns' : 'txn'} will be skipped)
          </p>
        )}
      </div> */}
    </>
  )
}

export default XeroCsv
