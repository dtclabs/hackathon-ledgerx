/* eslint-disable react/no-unescaped-entities */
import { FC } from 'react'
import Image from 'next/legacy/image'
import Modal from '@/components/Modal'
import { Button } from '@/components-v2/Button'
import Warning from '@/public/svg/warningBig.svg'
import { Typography } from '@/components-v2'

interface IConfirmCancelModal {
  setShowModal: any
  isOpen: any
  onClickCancel: any
  onClickConfirm: any
  isLoading?: any
  title?: string
  description?: string
  cancelBtnText?: string
  confirmBtnText?: string
}
// TODO - Use Composite pattern to make more flexible
const ConfirmCancelModal: FC<IConfirmCancelModal> = ({
  setShowModal,
  isOpen,
  onClickConfirm,
  isLoading,
  title,
  description,
  cancelBtnText,
  confirmBtnText
}) => (
  <Modal setShowModal={setShowModal} showModal={isOpen}>
    <div className="w-[600px]  bg-white  rounded-3xl shadow-home-modal">
      <div className="flex flex-row p-6 -mt-4">
        <div className="w-[80px] flex items-center mt-4">
          <Image src={Warning} alt="warning" width={56} height={56} />
        </div>

        <div className="pl-6 mt-4">
          <Typography variant="title1">{title}</Typography>
          <Typography className="mt-2" variant="subtitle3" color="secondary">
            {description}
          </Typography>
        </div>
      </div>
      <hr />
      <div className="flex flex-row gap-4 p-8">
        <Button size="xl" disabled={isLoading} fullWidth onClick={() => setShowModal(false)} color="tertiary">
          {cancelBtnText || "No, don't cancel"}
        </Button>
        <Button size="xl" disabled={isLoading} fullWidth onClick={onClickConfirm}>
          {confirmBtnText || 'Yes, cancel'}
        </Button>
      </div>
    </div>
  </Modal>
)

export default ConfirmCancelModal
