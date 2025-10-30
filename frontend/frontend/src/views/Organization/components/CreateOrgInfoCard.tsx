import { FC } from 'react'
import Image from 'next/legacy/image'

import personPlus from '@/public/svg/blue-member-icon.svg'

import { Button, Typography } from '@/components-v2'
import OrgInfoRow from './OrgInfoRow'

import Icon1 from '@/public/svg/org-doc-icon.svg'

interface ICreateOrgInfoCard {
  onClickCreateNow: any
}

const CreateOrgInfoCard: FC<ICreateOrgInfoCard> = ({ onClickCreateNow }) => (
  <div className=" w-[800px]  bg-white  rounded-3xl shadow-home-modal">
    <div className="p-8 flex flex-col items-center">
      <div className="w-fit flex items-center justify-center rounded-full bg-[#E6E6FF] group-hover:bg-dashboard-darkMain mx-0 my-auto">
        <Image src={personPlus} alt="person plus" />
      </div>
      <Typography className="text-3xl leading-8 mb-2 mt-4" variant="title1">
        Create your organisation
      </Typography>
      {/* <h1 className="font-inter text-2xl text-[#344054] font-semibold mb-2 mt-4"></h1> */}
    </div>
    <div className="flex flex-col items-center pb-8">
      <OrgInfoRow
        img={Icon1}
        title="Crypto accounting"
        description="Sync your on-chain transaction data easily with common accounting software like QuickBooks and Xero."
      />
      <OrgInfoRow img={Icon1} title="Token Payouts" description="Make a single or bulk token transfer." />
      <OrgInfoRow
        img={Icon1}
        title="Team collaboration"
        description="Manage your team and keep track of activity together."
      />

      <Button onClick={onClickCreateNow} className="pl-16 pr-16 mt-4" size="xl">
        Create Now
      </Button>
    </div>

    <div className="border-t border-[#EAECF0]" />
  </div>
)

export default CreateOrgInfoCard
