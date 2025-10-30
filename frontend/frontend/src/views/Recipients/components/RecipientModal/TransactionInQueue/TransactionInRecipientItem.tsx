import { StatusPendingLabel, StatusRejectedLabel, StatusSuccessLabel } from '@/components/Label/Label'
import dropdown from '@/public/svg/Dropdown.svg'
import reload from '@/public/svg/Reload.svg'
import USDC from '@/public/svg/USDC.svg'
import { EStatus } from '@/views/Recipients/interfaces'
import Image from 'next/legacy/image'
import React from 'react'

interface ITransactionRecipientItem {
  status: string
  subStatus: string
  method: string
  time: string
  amount: string
  price: string
  category: string
}

const TransactionRecipientItem: React.FC<ITransactionRecipientItem> = ({
  status,
  subStatus,
  amount,
  category,
  method,
  price,
  time
}) => (
  <div className="flex text-xs text-dashboard-sub gap-4 px-4 py-2 border-t border-dashboard-border-200">
    <div className="w-[26%]">
      <div className="text-sm text-[#344054] font-inter">{method}</div>
      <div className="text-xs text-[#475467] flex items-center gap-2 font-inter">
        {time}
        <button type="button">
          <Image src={reload} alt="reload" />
        </button>
      </div>
    </div>
    <div className="w-[22%]">
      <div className="flex items-center gap-2">
        <Image width={12} height={12} src={USDC} alt="dropdown" />
        <div className="text-sm text-[#344054] font-medium font-inter whitespace-nowrap text-ellipsis overflow-hidden">
          {amount}
        </div>
      </div>
      <div className="text-xs text-[#475467] font-normal font-inter">{`~ $${price} USD`}</div>
    </div>
    <div className="w-[23%] font-inter">
      {status.includes(EStatus.CONFIRMED) && (
        <StatusSuccessLabel
          status={status}
          width={12}
          height={12}
          className="flex gap-2 items-center rounded-[30px] text-sm font-medium leading-4 text-[#27AE60]"
        />
      )}
      {status.includes(EStatus.PENDING) && <StatusPendingLabel status={status} width={12} height={12} />}
      {status.includes(EStatus.REJECTED) && (
        <StatusRejectedLabel
          status={status}
          width={12}
          height={12}
          className="flex gap-2 items-center rounded-[30px] text-sm font-medium leading-4 text-[#E93636]"
        />
      )}
      <div className="text-xs text-[#475467] font-normal pl-5">{subStatus}</div>
    </div>
    <div className=" flex items-center justify-between flex-1">
      <button
        type="button"
        className="border border-dashboard-background px-3 py-[7px] text-xs text-dashboard-main rounded-lg bg-secondary-gray whitespace-nowrap"
      >
        {category}
      </button>
      <button
        type="button"
        // onClick={onClick}
        className="border border-[#EAECF0] cursor-pointer bg-white -rotate-90 flex justify-center items-center w-fit h-fit py-2 px-[6px] rounded-sm"
      >
        <Image src={dropdown} alt="dropdown" />
      </button>
    </div>
  </div>
)

export default TransactionRecipientItem
