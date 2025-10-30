/* eslint-disable no-unneeded-ternary */
import Modal from '@/components/Modal'
import * as Yup from 'yup'
import React from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import NFTWaitlistFormModal from './NFTWaitlistFormModal'

interface INFTWaitlistModal {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  onSuccessSubmitWaitlist: () => void
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address') 
    .required('Email is required')   
    .trim()
})

const NFTWaitlistModal: React.FC<INFTWaitlistModal> = ({ setShowModal, showModal, onSuccessSubmitWaitlist }) => {
  const form = useForm({
    resolver: yupResolver(validationSchema)
  })

  const handleCloseWaitlistModal = () => {
    form.reset()
    setShowModal(false)
  }

  return (
    <Modal setShowModal={setShowModal} showModal={showModal}>
      <NFTWaitlistFormModal
        form={form}
        handleCloseWaitlistModal={handleCloseWaitlistModal}
        onSuccessSubmitWaitlist={onSuccessSubmitWaitlist}
      />
    </Modal>
  )
}
export default NFTWaitlistModal