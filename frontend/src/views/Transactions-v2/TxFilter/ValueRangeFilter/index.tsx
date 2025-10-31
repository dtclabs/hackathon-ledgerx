import DividerVertical from '@/components/DividerVertical/DividerVertical'
import TextField from '@/components/TextField/TextField'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import Image from 'next/legacy/image'
import warning from '@/assets/svg/warning.svg'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import Typography from '@/components-v2/atoms/Typography'

export interface IValueRange {
  fromFiatAmount: string
  toFiatAmount: string
}

interface IValueRangeFilter {
  name?: string
  selection?: IValueRange
  setSelection?: (selection: IValueRange) => void
  isReset?: boolean
}

const ValueRangeFilter: React.FC<IValueRangeFilter> = ({ name, setSelection, selection, isReset }) => {
  const [minRange, setminRange] = useState<string>(selection?.fromFiatAmount || '')
  const [maxRange, setmaxRange] = useState<string>(selection?.toFiatAmount || '')
  const [error, setError] = useState(false)
  const { setValue } = useFormContext()
  const { fiatCurrency: fiatCurrencySetting } = useAppSelector(orgSettingsSelector)

  useEffect(() => {
    if (isReset) {
      setminRange(selection?.fromFiatAmount)
      setmaxRange(selection?.toFiatAmount)
    }
  }, [isReset, selection?.toFiatAmount, selection?.fromFiatAmount])

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-between bg-white border w-full h-12 rounded">
          <TextField
            value={minRange}
            onChange={(e) => {
              setValue('fromFiatAmount', e.target.value)
              setminRange(e.target.value)
              setError(Number.isNaN(+e.target.value) || Number.isNaN(+maxRange))
            }}
            placeholder="Start Value"
            name="fromFiatAmount"
            classNameInput="w-full bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic w-full font-inter px-[14px] py-[10px]"
          />
          <DividerVertical />
          <Typography classNames="pr-4">{fiatCurrencySetting?.code}</Typography>
        </div>
        <Typography>-</Typography>
        <div className="flex items-center justify-between bg-white border w-full h-12 rounded">
          <TextField
            value={maxRange}
            placeholder="End Value"
            onChange={(e) => {
              setValue('toFiatAmount', e.target.value)
              setmaxRange(e.target.value)
              setError(Number.isNaN(+e.target.value) || Number.isNaN(+minRange))
            }}
            name="toFiatAmount"
            classNameInput="w-full bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic w-full font-inter px-[14px] py-[10px]"
          />
          <DividerVertical />
          <Typography classNames="pr-4">{fiatCurrencySetting?.code}</Typography>
        </div>
      </div>
      {error && (
        <Typography classNames="flex items-center !text-[#E83F6D]" variant="body2">
          <div className="mr-2 flex items-center">
            <Image src={warning} alt="warning" />
          </div>
          Value must be number.
        </Typography>
      )}
    </>
  )
}

export default ValueRangeFilter
