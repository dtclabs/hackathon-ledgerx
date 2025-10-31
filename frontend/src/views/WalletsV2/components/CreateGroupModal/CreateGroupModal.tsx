import { usePostWalletGroupMutation, useUpdateWalletGroupMutation } from '@/api-v2/wallet-group-api'
import { Button } from '@/components-v2'
import Typography from '@/components-v2/atoms/Typography'
import Modal from '@/components/Modal'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import TextField from '@/components/TextField/TextField'
import { log } from '@/utils-v2/logger'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { Severity } from '@sentry/nextjs'
import Image from 'next/legacy/image'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

interface ICreateGroup {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  selectedGroup?: any
  action: string
  groups: any
}

const CreateGroupModal: React.FC<ICreateGroup> = ({ setShowModal, showModal, selectedGroup, action, groups }) => {
  const [postWalletGroup, postWalletGroupResult] = usePostWalletGroupMutation()
  const [updateWalletGroup, updateWalletGroupResult] = useUpdateWalletGroupMutation()
  const organizationId = useOrganizationId()

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [disable, setDisable] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { name: '' } })

  useEffect(() => {
    if (selectedGroup) reset({ name: selectedGroup.name })
    if (showModal && !selectedGroup) reset({ name: '' })
  }, [reset, selectedGroup, showModal])

  useEffect(() => {
    if (postWalletGroupResult.isSuccess || updateWalletGroupResult.isSuccess) {
      toast.success(`Wallet group ${action === 'Create' ? 'created' : 'edited'}`)
      setShowModal(false)
    }
    if (postWalletGroupResult.isError || updateWalletGroupResult.isError) {
      setShowErrorModal(true)
      setErrorMessage(postWalletGroupResult?.error?.data?.message)
      setShowModal(false)
      log.error(
        postWalletGroupResult?.error?.data?.message ??
          `${postWalletGroupResult?.error?.status} API Error when adding a new wallet group`,
        [`${postWalletGroupResult?.error?.status} API Error when adding a new wallet group`],
        {
          actualErrorObject: postWalletGroupResult?.error
        },
        `${window.location.pathname}`
      )
    }
  }, [postWalletGroupResult, updateWalletGroupResult])

  const onSubmit = (data) => {
    if (selectedGroup) {
      updateWalletGroup({
        orgId: organizationId,
        payload: {
          name: data.name
        },
        id: selectedGroup.id
      })
    } else {
      postWalletGroup({
        orgId: organizationId,
        payload: {
          name: data.name
        }
      })
    }
  }

  const handleClose = () => {
    if (disable) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }

  const checkWalletGroupNames = (_value) => {
    const groupExists = groups.find((group) => group.name.toLowerCase().trim() === _value.toLowerCase().trim())
    if (selectedGroup && _value.toLowerCase().trim() === selectedGroup.name.toLowerCase().trim()) {
      return true
    }
    if (groupExists) {
      return 'Wallet group with same name already exists'
    }
    return true
  }

  return (
    <>
      <Modal setShowModal={setShowModal} showModal={showModal}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full font-inter max-w-[650px] bg-white shadow-home-modal rounded-3xl"
        >
          <div className="p-8 border-b">
            <div className="flex justify-between items-center">
              <Typography classNames="!text-[#344054]" variant="heading2" styleVariant="semibold">
                {selectedGroup ? 'Edit Wallet Group' : 'Create Wallet Group'}
              </Typography>
              <button
                disabled={disable}
                type="button"
                onClick={handleClose}
                className="bg-[#F3F5F7] flex justify-center items-center p-[14px] rounded-full "
              >
                <Image src="/image/Close.png" alt="Close" width={12} height={12} />
              </button>
            </div>
          </div>
          <div className="p-8 border-b">
            <TextField
              errorClass="pt-2"
              disabled={isSubmitting}
              errors={errors}
              required
              placeholder="Group Name"
              label="Group Name*"
              name="name"
              control={control}
              rules={{
                required: { value: true, message: 'Group mame is required.' },
                validate: {
                  nameExists: checkWalletGroupNames
                }
              }}
            />
          </div>
          <div className="flex items-center gap-4 p-8">
            <Button size="lg" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" size="lg" fullWidth>
              {selectedGroup ? 'Save Changes' : 'Create Wallet Group'}
            </Button>
          </div>
        </form>
      </Modal>
      {showSuccessModal && (
        <NotificationPopUp
          title={`Successfully ${action === 'Create' ? 'created' : 'edited'} wallet group`}
          description="You may now tag your transactions and view your balances. Please note that synchronizing your transactions for the first-time could take a few minutes."
          type="success"
          setShowModal={setShowSuccessModal}
          showModal={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
          }}
        />
      )}

      <NotificationPopUp
        acceptText="Dismiss"
        title={errorMessage.includes('exists') ? 'Wallet Group Name Already Exists' : 'Unable to Add Wallet Group'}
        description={
          errorMessage.includes('exists')
            ? 'This wallet group name has already been added. Please try adding another wallet group or edit the existing wallet group details.'
            : errorMessage
        }
        type="error"
        setShowModal={setShowErrorModal}
        showModal={showErrorModal}
        onClose={() => {
          setShowErrorModal(false)
        }}
      />
    </>
  )
}

export default CreateGroupModal
