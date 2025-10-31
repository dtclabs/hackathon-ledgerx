import React, { Dispatch, SetStateAction, useRef } from 'react'
import ReactDatePicker from 'react-datepicker'
import warning from '@/assets/svg/warning.svg'
import Image from 'next/legacy/image'
import Modal from '@/components/Modal'

interface IFilterTransaction {
  startDate: Date
  setStartDate: (date: Date) => void
  endDate: Date
  setEndDate: (date: Date) => void
  handleSubmit: () => void
  setOpenDate: Dispatch<SetStateAction<boolean>>
  showErrorMsg: boolean
  setShowErrorMsg: Dispatch<SetStateAction<boolean>>
  openDate: boolean
  handleClose: () => void
}

const FilterTransaction: React.FC<IFilterTransaction> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleSubmit,
  setOpenDate,
  openDate,
  showErrorMsg,
  setShowErrorMsg,
  handleClose
}) => (
  <Modal setShowModal={setOpenDate} isDisabledOuterClick showModal={openDate} onClose={() => setOpenDate(false)}>
    <div className="bg-white rounded-lg p-4   border   border-[#eaeaec] ">
      <div className="flex items-center   ">
        <ReactDatePicker onChange={(date) => setStartDate(date)} inline fixedHeight startDate={startDate} withPortal />
        <ReactDatePicker fixedHeight onChange={(date) => setEndDate(date)} inline endDate={endDate} withPortal />
      </div>
      {endDate && startDate && startDate > endDate && (
        <div className="text-sm gap-2 font-inter flex items-center text-[#E83F6D] ">
          <div className=" flex items-center">
            <Image src={warning} alt="warning" />
          </div>
          End date should be greater than start date
        </div>
      )}
      <div className="flex gap-4 items-center justify-end pt-1">
        <button onClick={handleClose} type="button" className="">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={(!startDate && !endDate) || startDate > endDate}
          type="button"
          className="text-white bg-black-70 px-3 py-1 rounded-sm"
        >
          Apply
        </button>
      </div>
    </div>
  </Modal>
)

export default FilterTransaction
