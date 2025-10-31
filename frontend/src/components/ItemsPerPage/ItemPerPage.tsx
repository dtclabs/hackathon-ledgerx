import React, { useState } from 'react'
import DropDown, { EPlacement } from '../DropDown/DropDown'
import Typography from '@/components-v2/atoms/Typography'

export interface IItemPerPage {
  size: number
  setSize: (size: number) => void
  setPage: (page: number) => void
  title?: string
  dataPaginate: number[]
}

const RowsPerPage: React.FC<IItemPerPage> = ({ size, title, setSize, dataPaginate, setPage }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)

  const handleShowDropdown = () => {
    setIsShowDropDown(!isShowDropDown)
  }
  return (
    <div className="flex items-center gap-3 whitespace-nowrap text-xs">
      <Typography>{title}</Typography>
      <DropDown
        isShowDropDown={isShowDropDown}
        setIsShowDropDown={setIsShowDropDown}
        triggerButton={
          <button
            type="button"
            className="bg-white flex items-center justify-between gap-2 w-full py-2 px-3 rounded-lg leading-5 border border-blanca-300 text-primary-pink"
            id="select-item-per-page"
            aria-expanded="true"
            aria-haspopup="true"
            onClick={handleShowDropdown}
          >
            <Typography>{size}</Typography>
            <div className="cursor-pointer flex justify-between items-center w-fit h-fit py-[6px] px-1 rounded-sm flex-shrink-0">
              <img src="/svg/Dropdown.svg" alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
            </div>
          </button>
        }
        maxHeight="max-h-[500px]"
        placement={EPlacement.TOPRIGHT}
        position="top"
        width="w-full"
        bottomPosition="bottom-11"
      >
        {dataPaginate.map((item) => (
          <button
            type="button"
            key={item}
            className={`${
              size === item ? 'bg-dashboard-background' : 'bg-white hover:bg-grey-200'
            } px-3 py-2 text-xs text-dashboard-main cursor-pointer truncate w-full text-left rounded flex justify-center items-center`}
            onClick={() => {
              setSize(item)
              setPage(0)
              setIsShowDropDown(false)
            }}
          >
            {item}
          </button>
        ))}
      </DropDown>
    </div>
  )
}

export default RowsPerPage
