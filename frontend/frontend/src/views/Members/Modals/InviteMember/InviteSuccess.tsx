/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/components-v2/Button'
import CopyIcon from '@/assets/svg/copy.svg'
import { Typography } from '@/components-v2'
import { format } from 'date-fns'

interface ISuccesInviteProps {
  onClickInviteOther: () => void
  setShowModal: any
  isOpen: any
  inviteId: string
  credentialType: string
  credential: string
  name: string
  org: string
  host: string
  handleOnCloseModal: any
  expiresAt: string
}

const InviteSuccess: React.FC<ISuccesInviteProps> = ({
  setShowModal,
  onClickInviteOther,
  isOpen,
  handleOnCloseModal,
  inviteId,
  credentialType,
  credential,
  name,
  expiresAt,
  org,
  host
}) => {
  const handleCopyMessage = (e) => {
    e.stopPropagation()
    toast.success('Invite message copied', {
      position: 'top-right',
      pauseOnHover: false
    })
    const message = `Hey ${name}, \nYou've been invited to join ${org}.\nPlease click the invite link below and sign up with the following wallet/email.\nThis link will expire in 3 days. \n\nInvite Link: ${host}/invite/${inviteId}\nSign-up ${credentialType}: ${credential}`
    navigator.clipboard.writeText(message)
  }
  return (
    <div className=" w-[650px]  bg-white  rounded-3xl shadow-home-modal">
      <div className="p-8 font-inter">
        <div className="flex justify-between w-full items-center">
          <Typography className="font-[acid] mb-2" style={{ fontSize: 24, fontWeight: 500 }} variant="title1">
            New Invitation Created
          </Typography>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleOnCloseModal}
              className="bg-[#F3F5F7] p-3 rounded-full h-10 w-10 flex items-center justify-center"
            >
              <img src="/image/Close.png" alt="Close" className="w-3 h-3  " />
            </button>
          </div>
        </div>
        <div className="text-[#667085] text-sm leading-5 font-medium pr-12">
          Complete this invitation to your new team member by sending them the message below. Please note that this link
          will expire in 3 days for security reasons.
        </div>
      </div>
      <hr className="-mt-2" />

      <section id="modal-body" className="p-4 px-8 font-inter">
        <div className="flex flex-row items-center justify-between">
          <div>
            {' '}
            <p className="text-sm">Invitation Message</p>
          </div>
          {expiresAt && (
            <div className="flex flex-row items-center">
              <img src="/svg/icons/time-icon.svg" className="pr-2" alt="time" />
              <Typography variant="subtitle2">
                Valid until {format(new Date(expiresAt), "d LLL yyyy 'at' h:mm a")}
              </Typography>
            </div>
          )}
          {/* {expiresAt && <p className="text-xs">Valid till {format(new Date(expiresAt), "d LLL yyyy 'at' h:mm a")}</p>} */}
        </div>
        <div className="p-4 mt-2 text-sm" style={{ backgroundColor: '#FBFAFA', color: '#535251' }}>
          <div className="flex flex-row justify-between">
            <div>Hey {name},</div>
            <Button rightIcon={CopyIcon} variant="contained" color="white" onClick={handleCopyMessage} size="md">
              Copy
            </Button>
          </div>
          <br />
          You've been invited to join {org}. Please click the invite link below and sign up with the following
          wallet/email. This link will expire in 3 days.
          <br />
          <br />
          Invite Link: {host}/invite/{inviteId}
          <br />
          Sign-up {credentialType}: {credential}
        </div>
      </section>
      <hr className="" />
      <section id="modal-footer" className="flex flex-row font-inter p-6 gap-4 px-8">
        <Button size="xl" color="tertiary" onClick={handleOnCloseModal}>
          Close
        </Button>
        <Button size="xl" type="submit" onClick={onClickInviteOther} fullWidth>
          Invite Another Member
        </Button>
      </section>
    </div>
  )
}
export default InviteSuccess
