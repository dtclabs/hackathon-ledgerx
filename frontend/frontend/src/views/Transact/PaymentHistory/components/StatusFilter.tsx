import DropDown from '@/components/DropDown/DropDown'
import React, { useState } from 'react'
import Sort from '@/public/svg/Sort.svg'
import Dropdown from '@/public/svg/Dropdown.svg'
import Image from 'next/legacy/image'
import Typography from '@/components-v2/atoms/Typography'
import { ProviderStatus } from '@/api-v2/payment-api'

interface StatusFilter {
  status: { label: string; providerStatuses: string }
  onChangeStatus: (status: { label: string; providerStatuses: string }) => void
}

const statusOptions = [
  { label: 'All', providerStatuses: '' },
  { label: 'Completed', providerStatuses: ProviderStatus.COMPLETED },
  { label: 'Processing', providerStatuses: ProviderStatus.PENDING },
  { label: 'Failed', providerStatuses: ProviderStatus.FAILED }
]

const StatusFilter: React.FC<StatusFilter> = ({ status, onChangeStatus }) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false)

  const statusButton = () => (
    <button
      type="button"
      className={`w-[190px] border border-grey-200 py-2 px-4 h-[34px] rounded flex justify-between items-center ${
        isShowDropDown && 'shadow-button'
      }`}
      onClick={() => {
        setIsShowDropDown(!isShowDropDown)
      }}
    >
      <div className="flex items-center">
        <Typography variant="body2" classNames="">
          Status: {status?.label}
        </Typography>
      </div>
      <Image src={Dropdown} alt="DownArrow" className={isShowDropDown ? 'rotate-180 ' : ''} />
    </button>
  )
  return (
    <div className="flex items-center">
      <DropDown isShowDropDown={isShowDropDown} setIsShowDropDown={setIsShowDropDown} triggerButton={statusButton()}>
        <div className="flex flex-col">
          {statusOptions &&
            statusOptions.length > 0 &&
            statusOptions.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`text-sm font-medium text-left text-grey-800 py-2 px-4 ${
                  status?.providerStatuses === item.providerStatuses && 'bg-grey-200'
                } hover:bg-grey-200`}
                onClick={(e) => {
                  e.stopPropagation()
                  onChangeStatus(item)
                  setIsShowDropDown(false)
                }}
              >
                {item.label}
              </button>
            ))}
        </div>
      </DropDown>
    </div>
  )
}

export default StatusFilter
