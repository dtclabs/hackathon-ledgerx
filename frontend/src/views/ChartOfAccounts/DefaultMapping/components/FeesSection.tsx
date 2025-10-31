/* eslint-disable no-else-return */
import { FC, useMemo } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { Badge } from '@/components-v2/molecules/Badge'
import ArrowIcon from '@/public/svg/icons/arrow-left.svg'
import Image from 'next/legacy/image'
import { Dropdown } from '@/components-v2/molecules/Forms/Dropdown'
import Button from '@/components-v2/atoms/Button'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import ReactTooltip from 'react-tooltip'
import _ from 'lodash'
import FormatCoAOptionLabel from './FormatCoAOptionLabel/FormatCoAOptionLabel'
import { ChartOfAccountMappingType } from '@/api-v2/chart-of-accounts-mapping'

interface IFeesSectionProps {
  resolveMapping?: boolean
  onClickMapping?: () => void
  onChangeAccount?: (id: string, value: any) => void
  title: string
  subtitle: any
  txCount?: number
  onClickAddCustomMapping?: any
  options?: any[]
  account?: any
  disableMapping?: boolean
  tooltipCopy?: string
  selectedAccountOption?: {
    value: string
    label: string
  }
  mapping: {
    id: string
    type: string
  }
}

const FeesSection: FC<IFeesSectionProps> = ({
  resolveMapping,
  onClickMapping,
  onChangeAccount,
  title,
  subtitle,
  txCount,
  options = [],
  account,
  disableMapping,
  mapping,
  selectedAccountOption,
  tooltipCopy
}) => {
  const handleChangeAccount = (value: any) => {
    if (onChangeAccount) onChangeAccount(mapping.id, value)
  }

  const handleDisabled = (_option) => {
    if (
      (mapping.type === ChartOfAccountMappingType.GAIN || mapping.type === ChartOfAccountMappingType.LOSS) &&
      _option.relatedMapping
    ) {
      if (
        mapping.type === ChartOfAccountMappingType.GAIN &&
        _option.relatedMapping?.type === ChartOfAccountMappingType.LOSS
      ) {
        return false
      } else if (
        mapping.type === ChartOfAccountMappingType.LOSS &&
        _option.relatedMapping?.type === ChartOfAccountMappingType.GAIN
      ) {
        return false
      }
    }

    return _option.disabled
  }

  const parsedOptions = useMemo(() => {
    const groupedAccounts = options?.map((option) => ({
      ...option,
      options: option?.options.map((item) => ({
        ...item,
        disabled: handleDisabled(item),
        isSelected: item.value === account
      }))
    }))

    return [
      {
        value: null,
        label: 'No Account'
      },
      ...groupedAccounts
    ]
  }, [options, account])

  return (
    <div className="flex flex-row gap-6 justify-between">
      <div className="basis-2/6 min-w-[350px]">
        <div className="flex flex-row items-center gap-2 pb-2">
          <Typography variant="body2" classNames="font-semibold" color="primary">
            {title}
          </Typography>
          {txCount && <Badge text={`${txCount} transactions`} variant="rounded-outline" color="white" size="small" />}
        </div>
        {subtitle ? (
          <Typography variant="body2" color="secondary">
            {subtitle}
          </Typography>
        ) : (
          <div className="min-w-[200px]" />
        )}
      </div>
      <div className="p-4 flex justify-center items-center">
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
            value={selectedAccountOption?.value ? selectedAccountOption : null}
            formatOptionLabel={FormatCoAOptionLabel}
          />
          {(mapping.type === 'fee' || mapping.type === 'rounding') && (
            <Typography classNames="mt-1 ml-1" variant="caption" color="secondary">
              This account will be exclusively mapped.
            </Typography>
          )}
        </div>
      </div>
      {resolveMapping && (
        <div className="flex-1 flex items-center basis-1/6">
          <div data-tip={`disable-mapping-${mapping.id}`} data-for={`disable-mapping-${mapping.id}`}>
            <Button
              leadingIcon={<Image src={AddIcon} height={12} width={12} />}
              height={40}
              label="Add Custom Mapping"
              variant="ghost"
              onClick={onClickMapping}
              disabled={disableMapping}
            />
          </div>
          {disableMapping && (
            <ReactTooltip
              id={`disable-mapping-${mapping.id}`}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              className="!opacity-100 !rounded-lg"
            >
              {tooltipCopy || ' A default account needs to be selected first.'}
            </ReactTooltip>
          )}
        </div>
      )}
    </div>
  )
}

export default FeesSection
