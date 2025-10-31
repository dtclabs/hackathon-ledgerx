import React from 'react'
import tickIcon from '@/public/image/TickIcon.png'

interface IThankCard {
  title: string
  description?: string | any
  className?: string
}

const ThankCard: React.FC<IThankCard> = ({ title, description, className }) => (
  <div className={`bg-grey-200 rounded-lg py-4 font-inter ${className}`}>
    <div className="mb-2 text-base text-neutral-900 font-semibold leading-6 text-center">{title}</div>
    <div className="text-grey-700 text-sm text-center">{description}</div>
    <div className="flex-col text-sm text-grey-20 mt-6 px-4">
      <div className="flex items-center ">
        <div className="flex-col gap-1 mb-6">
          <div className="flex items-center w-full pl-[10px] text-left font-semibold text-sm leading-5 text-neutral-900">
            <img src={tickIcon.src} alt="icon" className="mr-[18px] h-[10px] w-[14px] mt-1" />
            Bookkeeping
          </div>
          <div className="w-full pl-[42px] pr-2 text-left font-medium text-grey-800 text-sm leading-5 mt-1">
            Easily sync your on-chain transaction data with common accounting software like Quickbooks and Xero.
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex-col gap-1 mb-6">
          <div className="flex items-center w-full pl-[10px] text-left font-semibold text-sm leading-5 text-neutral-900">
            <img src={tickIcon.src} alt="icon" className="mr-[18px] h-[10px] w-[14px] mt-1" />
            Bulk Payouts
          </div>
          <div className="w-full pl-[42px] pr-2 text-left font-medium text-grey-800 text-sm leading-5 mt-1">
            Send assets to multiple addresses all in one transfer.
          </div>
        </div>
      </div>
      <div className="flex items-center ">
        <div className="flex-col gap-1">
          <div className="flex items-center w-full pl-[10px] text-left font-semibold text-sm leading-5 text-neutral-900">
            <img src={tickIcon.src} alt="icon" className="mr-[18px] h-[10px] w-[14px] mt-1" />
            Team Workflows
          </div>
          <div className="w-full pl-[42px] pr-2 text-left font-medium text-grey-800 text-sm leading-5 mt-1">
            Add your team members and vendors, assign access controls, create contacts and more!
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default ThankCard
