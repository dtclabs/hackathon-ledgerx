import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { PreSetRange } from './data'

interface ITransactionDateFilter {
  startDate: Date
  setStartDate: (date: Date) => void
  endDate: Date
  setEndDate: (date: Date) => void
  dateRange: number
  setDateRange: Dispatch<SetStateAction<number>>
  handleSubmit: () => void
  handleClose: () => void
}

const TransactionDateFilter: React.FC<ITransactionDateFilter> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleClose,
  handleSubmit,
  dateRange,
  setDateRange
}) => {
  const [newStartDate, setNewStartDate] = useState<Date>(startDate || new Date())
  const [newEndDate, setNewEndDate] = useState<Date>(endDate || new Date())
  const startDateText = newStartDate ? format(new Date(newStartDate), 'dd MMM yyyy') : ''
  const endDateText = newEndDate ? format(new Date(newEndDate), 'dd MMM yyyy') : ''
  const [monthRange, setMonthRange] = useState<number>(dateRange)
  const [selectedPreSetRange, setSelectedPreSetRange] = useState(startDate && endDate ? '' : 'last30Days')

  useEffect(() => {
    setNewStartDate(startDate || new Date())
    setNewEndDate(endDate || new Date())
  }, [endDate, startDate])

  useEffect(() => {
    const date = PreSetRange.find((item) => item.key === selectedPreSetRange)
    if (date) {
      setNewStartDate(date.start)
      setNewEndDate(date.end)
      setMonthRange(date.monthRange ? date.monthRange : dateRange)
    }
  }, [dateRange, selectedPreSetRange])

  const handleContinue = () => {
    handleClose()
    handleSubmit()
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setDateRange(monthRange)
  }
  const handlePreSet = (key: string) => {
    setSelectedPreSetRange(key)
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
    <div className="bg-white rounded-md">
      {/* <div className="text-xs text-grey-400 px-3 py-2">Select date range</div> */}
      <div className="flex flex-col gap-2 px-3 custom1600x900:py-1 py-4 xl:px-2 border-dashboard-border-200 border-b">
        <div className="text-sm font-medium leading-5 text-dashboard-sub laptop:text-xs">Select Date Range</div>
      </div>
      <div className="flex">
        <div className="flex flex-col border-dashboard-border-200 border-r px-2 py-3 laptop:py-1 laptop:px-1">
          {PreSetRange.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`p-2 text-xs xl:p-[6px] xl:text-[10px] text-grey-800 leading-[18px] font-medium cursor-pointer justify-start truncate hover:bg-grey-200 rounded-md w-full text-left ${
                item.key === selectedPreSetRange && 'bg-grey-200'
              }`}
              onClick={() => {
                handlePreSet(item.key)
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div>
          <ReactDatePicker
            renderCustomHeader={({ monthDate, customHeaderCount, decreaseMonth, increaseMonth }) => (
              <div className="relative laptop:py-2 py-4">
                <button
                  type="button"
                  aria-label="Previous Month"
                  className="react-datepicker__navigation react-datepicker__navigation--previous"
                  style={customHeaderCount === monthRange ? { visibility: 'hidden' } : null}
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
              setNewStartDate(start)
              setNewEndDate(end)
              setSelectedPreSetRange('')
            }}
            onCalendarOpen={handleCalendarOpen}
            openToDate={newStartDate}
            startDate={newStartDate}
            endDate={newEndDate}
            monthsShown={monthRange + 1}
            inline
            withPortal
            selectsRange
            formatWeekDay={(nameOfDay) => nameOfDay.slice(0, 1)}
          />
          <div className="flex gap-10 custom1600x900:mt-1 mt-2 mx-4 custom1600x900:mb-2 mb-4 xl:mb-[6px]">
            <div className="flex flex-1 flex-col ">
              <div className="text-sm laptop:text-xs font-medium custom1600x900:mb-1 mb-2 text-dashboard-main">
                From
              </div>
              <div className="focus:outline-none border-[#EAECF0] text-sm laptop:text-xs text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 h-[40px] laptop:h-[36px] xl:h-[32px] w-full font-inter border rounded-lg flex gap-4 items-center px-4 py-2 xl:py-[6px] bg-gray-100 cursor-default">
                {startDateText}
              </div>
            </div>
            <div className="flex flex-1 flex-col">
              <div className="text-sm laptop:text-xs font-medium custom1600x900:mb-1 mb-2 text-dashboard-main">To</div>
              <div className="focus:outline-none border-[#EAECF0] text-sm laptop:text-xs text-gray-700 placeholder:text-[#98A2B3] placeholder:leading-5 h-[40px] laptop:h-[36px] xl:h-[32px] w-full font-inter border rounded-lg flex gap-4 items-center px-4 py-2 xl:py-[6px] bg-gray-100 cursor-default">
                {endDateText}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1  border-dashboard-border-200 border-t pb-1 pt-2 px-2 laptop:pt-1 laptop:pb-0">
        <button
          type="button"
          className="text-grey-800 text-xs font-medium  bg-[#F1F1EF] rounded-md px-3 py-2 xl:py-[6px] grow-0 font-inter"
          onClick={handleClose}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={Boolean(!newEndDate)}
          className={`text-white text-xs font-medium bg-grey-900  rounded-md px-3 py-2 xl:py-[6px] grow font-inter ${
            !newEndDate && 'opacity-60 cursor-not-allowed'
          }`}
          onClick={handleContinue}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default TransactionDateFilter
