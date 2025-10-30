import Modal from '@/components/Modal'
import Close from '@/assets/svg/Close.svg'
import React from 'react'

import Image from 'next/legacy/image'
import Loader from '@/components/Loader/Loader'

const ConfirmCurrencyModal = ({ showModal, onAccept, setShowModal, isLoading }) => {
  const handleCloseDeleteSourceModal = () => {
    // setShowModal(false)
    onAccept()
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }
  return (
    <Modal
      zIndex="z-50"
      isDisabledOuterClick
      setShowModal={setShowModal}
      showModal={showModal}
      disableESCPress={false}
      //   onClose={onClose}
    >
      <div className="w-[600px] rounded-2xl shadow-free-modal font-inter bg-white">
        {onAccept && (
          <div className="flex p-8 gap-8">
            <img src="/svg/Caution.svg" alt="Caution" className="w-14 h-14" />

            <div>
              <h1 className="font-semibold text-2xl text-dashboard-main whitespace-pre-line">
                Confirm Currency Change
              </h1>
              <div
                style={{ color: '#667085', fontWeight: 400 }}
                className="text-sm font-medium whitespace-pre-line mt-2"
              >
                {`If you continue to change your currency - Some functions may be temporarily unavailable while we are updating the currency. 
                There might be some changes to the data after the conversion.`}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 p-8 border-grey-200 border-t">
          <button
            type="button"
            className="min-w-[118px] text-dashboard-main font-semibold font-inter bg-neutral-100 hover:bg-[#edf1f5] rounded-lg h-14"
            onClick={handleCloseModal}
            disabled={isLoading}
          >
            Cancel
          </button>
          <div className="w-full" data-tip="disabled-delete" data-for="disabled-delete">
            <button
              //   disabled={isLoading || memberData?.data?.role !== 'Owner'}
              type="button"
              onClick={handleCloseDeleteSourceModal}
              className="relative w-full text-white text-base font-semibold font-inter bg-grey-900 hover:bg-grey-901 rounded-lg h-14 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader /> : <p>Change Currency</p>}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmCurrencyModal
