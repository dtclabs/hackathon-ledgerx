import React from 'react'
import Modal from '../Modal'

interface INotificationSending {
  showModal: boolean
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  subTitle: string
}

const NotificationSending: React.FC<INotificationSending> = ({ setShowModal, showModal, subTitle, title }) => (
  <Modal showModal={showModal} setShowModal={setShowModal}>
    <div className="bg-white rounded-2xl p-8 flex items-center gap-8">
      <div className="p-4 rounded-full bg-dashboard-background">
        <img src="/svg/Loading02.svg" alt="sending" className="h-6 w-auto animate-spin-slow" />
      </div>
      <div>
        <div className="text-2xl font-semibold mb-2">{title}</div>
        <div className="text-sm font-medium text-dashboard-sub">{subTitle}</div>
      </div>
    </div>
  </Modal>
)

export default NotificationSending
