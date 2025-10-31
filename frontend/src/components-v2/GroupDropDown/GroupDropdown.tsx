import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import Image from 'next/legacy/image'
import searchIcon from '@/assets/svg/search.svg'
import TextField from '@/components/TextField/TextField'
import Close from '@/public/svg/CloseGray.svg'
import Checkbox from '@/components/Checkbox/Checkbox'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import ReactTooltip from 'react-tooltip'

export interface IOption {
  value: any
  label: string
  showTooltip?: boolean
}

interface IGroupOption {
  groupLabel: string
  options: IOption[]
}

interface IGroupDropdown {
  options: IGroupOption[]
  name: string
  widthBtn?: string
  dropdownWidth?: string
  dropdownHeight?: string
  // To display apply
  applyable?: boolean
  // state from parent
  selection?: IOption[]
  setSelection: (selection: IOption[]) => void
  isReset?: boolean
  title: string
  suffix?: string
  onClear?: () => void
  onApply?: () => void
  position?: 'bottom' | 'top'
  className?: string
}

const GroupDropdown: React.FC<IGroupDropdown> = ({
  name,
  title,
  suffix,
  options,
  selection,
  setSelection,
  applyable,
  widthBtn = 'w-[256px]',
  dropdownWidth = 'w-[256px]',
  dropdownHeight = 'max-h-[400px]',
  isReset,
  onClear,
  onApply,
  position = 'bottom',
  className
}) => {
  const searchRef = useRef(null)

  const [isOpen, setIsopen] = useState(false)
  const [isCollapse, setIsCollapse] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState(selection || [])
  const [text, setText] = useState('')
  const { debouncedValue: search } = useDebounce(text, 300)

  // Reset on close without aplly
  useEffect(() => {
    if (isReset && !isOpen) setSelectedOptions(selection)
  }, [isOpen, isReset, selection])

  useEffect(() => {
    if (isOpen) {
      searchRef.current.focus()
    }
  }, [isOpen])

  // triggerButton
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
      <div className="flex items-center text-xs text-neutral-900 pt-[2px]">
        {selectedOptions.length === 0
          ? `All ${suffix || `${title}s`}`
          : suffix && selectedOptions.length > 1
          ? `(${selectedOptions.length}) ${suffix} Selected`
          : `(${selectedOptions.length}) ${title}${selectedOptions.length > 1 ? 's' : ''} Selected`}
      </div>
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
  // Search list
  const handleChangeText = (e) => {
    setText(e.target.value)
  }
  const handleReset = () => {
    setText('')
  }
  const optionsList = useMemo(() => {
    const filteredOptions = search
      ? options.map((option) => ({
          ...option,
          options: option.options.filter((subOption) =>
            subOption.label.toLocaleLowerCase().includes(search.toLocaleLowerCase())
          )
        }))
      : options
    return filteredOptions.filter((option) => option.options?.length > 0)
  }, [options, search])
  // Collapse group
  const handleCollapse = (groupLabel: string) => {
    setIsCollapse((prev) =>
      prev.find((prevItem) => prevItem === groupLabel)
        ? prev.filter((prevItem) => prevItem !== groupLabel)
        : [...prev, groupLabel]
    )
  }
  // Select item
  const handleSelect = (option: IOption) => {
    setSelectedOptions((prev) =>
      prev.find((prevItem) => prevItem.value === option.value)
        ? prev.filter((prevItem) => prevItem.value !== option.value)
        : [...prev, option]
    )
  }
  // Select all
  const handleSelectAll = (groupOption: IGroupOption) => {
    const list = optionsList.find((item) => item.groupLabel === groupOption.groupLabel).options

    if (list.every((option) => selectedOptions.findIndex((item) => item.value === option.value) >= 0)) {
      for (const option of list) {
        setSelectedOptions((prev) => prev.filter((prevI) => prevI.value !== option.value))
      }
    } else {
      for (const option of list) {
        setSelectedOptions((prev) =>
          prev.findIndex((prevItem) => prevItem.value === option.value) >= 0 ? [...prev] : [...prev, option]
        )
      }
    }
  }

  const isCheckAll = (groupOption: IGroupOption) => {
    const list = options.find((item) => item.groupLabel === groupOption.groupLabel).options
    if (list.every((option) => selectedOptions.findIndex((item) => item.value === option.value) >= 0)) {
      return true
    }
    return false
  }

  const isIndeterminate = (groupOption: IGroupOption) => {
    const list = options.find((item) => item.groupLabel === groupOption.groupLabel).options
    const isExist = list.some((option) => selectedOptions.findIndex((item) => item.value === option.value) >= 0)
    if (!isCheckAll(groupOption) && isExist) {
      return true
    }
    return false
  }
  // Clear
  const handleClear = () => {
    setSelectedOptions([])
    if (onClear) {
      onClear()
    }
  }

  // Apply
  const handleApply = () => {
    if (applyable) {
      setIsopen(false)
      setSelection(selectedOptions)
      if (onApply) onApply()
    }
  }

  // Effect
  useEffect(() => {
    if (!applyable && !isOpen) {
      setSelection(selectedOptions)
    }
  }, [selectedOptions, isOpen])

  return (
    <DropDown
      isShowDropDown={isOpen}
      setIsShowDropDown={setIsopen}
      triggerButton={triggerButton()}
      placement={position === 'top' ? EPlacement.TOPRIGHT : EPlacement.BOTTOMRIGHT}
      space="py-1"
      maxHeight="max-h-[650px]"
      width={widthBtn}
      position={position}
      bottomPosition={position === 'top' && 'bottom-14'}
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
            {/* List */}
            <div className={`overflow-auto scrollbar mt-1 ${dropdownHeight}`}>
              {optionsList &&
                optionsList.length &&
                optionsList.map((option) => (
                  <div key={option.groupLabel}>
                    {/* Group Label */}
                    <div className="flex items-center gap-2 py-[10px] px-3 bg-[#E2E2E0]">
                      <Checkbox
                        indeterminate={isIndeterminate(option)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectAll(option)
                        }}
                        isChecked={isCheckAll(option)}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCollapse(option.groupLabel)
                        }}
                        className="flex items-center justify-between flex-1"
                      >
                        <div className="text-neutral-900 font-semibold text-sm">{option.groupLabel}</div>
                        <div
                          className={`${
                            isCollapse.find((item) => option.groupLabel === item) ? 'rotate-180' : ''
                          } cursor-pointer flex justify-end items-center w-fit h-fit  py-1 px-[3px] rounded`}
                        >
                          <img src="/svg/Dropdown.svg" alt="dropdown" width={10} height={10} />
                        </div>
                      </button>
                    </div>
                    {!isCollapse.includes(option.groupLabel) && option.options && option.options.length
                      ? option.options.map((subOption) => (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelect(subOption)
                            }}
                            key={subOption.value}
                            className="w-full"
                          >
                            <Checkbox
                              key={subOption.value}
                              value={subOption.value}
                              onChange={(e) => e.stopPropagation()}
                              isChecked={!!selectedOptions.find((item) => subOption.value === item.value)}
                              className="flex gap-2 text-sm text-neutral-900 py-[10px] px-3 ml-5"
                              label={
                                <>
                                  <div
                                    data-tip={`group-dropdown-tooltip-${subOption.value}`}
                                    data-for={`group-dropdown-tooltip-${subOption.value}`}
                                    className="font-inter text-sm text-neutral-900 truncate font-normal"
                                  >
                                    {subOption.label}
                                  </div>
                                  {subOption?.showTooltip && (
                                    <ReactTooltip
                                      id={`group-dropdown-tooltip-${subOption.value}`}
                                      borderColor="#eaeaec"
                                      border
                                      backgroundColor="white"
                                      textColor="#111111"
                                      effect="solid"
                                      place="top"
                                      className="!opacity-100 !rounded-lg"
                                    >
                                      {subOption.label}
                                    </ReactTooltip>
                                  )}
                                </>
                              }
                            />
                          </button>
                        ))
                      : null}
                  </div>
                ))}
            </div>
            {applyable && (
              <div className="flex items-center gap-1 mx-1 mt-1">
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
          <div className="px-2 py-4 text-center">No options found</div>
        )}
      </div>
    </DropDown>
  )
}

export default GroupDropdown
