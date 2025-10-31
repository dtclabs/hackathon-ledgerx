import Image from 'next/legacy/image'
import React from 'react'
import Message from '@/public/svg/Message.svg'
import { Button } from '@/components-v2/Button'

interface IAuthorizedSession {
  orgName: string
  onReject: () => void
  onJoin: () => void
  message: string
  isLoading?: boolean
}

const AuthorizedSession: React.FC<IAuthorizedSession> = ({ orgName, onReject, onJoin, message, isLoading = false }) => (
  <div className="block rounded-lg shadow-lg bg-white max-w-[600px] font-inter">
    <div className="p-8">
      <p className="text-grey-800 text-2xl text-center mb-10 font-bold leading-6">LedgerX.</p>
      <h3 className="text-dashboard-main text-[32px] text-center font-semibold leading-[48px] mb-3">
        {orgName} has invited you to their team.
      </h3>

      <div className="flex items-center bg-grey-100 rounded-lg border border-blanca-300 py-3 px-4 mb-8">
        <Image src={Message} width={15} height={15} />
        <p
          style={{ display: 'inline-block', wordBreak: 'break-word' }}
          className="text-grey-800 text-sm leading-5 ml-2.5"
        >
          {message ?? 'Hi, please join our team.'}
        </p>
      </div>
      <p className="text-dashboard-main text-sm leading-5 text-center font-medium">
        You can use LedgerX to make transfers, receive payments and manage transactions.
      </p>
    </div>

    <hr />
    <div className="p-8 flex gap-4 flex-row">
      <Button size="xl" variant="outlined" color="danger" onClick={onReject} fullWidth disabled={isLoading}>
        Reject Invitation
      </Button>
      <Button size="xl" onClick={onJoin} fullWidth disabled={isLoading}>
        Join Organization
      </Button>
    </div>
  </div>
)

// <div>
//     <div className="p-8">
//       <Image src={logo} />
//       <div className="text-[#344054] font-semibold text-2xl leading-8 py-10">
//         You have been invited to join an organization
//       </div>
//       <div className="flex items-center gap-6">
//         <div className="rounded-full bg-[#D8E8F3] h-10 w-10 flex items-center justify-center">
//           {(organizationName && organizationName.slice(0, 1)) || '?'}
//         </div>
//         <div className="text-2xl leading-8 font-medium text-[#344054]">{organizationName}</div>
//       </div>
//     </div>
//     <div className="border-t p-8 flex gap-2 font-semibold text-base leading-6">
//       <button type="button" onClick={onReject} className="bg-[#F2F4F7] text-[#344054] rounded-lg w-1/2 py-4">
//         Reject Invitation
//       </button>
//       <button type="button" onClick={onJoin} className="bg-grey-900 text-white w-1/2 rounded-lg">
//         Join this Organization
//       </button>
//     </div>
//   </div>

export default AuthorizedSession
