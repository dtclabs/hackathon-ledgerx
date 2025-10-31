/* eslint-disable no-unneeded-ternary */
import Modal from '@/components/Modal'
import * as Yup from 'yup'
import React, { useEffect, useRef, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'

import { useForm , useWatch } from 'react-hook-form'
import { useCreateSingleInvitationMutation } from '@/api-v2/invitation-api'
import { toast } from 'react-toastify'
import InviteMember from './InviteMember'
import InviteSuccess from './InviteSuccess'

interface ICreateTeamModal<T> {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  isSubmit?: boolean
  fullWidth?: boolean
  host: string
  role: 'Owner' | 'Admin'
}

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').trim(),
  lastName: Yup.string().required('Last name is required').trim(),
  role: Yup.object().shape({
    label: Yup.string().required('Role is required'),
    value: Yup.string().required('Role is required')
  }),
  loginType: Yup.object({
    value: Yup.string().required('Login credential required'),
    label: Yup.string().required('Login credential required')
  }),
  credential: Yup.string().required('Login credential required').trim(),
  message: Yup.string()
})

const InviteMemberModal: React.FC<ICreateTeamModal<any>> = ({ setShowModal, showModal, host, role }) => {
  const userName = useRef(null)
  const orgName = useRef(null)
  const [successInvite, setSuccessInvite] = useState(false)
  const [error, setError] = useState<string>()
  const [invitedCredential, setInvitedCredential] = useState('')
  const form = useForm({
    resolver: yupResolver(validationSchema)
  })
  const {control} = form 
  const credentialValue = useWatch({ control, name: 'credential' })
  const [singleInviteApi, singleInviteApiResult] = useCreateSingleInvitationMutation()

  useEffect(() => {
    if (singleInviteApiResult?.error?.status === 400) {
      setShowModal(true)
      setError(singleInviteApiResult?.error?.data?.message)
    } else if (singleInviteApiResult.isError) {
      setShowModal(true)
      setError(singleInviteApiResult?.error?.data?.message)
    } else if (singleInviteApiResult.isSuccess) {
      form.reset()
      userName.current = `${singleInviteApiResult.data?.data?.firstName ?? '-'} ${
        singleInviteApiResult.data?.data?.lastName ?? ''
      }`
      orgName.current = singleInviteApiResult.data?.data?.organization?.name
      setSuccessInvite(true)
      toast.success('Member has been invited!', {
        position: 'top-right',
        pauseOnHover: false
      })
    }
  }, [singleInviteApiResult])

  const handleSubmit = async (data: any) => {
    await singleInviteApi(data)
  }

  const onClickInviteOther = () => {
    form.reset()
    userName.current = null
    orgName.current = null
    singleInviteApiResult.reset()
    setSuccessInvite(false)
  }

  const handleOnCloseModal = () => {
    form.reset()
    userName.current = null
    orgName.current = null
    singleInviteApiResult.reset()
    setSuccessInvite(false)
    setShowModal(false)
  }

  const isEmail = singleInviteApiResult?.data?.data?.email ? true : false
  const credentialType = isEmail ? 'E-mail' : 'Wallet'
  const credential = isEmail ? singleInviteApiResult?.data?.data?.email : singleInviteApiResult?.data?.data?.address
  useEffect(()=>{
    setError(undefined)
  },[credentialValue])
  return (
    <Modal setShowModal={setShowModal} showModal={showModal}>
        {successInvite ? (
          <InviteSuccess
            onClickInviteOther={onClickInviteOther}
            isOpen={showModal}
            setShowModal={setShowModal}
            credential={credential}
            credentialType={credentialType}
            inviteId={singleInviteApiResult?.data?.data?.publicId}
            name={userName.current}
            org={orgName.current}
            host={host}
            handleOnCloseModal={handleOnCloseModal}
            expiresAt={singleInviteApiResult?.data?.data?.expiredAt}
          />
        ) : (
          <InviteMember
            isError={singleInviteApiResult?.isError}
            isSuccess={singleInviteApiResult?.isSuccess}
            isLoading={singleInviteApiResult.isLoading}
            serverError={singleInviteApiResult?.error?.data}
            onSubmit={handleSubmit}
            form={form}
            apiError={error}
            role={role}
            handleOnCloseModal={handleOnCloseModal}
            setInvitedCredential={setInvitedCredential}
          />
        )}
      </Modal>
  )
}
export default InviteMemberModal
