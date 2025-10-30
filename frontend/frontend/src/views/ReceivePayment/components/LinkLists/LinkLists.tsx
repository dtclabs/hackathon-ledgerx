import { useDeletePaymentLinkMutation } from '@/api-v2/payment-link-api'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toShort } from '@/utils/toShort'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { ILink } from '../../ReceivePayment'
import LinkItem from './LinkItem'
import { useAppSelector } from '@/state'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'

interface ILinkLists {
  linkList: ILink[]
  setFormShow: React.Dispatch<React.SetStateAction<boolean>>
}

const LinkLists: React.FC<ILinkLists> = ({ linkList, setFormShow }) => {
  const [deletePaymentLink, deletePaymentLinkResult] = useDeletePaymentLinkMutation()
  const organizationId = useOrganizationId()
  const showBanner = useAppSelector(showBannerSelector)

  const [showModal, setShowModal] = useState(false)
  const [link, setLink] = useState<ILink>()
  const handleCreateAgain = () => {
    setFormShow(true)
  }
  const handleAccept = async () => {
    await deletePaymentLink({
      orgId: organizationId,
      payload: {
        id: link.id
      }
    })
    setShowModal(false)
  }
  const handleDecline = () => {
    setShowModal(false)
  }

  return (
    <>
      <div className="w-[calc(100%-450px)] p-8 font-inter text-sm leading-5">
        <Typography variant="body1" color="primary" classNames="mb-4" styleVariant="semibold">
          Your Payment Links
        </Typography>
        <div
          className={`${
            showBanner ? 'max-h-[calc(100vh-494px)]' : 'max-h-[calc(100vh-426px)]'
          } overflow-auto scrollbar`}
        >
          {linkList?.map((item) => (
            <LinkItem key={item.id} link={item} setShowModal={setShowModal} setLink={setLink} />
          ))}
        </div>
        <Button variant="black" onClick={handleCreateAgain} classNames="mt-6" label="Create Another Link" height={40} />
      </div>
      {showModal && (
        <NotificationPopUp
          title="Warning"
          type="custom"
          image="/svg/warningBig.svg"
          description={`You are deleting ${toShort(link.link, 32, 0)}. This action cannot be undone.`}
          option
          setShowModal={setShowModal}
          showModal={showModal}
          acceptText="Yes, delete"
          declineText="No, don’t delete"
          onClose={handleDecline}
          onAccept={handleAccept}
        />
      )}
    </>
  )
}

export default LinkLists
