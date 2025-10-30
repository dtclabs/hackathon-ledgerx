import Modal from '@/components/Modal'
import React, { useEffect, useState } from 'react'
import Close from '@/assets/svg/Close.svg'
import { IEditSourceModal } from './types'
import Image from 'next/legacy/image'
import TextField from '@/components/TextField/TextField'
import { useForm } from 'react-hook-form'
import { IUpdateSource } from '@/slice/wallets/wallet-types'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Loader from '@/components/Loader/Loader'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import ReactTooltip from 'react-tooltip'
import { useUpdateWalletWithoutInvalidationMutation } from '@/slice/wallets/wallet-api'
import { toast } from 'react-toastify'
import { log } from '@/utils-v2/logger'
import { Severity } from '@sentry/nextjs'

const EditModal: React.FC<IEditSourceModal> = ({
  setShowEditModal,
  showEditModal,
  onEditModalClose,
  onClose,
  disableEscPress,
  title,
  description,
  type = 'normal',
  source,
  isLoading,
  // setIsLoading,
  setDisable,
  onAccept,
  option,
  acceptText,
  declineText,
  memberData
  // onSuccess
}) => {
  const organizationId = useOrganizationId()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [responseError, setResponseError] = useState<string>()
  const [showEditModalActions, setShowEditModalActions] = useState(true)

  const [editWallet, editWalletResult] = useUpdateWalletWithoutInvalidationMutation()
  // update source of fund details
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<IUpdateSource>({
    defaultValues: { name: source.name, disabled: source.disabled }
  })

  const submitUpdateSourceDetails = async (data: IUpdateSource) => {
    if (isSubmitting) {
      return
    }
    setDisable(true)
    await editWallet({
      orgId: organizationId,
      payload: { name: data.name, flagged: source.flaggedAt || false, walletGroupId: source.group.id },
      id: source.id
    })
    setDisable(false)
  }

  useEffect(() => {
    if (editWalletResult.isSuccess) {
      toast.success('Wallet edited')
      setShowEditModalActions(false)
      setShowEditModal(false)
      // onSuccess()
    }
    if (editWalletResult.isError) {
      setShowErrorModal(true)
      setShowEditModalActions(false)
      setResponseError(editWalletResult.error.data.message)
      log.error(
        `${editWalletResult?.error?.status} API Error editing wallet`,
        [`${editWalletResult?.error?.status} API Error editing wallet`],
        {
          actualErrorObject: JSON.stringify(editWalletResult?.error)
        },
        `${window.location.pathname}`
      )
    }
  }, [editWalletResult])

  // closing the modal
  const handleCloseEditModal = () => {
    setShowEditModal(false)
  }

  return (
    <Modal
      zIndex="z-50"
      isDisabledOuterClick
      setShowModal={setShowEditModal}
      showModal={showEditModal}
      disableESCPress={disableEscPress}
      onClose={onEditModalClose || onClose}
    >
      {showEditModalActions && (
        <div className="w-[600px] rounded-2xl shadow-free-modal font-inter bg-white">
          {onAccept && (
            <div className="flex p-8 gap-8 border-b">
              {(type === 'error' && <img src="/svg/Caution.svg" alt="Caution" className="w-14 h-14" />) ||
                (type === 'success' && <img src="/svg/Success.svg" alt="Success" className="w-14 h-14" />)}
            </div>
          )}

          <div className="p-8 border-b">
            <div className="flex justify-between items-center mb-2">
              <h1 className="font-semibold text-2xl text-dashboard-main whitespace-pre-line">{title}</h1>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="bg-[#F3F5F7] flex justify-center items-center p-[14px] rounded-full "
              >
                <Image src={Close} alt="close" height={12} width={12} />
              </button>
            </div>
            <div className="text-sm font-medium text-dashboard-sub whitespace-pre-line">{description}</div>
          </div>
          <form onSubmit={handleSubmit(submitUpdateSourceDetails)}>
            <div className="flex flex-col items-start p-8 gap-2 bg-white border-solid rounded-2xl border-grey-200 w-full">
              <div className="flex flex-col items-start w-full">
                <TextField
                  disabled={isSubmitting}
                  errorClass="pt-2"
                  placeholder={source.name}
                  label="Wallet Name"
                  name="name"
                  errors={errors}
                  control={control}
                  rules={{
                    required: { value: true, message: 'Wallet Name is required.' },
                    maxLength: {
                      value: 70,
                      message: 'Wallet name allows maximum of 70 characters.'
                    },
                    validate: (value: string) => value.trim().length !== 0 || 'Wallet Name is required.'
                  }}
                />
              </div>
              <div className="flex flex-col items-start w-full">
                <TextField
                  errorClass="pt-2"
                  placeholder={source.address}
                  label="Wallet Address"
                  name="address"
                  disabled
                />
              </div>
            </div>
            <div className="flex gap-2 p-8 border-grey-200 border-t">
              {option ? (
                <>
                  <button
                    type="button"
                    className="min-w-[118px] text-dashboard-main font-semibold font-inter bg-neutral-100 hover:bg-[#edf1f5] rounded-lg h-14"
                    onClick={handleCloseEditModal}
                    disabled={isSubmitting}
                  >
                    {declineText || 'Back'}
                  </button>
                  <div className="w-full" data-tip="disabled-edit" data-for="disabled-edit">
                    <button
                      disabled={isSubmitting || memberData?.data?.role !== 'Owner'}
                      type="submit"
                      onClick={onAccept}
                      className="relative w-full text-white text-base font-semibold font-inter bg-grey-900 hover:bg-grey-901 rounded-lg h-14 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? <Loader /> : <p>{acceptText || 'Try Again'}</p>}
                    </button>
                    {memberData?.data?.role !== 'Owner' && (
                      <ReactTooltip
                        id="disabled-edit"
                        borderColor="#eaeaec"
                        border
                        backgroundColor="white"
                        textColor="#111111"
                        effect="solid"
                        place="top"
                        className="!opacity-100 !rounded-lg"
                      >
                        Only owners can perform this action
                      </ReactTooltip>
                    )}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="bg-grey-900 rounded-[4px] text-white w-full py-4 font-semibold whitespace-nowrap disabled:opacity-80 hover:bg-grey-901"
                  onClick={handleCloseEditModal}
                  disabled={isSubmitting}
                >
                  {declineText || 'Back'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {showSuccessModal && (
        <NotificationPopUp
          title="Successfully Edited Source of Fund"
          type="success"
          setShowModal={setShowSuccessModal}
          showModal={showSuccessModal}
          onClose={handleCloseEditModal}
        />
      )}
      {showErrorModal && (
        <NotificationPopUp
          title="Unable to Edit Source of Fund"
          acceptText="Dismiss"
          description={responseError || 'There was an issue updating the source of fund. Please try again.'}
          type="error"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => {
            setResponseError(undefined)
            handleCloseEditModal()
          }}
        />
      )}
    </Modal>
  )
}

export default EditModal
