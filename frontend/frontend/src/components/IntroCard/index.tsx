import React from 'react'
import LedgerXLogo from '@/public/svg/logos/ledgerx-logo.svg'
import Image from 'next/legacy/image'
import OrgInfoRow from '@/views/Organization/components/OrgInfoRow'
import Doc from '@/public/svg/org-doc-icon.svg'
import Member from '@/public/svg/icons/member-icon.svg'
import Payment from '@/public/svg/icons/payment-icon.svg'

interface IIntroCard {
  height?: string
  width?: string
  bgColor?: string
  className?: string
}

const IntroCard: React.FC<IIntroCard> = ({
  bgColor = 'bg-grey-900',
  width = 'w-[450px]',
  height = 'h-[620px]',
  className
}) => (
  <div className={`${bgColor} ${width} ${height} px-10 py-16 ${className} flex flex-col justify-center relative`}>
    <div className="absolute top-16 left-10">
      <Image src={LedgerXLogo} width={200} height={24} />
    </div>
    <div className="h-fit">
      <OrgInfoRow
        img={Doc}
        title="Bookkeeping"
        description="Easily sync your on-chain transaction data with your accounting software like Quickbooks and Xero."
        className="mt-0 mb-8"
        titleClassName="font-bold text-base leading-5"
        titleColor="gray"
        descriptionClassName="font-normal text-sm leading-5"
        descriptionColor="gray"
      />
      <OrgInfoRow
        img={Member}
        title="Bulk Payouts"
        description="Send assets to multiple addresses all in one transfer."
        className="mt-0 mb-8"
        titleClassName="font-bold text-base leading-5"
        titleColor="gray"
        descriptionClassName="font-normal text-sm leading-5"
        descriptionColor="gray"
      />
      <OrgInfoRow
        img={Payment}
        title="Team Workflows"
        description="Add your team members and vendors, assign access controls, create contacts and more!"
        className="mt-0 mb-0"
        titleClassName="font-bold text-base leading-5"
        titleColor="gray"
        descriptionClassName="font-normal text-sm leading-5"
        descriptionColor="gray"
      />
    </div>
  </div>
)

export default IntroCard
