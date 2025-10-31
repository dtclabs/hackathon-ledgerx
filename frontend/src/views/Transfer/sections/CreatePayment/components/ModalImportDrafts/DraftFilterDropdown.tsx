import Typography from '@/components-v2/atoms/Typography'
import MultipleDropDown from '@/views/Transactions-v2/TxFilter/MultipleDropDown'
import Image from 'next/legacy/image'
import React from 'react'

const optionElement = (option) => (
  <div className="text-left truncate">
    <div className="flex items-center gap-2 truncate pr-1">
      {option?.img && <Image src={option?.img} width={14} height={14} alt={option.label} />}
      <Typography classNames="truncate">{option.label}</Typography>
    </div>
    {option?.subLabel && (
      <Typography variant="caption" color="secondary">
        {option.subLabel}
      </Typography>
    )}
  </div>
)

const DraftFilterDropdown: React.FC<{
  name: string
  options: { value: string; label: string; subLabel?: string }[]
  value: { value: string; label: string; subLabel?: string }[]
  suffix?: string
  onChange: (value: any[]) => void
  onClear: () => void
  classNames?: string
  isReset?: boolean
  dropdownHeight?: string
}> = ({
  name,
  options,
  onChange,
  value,
  suffix,
  onClear,
  isReset = true,
  classNames,
  dropdownHeight = 'max-h-[400px]'
}) => (
  <MultipleDropDown
    className={`h-[34px] rounded w-[200px] ${classNames}`}
    widthBtn="w-full"
    dropdownWidth="w-full"
    dropdownHeight={dropdownHeight}
    isReset={isReset}
    applyable
    name={name}
    title={name}
    suffix={suffix}
    options={options}
    selection={value}
    onClear={onClear}
    onApply={onChange}
    element={optionElement}
  />
)

export default DraftFilterDropdown
