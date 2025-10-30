import Image from 'next/legacy/image'
import React from 'react'
import deleteSvg from '@/public/svg/delete.svg'
import edit from '@/public/svg/Edit.svg'
import Avvvatars from 'avvvatars-react'

export interface IDraftTransactionsItem {
  icon: any
}

const DraftTransactionsItem: React.FC<IDraftTransactionsItem> = ({ icon }) => (
  <div className="font-inter flex justify-between border-b border-dashboard-border-200 py-8 items-center">
    <div className="flex items-center gap-8">
      <div className="flex gap-4 items-center">
        <div className="p-[14px] w-fit flex items-center justify-center rounded-full bg-dashboard-main">
          <Image src={icon} alt="Draft-icon" />
        </div>
        <div>
          <div className="font-medium text-base text-dashboard-main">Single Transfer</div>
          <div className="font-medium text-xs text-dashboard-sub">14 Jul 2022, 9:00 AM</div>
        </div>
      </div>
      <div className="flex gap-8">
        <div>
          <div className="font-medium text-xs text-dashboard-sub">Source of Funds:</div>
          <div className="font-medium text-sm text-dashboard-main">HR Safe</div>
        </div>
        <div>
          <div className="font-medium text-xs text-dashboard-sub">Time of Transfer:</div>
          <div className="font-medium text-sm text-dashboard-main">14 Jul 2022, 9:00 AM</div>
        </div>
        <div>
          <div className="font-medium text-xs text-dashboard-sub">Recipient:</div>
          <div className="font-medium text-sm text-dashboard-main flex">
            <Avvvatars style="shape" size={24} value="0x12239752fa57bba52358a5b73290be0331341cce" />
            <div className="-ml-1 shadow-avvvatar rounded-full">
              <Avvvatars style="shape" size={24} value="0xd152f549545093347a162dce210e7293f1452150" />
            </div>
            <div className="-ml-1 shadow-avvvatar rounded-full">
              <Avvvatars style="shape" size={24} value="0xa6b71e26c5e0845f74c812102ca7114b6a896ab2" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex gap-2 items-center">
      <button
        type="button"
        className="flex items-center px-3 gap-2 border border-dashboard-border-200 rounded-lg text-xs text-dashboard-main h-8"
      >
        Continue Editing <Image src={edit} alt="Edit" />
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 border border-dashboard-border-200 rounded-lg text-xs text-dashboard-main h-8 w-8"
      >
        <Image src={deleteSvg} alt="Delete" />
      </button>
    </div>
  </div>
)

export default DraftTransactionsItem
