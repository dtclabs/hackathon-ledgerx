import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import { setHours, setMinutes, format } from 'date-fns'
import Image from 'next/legacy/image'
import React, { useState, useEffect } from 'react'
import ReactDatePicker from 'react-datepicker'
import { Button } from '../Button'
import CloseIcon from '@/public/svg/action-icon/close-icon.svg'

interface IDateTimePicker {
  onSubmit?: (date: Date) => void
  onSelect?: (date: Date) => void
  inputDate?: Date
  id?: string
  confirmable?: boolean
  showTimeSelect?: boolean
  timeIntervals?: number
  height?: string
  placeholder?: string
  ignoreDefault?: boolean
  disablePreviousDates?: boolean
  disabledDatesBefore?: string
  isClearable?: boolean
  classNames?: string
}

const DateTimePicker: React.FC<IDateTimePicker> = ({
  onSelect,
  onSubmit,
  inputDate,
  confirmable,
  showTimeSelect,
  timeIntervals,
  disablePreviousDates,
  disabledDatesBefore,
  isClearable,
  height,
  id,
  classNames,
  placeholder = 'Please select date',
  ignoreDefault
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const [date, setDate] = useState<Date>(inputDate || ignoreDefault ? null : new Date())

  useEffect(() => {
    if (inputDate) setDate(inputDate)
    else setDate(null)
  }, [inputDate])

  const renderInputValue = () => {
    if (date) return format(date, `dd/MM/yyyy${showTimeSelect ? ', hh:mm a' : ''}`)
    return placeholder
  }

  const handleOnClickClose = (e) => {
    e.stopPropagation()
    setDate(null)
    onSelect(null)
  }
  const triggerButton = () => (
    <button
      type="button"
      className={`relative w-full border rounded min-w-[40px] ${
        height ? `h-[${height}px]` : 'h-10'
      } px-3 py-[14px] text-sm text-neutral-900 font-medium leading-5 flex items-center justify-between border-[#EAECF0]  ${
        showPicker && 'shadow-button'
      } ${classNames}`}
      onClick={() => {
        setShowPicker(!showPicker)
      }}
    >
      <p
        className={`text-sm ${
          inputDate ? 'text-neutral-500' : placeholder ? 'text-[#98A2B3] font-normal' : 'text-neutral-900 font-medium'
        }  leading-5`}
      >
        {renderInputValue()}
        {/* {inputDate
          ? format(inputDate, `dd/MM/yyyy${showTimeSelect ? ', hh:mm a' : ''}`)
          : ignoreDefault
          ? placeholder
          : format(date, `dd/MM/yyyy${showTimeSelect ? ', hh:mm a' : ''}`)} */}
      </p>
      <div className="flex items-center">
        <DividerVertical height="h-4" space="mr-4" />
        <div className="flex flex-row gap-2">
          <img src="/svg/calendar-grey.svg" alt="icon" height={15} width={15} />
          {isClearable && date && (
            <Image src={CloseIcon} alt="icon" onClick={handleOnClickClose} height={15} width={15} />
          )}
        </div>
      </div>
    </button>
  )
  const handleCancel = () => {
    // logic here
    setShowPicker(false)
  }

  const handleComfirm = () => {
    if (onSubmit) onSubmit(date)
    else {
      // logic here
    }
    setShowPicker(false)
  }

  const handleSelect = (data: Date) => {
    if (onSelect) {
      setDate(data)
      onSelect(data)
      setShowPicker(false)
    } else {
      setDate(data)
    }
  }

  return (
    <DropDown
      isShowDropDown={showPicker}
      setIsShowDropDown={setShowPicker}
      triggerButton={triggerButton()}
      maxHeight="max-h-[550px]"
      position="bottom"
      placement={EPlacement.BOTTOMRIGHT}
      widthBtn="w-full"
      className="min-w-max"
    >
      <div className="bg-white rounded-md ">
        <ReactDatePicker
          minDate={disabledDatesBefore && new Date(disabledDatesBefore)}
          renderCustomHeader={({ monthDate, decreaseMonth, increaseMonth }) => (
            <div className="relative py-[9px] ">
              <button
                type="button"
                aria-label="Previous Month"
                className="react-datepicker__navigation react-datepicker__navigation--previous"
                onClick={decreaseMonth}
              >
                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous">
                  {'<'}
                </span>
              </button>
              <span className="text-dashboard-main font-semibold !text-xs leading-6 laptop:text-sm laptop:leading-5 font-inter mr-2">
                {monthDate.toLocaleString('en-US', {
                  month: 'short'
                })}
              </span>
              <span className="text-dashboard-main font-semibold !text-xs leading-6 laptop:text-sm laptop:leading-5 font-inter mr-2">
                {monthDate.toLocaleString('en-US', {
                  year: 'numeric'
                })}
              </span>
              <button
                type="button"
                aria-label="Next Month"
                className="react-datepicker__navigation react-datepicker__navigation--next"
                onClick={increaseMonth}
              >
                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next">{'>'}</span>
              </button>
            </div>
          )}
          onChange={(data) => {
            handleSelect(data)
          }}
          inline
          withPortal
          selected={date}
          timeIntervals={timeIntervals || 15}
          showTimeSelect={showTimeSelect}
          formatWeekDay={(nameOfDay) => nameOfDay.slice(0, 1)}
        />
        {confirmable && (
          <div className="flex items-center pt-2 pb-1 px-2 gap-1 border-t">
            <Button color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleComfirm}>
              Done
            </Button>
          </div>
        )}
      </div>
    </DropDown>
  )
}

export default DateTimePicker
