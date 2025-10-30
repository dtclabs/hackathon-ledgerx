import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import Close from '@/public/svg/CloseGray.svg'
import { compareAsc, format, getYear, startOfMonth } from 'date-fns'
import { range } from 'lodash'
import Image from 'next/legacy/image'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import SelectDropdown from '../Select/Select'
import { yearSelectStyles } from './style'

const years = range(getYear(new Date()), 2008, -1).map((year) => ({
  value: year,
  label: year
}))

interface IMonthPicker {
  selection?: Date
  setSelection?: (selection: Date) => void
  isReset?: boolean
  widthBtn?: string
  dropdownWidth?: string
  minDate?: Date
  maxDate?: Date
  applyable?: boolean
  closeOnSelect?: boolean
  onClear?: () => void
  onApply?: any
  className?: string
  showTitle?: boolean
  yearDropdown?: boolean
  dropdownPlacement?: EPlacement
  isClearable?: boolean
}

const MonthPicker: React.FC<IMonthPicker> = ({
  setSelection,
  selection,
  maxDate,
  isReset,
  widthBtn = 'w-[256px]',
  dropdownWidth = 'w-[256px]',
  applyable,
  onApply,
  onClear,
  closeOnSelect,
  className,
  showTitle,
  yearDropdown,
  dropdownPlacement = EPlacement.BOTTOMRIGHT,
  minDate,
  isClearable = true
}) => {
  const [date, setDate] = useState<Date>(selection || new Date())

  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (option: Date) => {
    setDate(option)
    if (setSelection) setSelection(option)
    if (closeOnSelect) setIsOpen(false)
  }

  useEffect(() => {
    if (isReset && !isOpen) {
      setDate(selection)
      if (setSelection) setSelection(selection)
    }
  }, [isOpen, isReset, selection])

  const triggerButton = () => (
    <button
      type="button"
      className={`flex items-center justify-between px-3 bg-white hover:bg-gray-100 border border-[#EAECF0] w-full h-[50px] rounded ${
        isOpen && 'shadow-button'
      } ${className}`}
      onClick={() => {
        setIsOpen(!isOpen)
      }}
    >
      <div
        className={`${
          date ? 'text-[#333333]' : 'text-grey-700'
        } text-sm font-normal font-inter leading-5 truncate pt-[2px]`}
      >
        {date ? `${format(new Date(date), 'MMMM yyyy')}` : 'Select a month'}
      </div>
      <div className="flex items-center">
        {date && isClearable ? (
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
        ) : (
          <img src="/svg/calendar-grey.svg" alt="icon" height={15} width={15} />
        )}
      </div>
    </button>
  )

  const handleClear = () => {
    setDate(null)
    if (onClear) {
      onClear()
    }
  }
  const handleApply = () => {
    if (applyable) {
      setIsOpen(false)
      if (onApply) onApply(date)
    }
  }
  const handleCalendarOpen = () => {
    document.addEventListener(
      'touchstart',
      (event: TouchEvent) => {
        event.stopPropagation()
      },
      true
    )
  }

  return (
    <DropDown
      isShowDropDown={isOpen}
      setIsShowDropDown={setIsOpen}
      triggerButton={triggerButton()}
      placement={dropdownPlacement}
      space="py-1"
      maxHeight="max-h-[650px]"
      widthBtn={widthBtn}
      position="bottom"
      className="min-w-fit"
    >
      <div className={dropdownWidth}>
        <div className="bg-white rounded-md">
          {showTitle && (
            <div className="flex flex-col gap-2 px-2 py-1 border-dashboard-border-200 border-b">
              <div className="text-xs font-medium leading-5 text-dashboard-sub laptop:text-xs">Select Month</div>
            </div>
          )}
          <ReactDatePicker
            renderCustomHeader={({ monthDate, decreaseYear, increaseYear, changeYear }) => (
              <div className="relative py-2">
                <button
                  type="button"
                  aria-label="Previous Month"
                  className="react-datepicker__navigation react-datepicker__navigation--previous"
                  onClick={decreaseYear}
                >
                  <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous">
                    {'<'}
                  </span>
                </button>
                {!yearDropdown ? (
                  <span className="text-dashboard-main font-semibold text-[18px] leading-6 laptop:text-sm laptop:leading-5 font-inter mr-2">
                    {monthDate.toLocaleString('en-US', {
                      year: 'numeric'
                    })}
                  </span>
                ) : (
                  <SelectDropdown
                    className="inline-block"
                    disableIndicator
                    isSearchable
                    styles={yearSelectStyles}
                    onChange={(_option) => {
                      changeYear(_option.value)
                    }}
                    name="account"
                    options={years}
                    defaultValue={years[years.length - 1]}
                    value={{
                      value: getYear(monthDate),
                      label: getYear(monthDate)
                    }}
                  />
                )}
                {((maxDate && compareAsc(startOfMonth(monthDate), startOfMonth(maxDate)) === -1) || !maxDate) && (
                  <button
                    type="button"
                    aria-label="Next Month"
                    className="react-datepicker__navigation react-datepicker__navigation--next"
                    onClick={increaseYear}
                  >
                    <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next">
                      {'>'}
                    </span>
                  </button>
                )}
              </div>
            )}
            onChange={(_date) => {
              handleChange(_date)
            }}
            showYearDropdown
            showMonthYearPicker
            showFullMonthYearPicker
            onCalendarOpen={handleCalendarOpen}
            selected={date}
            maxDate={maxDate}
            inline
            withPortal
            minDate={minDate}
            isClearable={isClearable}
          />
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
      </div>
    </DropDown>
  )
}

export default MonthPicker
