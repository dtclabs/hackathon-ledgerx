import Modal from '@/components/Modal'
import React from 'react'
import Loader from '@/components/Loader/Loader'

const ConfirmModal = ({ showModal, onAccept, setShowModal, isLoading, title, subTitle }) => {
  const handleCloseModal = () => {
    setShowModal(false)
  }
  return (
    <Modal zIndex="z-50" isDisabledOuterClick setShowModal={setShowModal} showModal={showModal} disableESCPress={false}>
      <div className="w-[600px] rounded-2xl shadow-free-modal font-inter bg-white">
        {onAccept && (
          <div className="flex p-8 gap-8">
            <img src="/svg/Caution.svg" alt="Caution" className="w-14 h-14" />
            <div>
              {title && (
                <h1 className="font-semibold text-2xl leading-8 text-dashboard-main whitespace-pre-line">{title}</h1>
              )}
              {subTitle && (
                <div
                  style={{ color: '#667085', fontWeight: 400 }}
                  className="text-sm font-medium leading-[18px] whitespace-pre-line mt-2"
                >
                  {subTitle}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 p-8 border-grey-200 border-t">
          <button
            type="button"
            className="flex-1 text-dashboard-main font-semibold font-inter bg-neutral-100 hover:bg-[#edf1f5] rounded-lg h-14"
            onClick={handleCloseModal}
            disabled={isLoading}
          >
            No, Don’t Save
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 text-white text-base font-semibold font-inter bg-grey-900 hover:bg-grey-901 rounded-lg h-14 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <Loader /> : <p>Yes, Save</p>}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
