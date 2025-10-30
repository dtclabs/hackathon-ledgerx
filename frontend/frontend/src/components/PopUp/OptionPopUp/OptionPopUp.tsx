import React from 'react'
import Modal from '@/components/Modal'

interface IOptionPopUp {
  onConfirm: (data?: any) => void
  onCancel?: (data?: any) => void
  description?: string
  showModal: boolean
  setShowModal: (showModal: boolean) => void
}

const OptionPopUp: React.FC<IOptionPopUp> = ({ onConfirm, setShowModal, showModal, onCancel, description }) => {
  const handleCancle = () => {
    setShowModal(false)
    if (onCancel) {
      onCancel()
    }
  }
  const handleConfirm = () => {
    setShowModal(false)
    onConfirm()
  }
  return (
    showModal && (
      <Modal setShowModal={setShowModal} showModal={showModal}>
        <div className="min-w-[300px] max-w-[500px] bg-white rounded-lg border border-gray-300 p-6">
          <p className="text-center text-lg text-gray-900 mb-2">Are You Sure ?</p>
          {description && <p className="text-center font-inter text-gray-300">{description}</p>}
          <div className="flex justify-between items-center mt-6">
            <button
              className="bg-white border border-primary-blue rounded-lg px-3 py-2 text-primary-blue"
              type="button"
              onClick={handleCancle}
            >
              Cancel
            </button>
            <button
              className=" border bg-primary-blue rounded-lg px-3 py-2 text-white"
              type="button"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    )
  )
}

export default OptionPopUp
