import DividerVertical from '@/components/DividerVertical/DividerVertical'
import DropDown, { EPlacement } from '@/components/DropDown/DropDown'
import { format } from 'date-fns'
import { useState } from 'react'
import TransactionDateFilter from './TransactionDateFilter'
import Close from '@/public/svg/CloseGray.svg'
import Image from 'next/legacy/image'

interface IFilterTransactionByDate {
  handleSubmit: () => void
  startDate: Date
  setStartDate: (date: Date) => void
  endDate: Date
  setEndDate: (date: Date) => void
  handleResetDate: () => void
}
const FilterTransactionByDate: React.FC<IFilterTransactionByDate> = ({
  handleSubmit,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleResetDate
}) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)
  const [dateRange, setDateRange] = useState<number>(1)
  const handleClose = () => {
    setIsShowDropDown(false)
  }
  const primaryButtonOption = () => (
    <button
      type="button"
      className={`relative border rounded min-w-[40px] h-10 flex justify-center items-center border-[#EAECF0] ${
        isShowDropDown && 'shadow-button'
      }`}
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
    >
      {startDate && endDate ? (
        <div className="flex items-center pl-4 pr-2.5">
          <div className=" text-grey-800 text-sm font-medium font-inter leading-5 truncate">
            {`${format(new Date(startDate), 'dd MMM yyyy')} - ${format(new Date(endDate), 'dd MMM yyyy')}`}
          </div>
          <img src="/svg/calendar-grey.svg" alt="icon" height={15} width={15} className="ml-3" />
          <DividerVertical />
          <button
            type="button"
            className="flex items-center bg-gray-1200 p-1 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              setIsShowDropDown(false)
              setDateRange(1)
              handleResetDate()
            }}
          >
            <Image src={Close} alt="close" height={10} width={10} />
          </button>
        </div>
      ) : (
        <div className="flex items-center pl-4 pr-2.5">
          <div className=" text-grey-800 text-sm font-medium font-inter leading-5 truncate">
            {`${format(new Date(new Date().setDate(new Date().getDate() - 30)), 'dd MMM yyyy')} - ${format(
              new Date(),
              'dd MMM yyyy'
            )}`}
          </div>
          <img src="/svg/calendar-grey.svg" alt="icon" height={15} width={15} className="ml-3" />
        </div>
      )}
    </button>
  )

  return (
    <DropDown
      isShowDropDown={isShowDropDown}
      setIsShowDropDown={setIsShowDropDown}
      triggerButton={primaryButtonOption()}
      // placement={EPlacement.BESIDE}
      maxHeight="max-h-[550px]"
    >
      <TransactionDateFilter
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        dateRange={dateRange}
        setDateRange={setDateRange}
        handleSubmit={handleSubmit}
        handleClose={handleClose}
      />
    </DropDown>
  )
}

export default FilterTransactionByDate
