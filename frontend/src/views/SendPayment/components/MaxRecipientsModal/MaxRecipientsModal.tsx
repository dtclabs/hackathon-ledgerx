import React from 'react'
import Modal from '@/components/Modal'

export interface IMaxRecipientsModal {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  error?: string
  setError?: (error: string) => void
}

const MaxRecipientsModal: React.FC<IMaxRecipientsModal> = ({ showModal, setShowModal, error, setError }) => (
  <Modal showModal={showModal} setShowModal={setShowModal}>
    <div className=" w-[600px] max-w-2xl rounded-[24px]  text-center bg-white">
      <div className="p-8 border-b ">
        <div className="flex justify-center mb-6 ">
          <img src="/svg/TransactionError.svg" alt="ErrorSafe" />
        </div>
        <div>
          <div className="mb-1 text-2xl text-black-0 font-supply uppercase leading-8">
            You’ve reached the maximum number of recipients on the free version
          </div>
          <div className="text-[#787878]  font-inter text-base leading-5  whitespace-pre-line">{error}</div>
        </div>
      </div>
      <div className="m-8 flex gap-4">
        <button
          onClick={() => {
            setError('')
            setShowModal(false)
          }}
          type="button"
          className=" py-4  w-1/4 rounded-lg text-base font-semibold hover:bg-gray-300 text-black-0 font-inter bg-remove-icon"
        >
          Cancel
        </button>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://ledgerx.com"
          className=" py-4 w-3/4 rounded-lg text-base font-semibold hover:bg-grey-901 text-white font-inter bg-grey-900"
        >
          Learn more
        </a>
      </div>
    </div>
  </Modal>
)

export default MaxRecipientsModal
