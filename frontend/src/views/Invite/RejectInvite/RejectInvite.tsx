import React from 'react'

interface IAuthorizedSession {
  orgName: string
}

const RejectedInvite: React.FC<IAuthorizedSession> = ({ orgName }) => (
  <div className="block rounded-lg shadow-lg bg-white max-w-sm font-inter">
    <div className="p-6">
      <p className="text-center mb-4">LedgerX.</p>
      <h3 className="text-xl text-center mb-4">You have rejected your invitation to {orgName}.</h3>
      <p className="text-xs text-center">You can close this page now</p>
    </div>
  </div>
)

export default RejectedInvite
