import DropDown from '@/components/DropDown/DropDown'
import React, { useState, useEffect } from 'react'
import Dropdown from '@/public/svg/Dropdown.svg'
import Image from 'next/legacy/image'
import Checkbox from '@/components/Checkbox/Checkbox'
import { Button } from '@/components-v2'
import Close from '@/public/svg/CloseGray.svg'
import DividerVertical from '@/components/DividerVertical/DividerVertical'

interface IAssetsFilter {
  filter: any[]
  name: string
  options: any[]
  onApply: (list: any[]) => void
  onReset: () => void
  className?: string
  width?: string
}

const AssetsFilter: React.FC<IAssetsFilter> = ({
  filter,
  name,
  options,
  onApply,
  onReset,
  className,
  width = 'w-[230px]'
}) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<any>([...filter])

  useEffect(() => {
    if (!isShowDropDown) {
      setSelectedOptions([...filter])
    }
  }, [isShowDropDown, filter])

  const filterButton = () => (
    <button
      type="button"
      className={`text-xs font-medium text-grey-800 border border-grey-200 h-[34px] py-2 px-3 rounded flex items-center justify-between ${width} ${className} ${
        isShowDropDown && 'shadow-button'
      }`}
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
    >
      <div className="">
        {filter && filter.length > 0
          ? `(${filter.length}) ${name}${filter.length > 1 ? 's' : ''} Selected`
          : `All ${name}s`}
      </div>
      {filter && filter.length > 0 ? (
        <div className="flex items-center">
          <DividerVertical />
          <div
            aria-hidden
            onClick={(e) => {
              e.stopPropagation()
              handleReset()
            }}
            className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
          >
            <Image src={Close} alt="close" height={10} width={10} />
          </div>
        </div>
      ) : (
        <Image src={Dropdown} alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
      )}
    </button>
  )

  const handleSelect = (option: any) => {
    setSelectedOptions((prev) =>
      prev.find((prevItem) => prevItem.value === option.value)
        ? prev.filter((prevItem) => prevItem.value !== option.value)
        : [...prev, option]
    )
  }

  const handleClear = () => {
    setSelectedOptions([])
  }

  const handleReset = () => {
    setSelectedOptions([])
    if (onReset) onReset()
  }

  const handleApply = () => {
    if (onApply) onApply(selectedOptions)
    setIsShowDropDown(false)
  }

  return (
    <div className="flex items-center">
      <DropDown
        isShowDropDown={isShowDropDown}
        setIsShowDropDown={setIsShowDropDown}
        triggerButton={filterButton()}
        maxHeight="max-h-[400px]"
        width="max-w-[265px]"
      >
        <div className="flex flex-col ">
          <div className="overflow-auto scrollbar max-h-[176px]">
            {options &&
              options.length > 0 &&
              options.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(item)
                  }}
                >
                  <Checkbox
                    value={item.value}
                    onChange={(e) => e.stopPropagation()}
                    isChecked={
                      selectedOptions.length && selectedOptions.findIndex((option) => option.value === item.value) > -1
                    }
                    label={item.label}
                    className="flex items-center gap-2 text-sm text-neutral-900 py-[10px] px-3 font-medium"
                  />
                </button>
              ))}
          </div>
          <div className="flex gap-1">
            <Button
              disabled={selectedOptions.length === 0}
              onClick={handleReset}
              color="secondary"
              className="disabled:opacity-30"
            >
              Clear
            </Button>
            <Button onClick={handleApply} fullWidth>
              Apply
            </Button>
          </div>
        </div>
      </DropDown>
    </div>
  )
}

export default AssetsFilter
