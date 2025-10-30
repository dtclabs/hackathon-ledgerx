import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import React, { useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { useFormContext } from 'react-hook-form'
import Close from '@/public/svg/CloseGray.svg'

export interface IDateRange {
  startDate: Date
  endDate: Date
}

interface IDateRangeFilter {
  name?: string
  selection?: IDateRange
  setSelection?: (selection: IDateRange) => void
  isReset?: boolean
  widthBtn?: string
  dropdownWidth?: string
  applyable?: boolean
  onClear?: () => void
  onApply?: any
  className?: string
  dropdownPlacement?: EPlacement
}

const DateRangeFilter: React.FC<IDateRangeFilter> = ({
  name,
  setSelection,
  selection,
  isReset,
  widthBtn = 'w-[256px]',
  dropdownWidth = 'w-[256px]',
  applyable,
  onApply,
  onClear,
  className,
  dropdownPlacement = EPlacement.BOTTOMRIGHT
}) => {
  const formContext = useFormContext()

  const [startDate, setStartDate] = useState<Date>(selection?.startDate || null)
  const [endDate, setEndDate] = useState<Date>(selection?.endDate || null)

  const [isOpen, setIsopen] = useState(false)

  const handleChange = (option: IDateRange) => {
    setStartDate(option.startDate)
    setEndDate(option.endDate)
    if (setSelection) setSelection(option)
  }

  useEffect(() => {
    if (isReset && !isOpen && !formContext?.formState?.isSubmitting) {
      setStartDate(selection?.startDate)
      setEndDate(selection?.endDate)
      if (setSelection) setSelection(selection)
    }
  }, [isOpen, isReset, selection?.endDate, selection?.startDate, formContext?.formState?.isSubmitting])

  const triggerButton = () => (
    <button
      type="button"
      className={`flex items-center justify-between px-3 bg-white hover:bg-gray-100 border w-full h-12 rounded ${
        isOpen && 'shadow-button'
      } ${className}`}
      onClick={() => {
        setIsopen(!isOpen)
      }}
    >
      <div
        className={`${
          startDate && endDate ? 'text-neutral-900' : 'text-grey-700'
        } text-xs font-medium font-inter leading-5 truncate pt-[2px]`}
      >
        {startDate && endDate
          ? `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`
          : 'Start Date - End Date'}
      </div>
      <div className="flex items-center">
        <DividerVertical />
        {startDate && endDate ? (
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
    setStartDate(null)
    setEndDate(null)
    if (onClear) {
      onClear()
    }
  }
  const handleApply = () => {
    if (applyable) {
      setIsopen(false)
      if (onApply) onApply({ startDate, endDate })
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
      setIsShowDropDown={setIsopen}
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
          <div className="flex flex-col gap-2 px-2 py-1 border-dashboard-border-200 border-b">
            <div className="text-xs font-medium leading-5 text-dashboard-sub laptop:text-xs">Select Date Range</div>
          </div>
          <ReactDatePicker
            renderCustomHeader={({ monthDate, customHeaderCount, decreaseMonth, increaseMonth }) => (
              <div className="relative laptop:py-2 py-4">
                <button
                  type="button"
                  aria-label="Previous Month"
                  className="react-datepicker__navigation react-datepicker__navigation--previous"
                  style={customHeaderCount === 1 ? { visibility: 'hidden' } : null}
                  onClick={decreaseMonth}
                >
                  <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous">
                    {'<'}
                  </span>
                </button>
                <span className="text-dashboard-main font-semibold text-base leading-6 laptop:text-sm laptop:leading-5 font-inter mr-2">
                  {monthDate.toLocaleString('en-US', {
                    month: 'short'
                  })}
                </span>
                <span className="text-grey-400 font-semibold text-base leading-6 laptop:text-sm laptop:leading-5 font-inter mr-2">
                  {monthDate.toLocaleString('en-US', {
                    year: 'numeric'
                  })}
                </span>
                <button
                  type="button"
                  aria-label="Next Month"
                  className="react-datepicker__navigation react-datepicker__navigation--next"
                  style={customHeaderCount === 0 ? { visibility: 'hidden' } : null}
                  onClick={increaseMonth}
                >
                  <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next">
                    {'>'}
                  </span>
                </button>
              </div>
            )}
            onChange={(dates) => {
              const [start, end] = dates
              handleChange({ startDate: start, endDate: end })
            }}
            onCalendarOpen={handleCalendarOpen}
            openToDate={startDate}
            startDate={startDate}
            endDate={endDate}
            monthsShown={2}
            inline
            withPortal
            selectsRange
            formatWeekDay={(nameOfDay) => nameOfDay.slice(0, 1)}
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

export default DateRangeFilter
