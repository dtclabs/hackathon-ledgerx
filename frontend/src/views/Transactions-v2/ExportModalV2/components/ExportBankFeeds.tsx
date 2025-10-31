import { useGetOrganisationCryptocurrenciesQuery } from '@/api-v2/cryptocurrencies'
import AssetOptionLabel from '@/components-v2/Select/FormatOptionLabel/AssetOptionLabel'
import ChainOptionLabel from '@/components-v2/Select/FormatOptionLabel/ChainOptionLabel'
import SelectDropdown from '@/components-v2/Select/Select'
import Typography from '@/components-v2/atoms/Typography'
import { FormGroup } from '@/components-v2/molecules/Forms'
import AlertIcon from '@/public/svg/icons/info-circle.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Image from 'next/legacy/image'
import React, { useMemo } from 'react'
import DateRangeFilter, { IDateRange } from '../../TxFilter/DateRangeFilter'
import { ExportTo, IBankFeedParams } from '../interface'
import ExportOptionLabel from './ExportOptionLabel'

const MAX_BANK_FEED_EXPORTS = 5

interface IExportBankFeeds {
  exportToOptions: { value: ExportTo; label: string }[]
  exportTo: { value: ExportTo; label: string }
  onChangeExportTo: (exportTo: { value: ExportTo; label: string }) => void
  onChangeWalletSelection: (selection: { value: ExportTo; label: string }) => void
  onChangeChainSelection: (selection: { value: ExportTo; label: string }) => void
  onChangeAssetSelections: (selection: { value: ExportTo; label: string }[]) => void
  onChangeDate: (date: IDateRange) => void
  walletList: any[]
  bankFeedParams: IBankFeedParams
}

const ExportBankFeeds: React.FC<IExportBankFeeds> = ({
  exportTo,
  exportToOptions,
  onChangeWalletSelection,
  onChangeChainSelection,
  onChangeAssetSelections,
  onChangeDate,
  onChangeExportTo,
  walletList,
  bankFeedParams
}) => {
  const organizationId = useOrganizationId()
  const supportedChains = useAppSelector(supportedChainsSelector)

  const { data: assets, isFetching: isFetchingAsset } = useGetOrganisationCryptocurrenciesQuery(
    {
      organisationId: organizationId,
      params: {
        walletIds: [bankFeedParams.wallet?.value],
        blockchainIds: [bankFeedParams.blockChain?.value]
      }
    },
    { skip: !bankFeedParams.wallet?.value || !bankFeedParams.blockChain?.value }
  )

  const chainOptions = useMemo(() => {
    if (bankFeedParams.wallet?.value) {
      const wallet = walletList?.find((item) => item.id === bankFeedParams.wallet?.value)
      const supportedChainsForWallet = supportedChains?.filter((chain) =>
        wallet?.supportedBlockchains?.includes(chain.id)
      )
      return supportedChainsForWallet?.map((item) => ({ value: item.id, label: item.name, image: item.imageUrl }))
    }
    return []
  }, [bankFeedParams.wallet])

  const assetOptions = useMemo(() => {
    if (!isFetchingAsset && bankFeedParams.blockChain?.value && bankFeedParams.wallet?.value) {
      return assets?.data.map((item) => ({
        image: item.image.small,
        label: item.symbol,
        value: item.publicId,
        disabled: bankFeedParams.assets?.length === MAX_BANK_FEED_EXPORTS
      }))
    }
    return []
  }, [isFetchingAsset, assets, bankFeedParams.blockChain, bankFeedParams.assets])

  return (
    <div className="relative flex flex-col gap-6 flex-1">
      <div className="flex items-center gap-2 bg-[#E5F6FF] rounded-lg px-3 py-2">
        <Image src={AlertIcon} width={16} height={16} />
        <Typography color="primary">
          Please make the following selections that you want to generate as bank feeds.
        </Typography>
      </div>
      <FormGroup label="Select Date Range" extendClass="font-semibold">
        <DateRangeFilter widthBtn="w-full" dropdownWidth="w-fit" setSelection={onChangeDate} />
      </FormGroup>
      <FormGroup label="Select Wallet" extendClass="font-semibold">
        <SelectDropdown
          className="font-normal"
          name="export-items"
          onChange={onChangeWalletSelection}
          options={walletList?.map((item) => ({ value: item.id, label: item.name }))}
          placeholder="Select Wallet"
          value={bankFeedParams.wallet}
        />
      </FormGroup>
      <FormGroup label="Select Chain" extendClass="font-semibold">
        <SelectDropdown
          className="font-normal"
          disabled={!bankFeedParams.wallet?.value}
          name="export-items"
          onChange={onChangeChainSelection}
          options={chainOptions}
          placeholder="Select Chain"
          formatOptionLabel={ChainOptionLabel}
          value={bankFeedParams.blockChain}
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
        disabled={!bankFeedParams.blockChain?.value || isFetchingAsset}
        name="export-items"
        onChange={onChangeAssetSelections}
        options={assetOptions}
        closeMenuOnSelect={false}
        formatOptionLabel={AssetOptionLabel}
        menuPlacement="top"
        placeholder="Select Asset"
        value={bankFeedParams.assets}
      />
      <FormGroup label="Export to" extendClass="font-semibold">
        <SelectDropdown
          name="export-to"
          value={exportTo}
          onChange={onChangeExportTo}
          options={exportToOptions}
          formatOptionLabel={ExportOptionLabel}
          className="font-normal"
          menuPlacement="top"
        />
      </FormGroup>
    </div>
  )
}

export default ExportBankFeeds
