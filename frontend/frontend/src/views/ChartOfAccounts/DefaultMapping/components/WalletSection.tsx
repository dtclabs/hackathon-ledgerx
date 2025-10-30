import ArrowIcon from '@/public/svg/icons/arrow-left.svg'
import Image from 'next/legacy/image'
import { Dropdown } from '@/components-v2/molecules/Forms/Dropdown'
import Button from '@/components-v2/atoms/Button'
import AssetChip from '../../Detail/components/MappedInformation/AssetChip'
import ReactTooltip from 'react-tooltip'
import { FC, useMemo } from 'react'
import _ from 'lodash'
import FormatCoAOptionLabel from './FormatCoAOptionLabel/FormatCoAOptionLabel'

interface IFeesSectionProps {
  onClickMapping?: () => void
  onChangeAccount?: (ids: string[], value: any) => void
  onRemoveMapping?: (ids: string[]) => void
  mappingIds?: any[]
  options?: any
  mappedAssets?: any[]
  account?: any
  selectedAccountOption?: {
    value: string
    label: string
  }
}

const MAX_ASSETS_ON_ROW = 3

const WalletSection: FC<IFeesSectionProps> = ({
  onClickMapping,
  onChangeAccount,
  onRemoveMapping,
  options = [],
  mappedAssets,
  mappingIds,
  account,
  selectedAccountOption
}) => {
  const handleChangeAccount = (value: any) => {
    if (onChangeAccount) onChangeAccount(mappingIds, value)
  }
  const handleRemoveMapping = () => {
    if (onRemoveMapping) onRemoveMapping(mappingIds)
  }

  const parsedOptions = useMemo(
    () =>
      options?.map((option) => ({
        ...option,
        options: option?.options.map((item) => ({
          ...item,
          isSelected: item.value === account
        }))
      })),
    [options, account]
  )

  return (
    <div className="flex flex-row gap-6 justify-between items-center">
      <div className="basis-2/6 flex items-center gap-2">
        {mappedAssets?.length &&
          mappedAssets
            .slice(0, MAX_ASSETS_ON_ROW)
            .map((asset) => <AssetChip key={`${account}-${asset.symbol}`} icon={asset.image} symbol={asset.symbol} />)}
        {mappedAssets?.length > MAX_ASSETS_ON_ROW && (
          <>
            <div
              data-tip={mappingIds[0]}
              data-for={mappingIds[0]}
              className="text-sm text-normal cursor-default leading-4 rounded-[100px] border-[1px] whitespace-nowrap border-neutral-300 px-[10px] py-[6px]"
            >
              {`+ ${mappedAssets.length - MAX_ASSETS_ON_ROW}`}
            </div>
            <ReactTooltip
              id={mappingIds[0]}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              className="!opacity-100 !rounded-lg"
            >
              <div className="flex flex-wrap max-w-[250px] gap-2">
                {mappedAssets.slice(MAX_ASSETS_ON_ROW).map((asset) => (
                  <AssetChip key={`${account}-${asset.symbol}`} icon={asset.image} symbol={asset.symbol} />
                ))}
              </div>
            </ReactTooltip>
          </>
        )}
      </div>

      <div className="p-4 flex justify-center items-center ">
        <Image className="transform -scale-x-100" src={ArrowIcon} width={16} height={16} />
      </div>
      <div className="flex-1 flex items-center basis-1/6">
        <div className="w-80">
          <Dropdown
            placeholder="Select account"
            sizeVariant="medium"
            options={parsedOptions}
            showCaret
            isSearchable
            onChange={handleChangeAccount}
            value={selectedAccountOption}
            formatOptionLabel={FormatCoAOptionLabel}
          />
        </div>
      </div>
      <div className="flex-1 flex items-center basis-1/6 gap-2">
        <Button height={40} label="Edit" variant="ghost" onClick={onClickMapping} />
        <Button height={40} label="Remove" variant="ghostRed" onClick={handleRemoveMapping} />
      </div>
    </div>
  )
}

export default WalletSection
