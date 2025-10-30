import { IOption } from '@/components-v2/GroupDropDown/GroupDropdown'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import Checkbox from '@/components/Checkbox/Checkbox'
import { useDebounce } from '@/hooks/useDebounce'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import Image from 'next/legacy/image'
import Close from '@/public/svg/CloseGray.svg'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import TextField from '@/components/TextField/TextField'
import searchIcon from '@/assets/svg/search.svg'
import Typography from '@/components-v2/atoms/Typography'

interface IMultipleDropDown {
  name: string
  title: string
  options: any[] // {value:, name:, ...}
  selection?: any[]
  setSelection?: (selection: any[]) => void
  isReset?: boolean
  widthBtn?: string
  dropdownWidth?: string
  dropdownHeight?: string
  element: any
  suffix?: string
  applyable?: boolean
  onClear?: () => void
  onApply?: any
  className?: string
}

const MultipleDropDown: React.FC<IMultipleDropDown> = ({
  name,
  title,
  options,
  setSelection,
  selection = [],
  isReset,
  widthBtn = 'w-[256px]',
  dropdownWidth = 'w-[256px]',
  dropdownHeight = 'max-h-[400px]',
  element,
  suffix,
  applyable,
  onApply,
  onClear,
  className
}) => {
  const formContext = useFormContext()
  const searchRef = useRef(null)
  const [selectedOptions, setSelectedOptions] = useState(selection || [])
  const [isOpen, setIsopen] = useState(false)
  const [text, setText] = useState('')
  const { debouncedValue: search } = useDebounce(text, 300)

  const handleChangeText = (e) => {
    setText(e.target.value)
  }
  const handleReset = () => {
    setText('')
  }

  useEffect(() => {
    if (isReset && !isOpen && !formContext?.formState?.isSubmitting) {
      setSelectedOptions(selection)
      if (setSelection) setSelection(selection)
    } else if (!isReset && !isOpen) {
      if (setSelection) setSelection(selectedOptions)
    }
  }, [isOpen, isReset, formContext?.formState?.isSubmitting])

  useEffect(() => {
    if (isOpen) {
      searchRef.current.focus()
    }
  }, [isOpen])

  const optionsList = useMemo(
    () =>
      search
        ? options.filter(
            (option) =>
              option?.name?.toLowerCase().includes(search.toLowerCase()) ||
              option?.label?.toLowerCase().includes(search.toLowerCase())
          )
        : options,
    [options, search]
  )

  const handleClear = () => {
    setSelectedOptions([])
    if (onClear) {
      onClear()
    }
  }

  const handleApply = () => {
    if (applyable) {
      setIsopen(false)
      if (setSelection) setSelection(selectedOptions)
      if (onApply) onApply(selectedOptions)
    }
  }

  const handleSelect = (option: IOption) => {
    setSelectedOptions((prev) =>
      prev.find((prevItem) => prevItem.value === option.value)
        ? prev.filter((prevItem) => prevItem.value !== option.value)
        : [...prev, option]
    )
  }

  const triggerButton = () => (
    <button
      type="button"
      onClick={() => {
        setIsopen(!isOpen)
      }}
      className={`flex items-center justify-between px-3 bg-white hover:bg-gray-100 border w-full h-12 rounded ${
        isOpen && 'shadow-button'
      } ${className}`}
    >
      <Typography classNames="flex items-center pt-[2px]" color="primary" variant="caption">
        {selectedOptions.length === 0
          ? `All ${suffix || `${title}s`}`
          : suffix && selectedOptions.length > 1
          ? `(${selectedOptions.length}) ${suffix} Selected`
          : `(${selectedOptions.length}) ${title}${selectedOptions.length > 1 ? 's' : ''} Selected`}
      </Typography>
      {selectedOptions.length ? (
        <div className="flex items-center">
          <DividerVertical height="h-4" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200 hover:bg-gray-200"
          >
            <Image src={Close} alt="close" height={10} width={10} />
          </button>
        </div>
      ) : (
        <div className="cursor-pointer flex justify-between items-center w-fit h-fit py-[6px] px-1 rounded-sm flex-shrink-0">
          <img src="/svg/Dropdown.svg" alt="DownArrow" className={isOpen ? 'rotate-180 ' : ''} />
        </div>
      )}
    </button>
  )
  return (
    <DropDown
      isShowDropDown={isOpen}
      setIsShowDropDown={setIsopen}
      triggerButton={triggerButton()}
      placement={EPlacement.BOTTOMRIGHT}
      space="py-1"
      maxHeight="max-h-[650px]"
      width={widthBtn}
    >
      <div className={dropdownWidth}>
        {/* Search bar */}
        <div className="w-full px-1">
          <div className="flex items-center border-grey-200 border rounded-lg w-full">
            <div className="flex pl-4 items-center">
              <Image src={searchIcon} width={12} height={12} />
            </div>
            <TextField
              inputRef={searchRef}
              placeholder="Search"
              textSearch="search"
              search
              classNameContainer=" w-full"
              name="searchKey"
              classNameInput="bg-transparent focus:outline-none text-sm text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 placeholder:italic leading-5  w-full font-inter flex items-center px-[14px] py-[10px]"
              onChange={handleChangeText}
              value={text}
            />
            {text && (
              <div className="pr-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200"
                >
                  <Image src={Close} alt="close" height={10} width={10} />
                </button>
              </div>
            )}
          </div>
        </div>
        {optionsList?.length ? (
          <>
            <div className={`overflow-auto scrollbar mt-1 ${dropdownHeight}`}>
              {optionsList &&
                optionsList?.map((item) => (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(item)
                    }}
                    key={item.value}
                    className="w-full flex items-center "
                  >
                    <Checkbox
                      key={item.value}
                      value={item.value}
                      onChange={(e) => e.stopPropagation()}
                      isChecked={!!selectedOptions.find((option) => option.value === item.value)}
                      className="flex gap-2 text-sm text-neutral-900 py-[10px] px-3"
                    />
                    {element(item)}
                  </button>
                ))}
            </div>
            {applyable && (
              <div className="flex items-center gap-1 mx-1 mb-1">
                <button
                  type="button"
                  className="text-grey-800 text-xs font-medium bg-[#F1F1EF] rounded-md px-3 py-2 grow-0 font-inter"
                  onClick={handleClear}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="text-white text-xs font-medium bg-grey-900 rounded-md px-3 py-2 grow font-inter"
                  onClick={handleApply}
                >
                  Apply
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="px-2 py-4 text-center">No option found</div>
        )}
      </div>
    </DropDown>
  )
}

export default MultipleDropDown
