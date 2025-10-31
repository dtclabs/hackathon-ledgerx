/* eslint-disable no-unneeded-ternary */
import React, { ReactNode } from 'react'
import Modal from '../Modal'
import Close from '@/assets/svg/Close.svg'
import Image from 'next/legacy/image'
import Loader from '../Loader/Loader'

interface INotificationPopUp {
  type?: 'success' | 'error' | 'normal' | 'custom'
  setShowModal?: (showModal: boolean) => void
  showModal: boolean
  onClose?: () => void
  onAccept?: any
  title?: string
  description?: string | ReactNode
  declineText?: string
  acceptText?: string
  option?: boolean
  onModalClose?: () => void
  close?: boolean
  boldText?: string
  firstText?: string
  lastText?: string
  image?: string
  loading?: boolean
  disableESCPress?: boolean
  width?: string
}

const NotificationPopUp: React.FC<INotificationPopUp> = ({
  title,
  showModal,
  disableESCPress,
  description,
  acceptText,
  option,
  declineText,
  type = 'normal',
  onClose,
  onAccept,
  setShowModal,
  onModalClose,
  close = false,
  boldText,
  firstText,
  lastText,
  image,
  loading,
  width
}) => (
  <Modal
    zIndex="z-50"
    isDisabledOuterClick
    setShowModal={setShowModal}
    showModal={showModal}
    disableESCPress={disableESCPress}
    onClose={onModalClose || onClose}
  >
    <div className={`${width ? width : 'w-[600px]'} rounded-2xl shadow-free-modal font-inter bg-white`}>
      <div className="flex items-center p-8 gap-8 border-b">
        {(type === 'error' && <img src="/svg/Caution.svg" alt="Caution" className="w-14 h-14" />) ||
          (type === 'success' && <img src="/svg/Success.svg" alt="Success" className="w-14 h-14" />) ||
          (type === 'custom' && <img src={image} alt="Incoming" className="w-14 h-14" />)}
        <div className="">
          <h1 className="font-semibold text-2xl text-dashboard-main capitalize">{title}</h1>
          <p
            className={`text-sm font-medium text-neutral-900 whitespace-pre-line ${description ? 'visible' : 'hidden'}`}
          >
            {description}
          </p>
          <p className={`${firstText || lastText ? 'visible' : 'hidden'}`}>
            {firstText}
            <b className={`${boldText ? 'visible' : 'hidden'}`}>{boldText}</b>
            {lastText}
          </p>
        </div>
        {close && (
          <div>
            <button
              type="button"
              onClick={() => setShowModal(!showModal)}
              className="flex items-center justify-center rounded-full h-8 w-8 bg-gray-1200"
            >
              <Image src={Close} alt="close" height={12} width={12} />
            </button>
          </div>
        )}
      </div>
      <div className="p-8 flex items-center justify-between gap-2">
        {option ? (
          <>
            <button
              onClick={onClose}
              type="button"
              disabled={loading}
              className="bg-neutral-100 px-8 rounded-[4px] text-dashboard-main py-4 font-semibold whitespace-nowrap hover:bg-gray-200"
            >
              {declineText || 'Close'}
            </button>
            <button
              onClick={onAccept}
              type="button"
              disabled={!onAccept || loading}
              className="bg-grey-900 rounded-[4px] hover:bg-grey-901 text-white w-full py-4 font-semibold whitespace-nowrap flex items-center gap-4 justify-center disabled:opacity-60"
            >
              {acceptText || 'Retry'}
              {loading && <Loader />}
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            className="bg-grey-900 rounded-[4px] text-white w-full py-4 font-semibold whitespace-nowrap disabled:opacity-80 hover:bg-grey-901"
          >
            {acceptText || 'Close'}
          </button>
        )}
      </div>
    </div>
  </Modal>
)

export default NotificationPopUp
