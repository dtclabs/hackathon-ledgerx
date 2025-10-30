import React, { useState, useEffect } from 'react'
import { logEvent } from '@/utils/logEvent'
import { useRouter } from 'next/dist/client/router'
import { toast } from 'react-toastify'

import { useLazyGetUserOrgAccountQuery } from '@/api-v2/account-api'
import { useCreateOrganizationMutation } from '@/slice/organization/organization.api'

import Modal from '@/components/Modal'
import LoadingOverlay from '@/components/InProcessToast/InProcessToast'
import CreateOrgCard, { ICreateOrgForm } from '@/views/Organization/components/CreateOrgCard'
import { useAppDispatch } from '@/state'
import { addOrg } from '@/slice/account/account-slice'

export enum EProcessStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
  REJECTED = 'Rejected'
}

interface ICreateOrganizationModal {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  setError?: (error: string) => void
  setStatus?: (status: EProcessStatus) => void
  status?: EProcessStatus
}

const CreateOrganizationModal: React.FC<ICreateOrganizationModal> = ({
  setShowModal,
  showModal,
  setError,
  setStatus,
  status
}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [triggerCreateOrganization, createOrganizationResponse] = useCreateOrganizationMutation()
  const [triggerRefetch] = useLazyGetUserOrgAccountQuery()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === EProcessStatus.FAILED) {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (createOrganizationResponse.isSuccess) {
      // update Redux state manually
      dispatch(
        addOrg({
          id: createOrganizationResponse?.data?.data?.publicId,
          name: createOrganizationResponse?.data?.data?.name,
          type: createOrganizationResponse?.data?.data?.type
        })
      )
      triggerRefetch({ orgId: `${router.query.organizationId}` }) // TODO - Check if need to refetch here as we redirect
      logEvent({
        event: 'create_organisation_in_app',
        payload: {
          event_category: 'Full app',
          event_label: '',
          value: 1
        }
      })
      setShowModal(false)
      setStatus(EProcessStatus.PENDING)
      router.push(`/${createOrganizationResponse?.data?.data?.publicId}/dashboard?welcome=true`)
    } else if (createOrganizationResponse.isError) {
      setError('There was an error creating the organisation')
      if (createOrganizationResponse?.error?.status === 404) {
        toast.error('There was an error creating the organisation')
      } else if (createOrganizationResponse?.error?.status === 400) {
        toast.error(createOrganizationResponse?.error?.data?.message)
      } else {
        toast.error('There was an error creating the organisation')
      }
    }
  }, [createOrganizationResponse])

  const onClickCreateOrg = async (_data: ICreateOrgForm) => {
    if (_data.contacts.length > 0) {
      triggerCreateOrganization({
        name: _data?.name,
        type: _data?.type,
        contacts: _data?.contacts.filter((contact) => contact.content !== ''),
        jobTitle: _data.role.value
      })
    }
  }

  return (
    <Modal showModal={showModal} setShowModal={setShowModal} zIndex="z-[1000]">
      {createOrganizationResponse.isLoading && <LoadingOverlay title="Loading" />}

      <CreateOrgCard
        onClickSubmit={onClickCreateOrg}
        width="w-fit"
        className="p-10 m-0"
        title="Create an Organisation"
        nonSubtitle
        onBack={() => {
          setShowModal(false)
        }}
        renderBackBtn
      />
    </Modal>
  )
}

export default CreateOrganizationModal
