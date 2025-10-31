import Modal from '@/components/Modal'
import Close from '@/assets/svg/Close.svg'
import TextField from '@/components/TextField/TextField'
import React, { useEffect, useState } from 'react'
import { IDeleteSourceModal } from './types'
import Image from 'next/legacy/image'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import Loader from '@/components/Loader/Loader'
import { useOrganizationId } from '@/utils/getOrganizationId'
import ReactTooltip from 'react-tooltip'
import { useDeleteWalletMutation } from '@/slice/wallets/wallet-api'
import { log } from '@/utils-v2/logger'
import { useRouter } from 'next/router'

const DeleteSourceModal: React.FC<IDeleteSourceModal> = ({
  title,
  showModal,
  disableEscPress,
  description,
  acceptText,
  option,
  declineText,
  type = 'normal',
  onClose,
  onAccept,
  setShowModal,
  onModalClose,
  walletSource,
  memberData
}) => {
  const organizationId = useOrganizationId()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [error, setError] = useState<string>()
  const [responseError, setResponseError] = useState<string>()
  const [showDeleteFundNotif, setShowDeleteFundNotif] = useState(true)
  const [deleteWallet, deleteWalletResult] = useDeleteWalletMutation()
  const router = useRouter()
  // delete the source of fund
  const handleDeleteSourceOfFund = () => {
    if (organizationId && walletSource.id) {
      deleteWallet({ orgId: organizationId, payload: { id: walletSource.id } })
    }
  }
  useEffect(() => {
    if (deleteWalletResult.isSuccess) {
      setShowSuccessModal(true)
      setShowDeleteFundNotif(false)
    }
    if (deleteWalletResult.isError) {
      setShowErrorModal(true)
      setShowDeleteFundNotif(false)
      setResponseError(deleteWalletResult.error.data.message)
      log.error(
        `${deleteWalletResult?.error?.status} API Error deleting wallet`,
        [` ${deleteWalletResult?.error?.status} API Error deleting wallet`],
        {
          actualErrorObject: deleteWalletResult?.error
        },
        `${window.location.pathname}`
      )
    }
  }, [deleteWalletResult])

  // close modal
  const handleCloseDeleteSourceModal = () => {
    setShowModal(false)
    router.push(`/${organizationId}/wallets`)
  }
  return (
    <Modal
      zIndex="z-50"
      isDisabledOuterClick
      setShowModal={setShowModal}
      showModal={showModal}
      disableESCPress={disableEscPress}
      onClose={onModalClose || onClose}
    >
      {showDeleteFundNotif && (
        <div className="w-[600px] rounded-2xl shadow-free-modal font-inter bg-white">
          {onAccept && (
            <div className="flex p-8 gap-8 border-b">
              {(type === 'error' && <img src="/svg/Caution.svg" alt="Caution" className="w-14 h-14" />) ||
                (type === 'success' && <img src="/svg/Success.svg" alt="Success" className="w-14 h-14" />)}
            </div>
          )}
          <div className="p-8 border-b flex items-start">
            <Image src="/svg/icons/round-warning.svg" width={85} height={85} />
            <div className="pl-6">
              <h1 className="font-semibold text-2xl text-dashboard-main whitespace-pre-line">{title}</h1>
              <p className="font-inter text-sm text-[#667085]">{description}</p>
            </div>
            <button
              type="button"
              onClick={handleCloseDeleteSourceModal}
              className="bg-[#F3F5F7] flex justify-center items-center p-[14px] rounded-full "
            >
              <Image src={Close} alt="close" height={14} width={14} />
            </button>
          </div>
          <div className="flex flex-col items-start p-8 gap-2 bg-white border-solid rounded-2xl border-grey-200 w-full">
            <div className="flex flex-col items-start w-full">
              <TextField errorClass="pt-2" placeholder={walletSource.name} label="Wallet Name" name="name" disabled />
            </div>
            <div className="flex flex-col items-start w-full mt-8">
              <TextField
                errorClass="pt-2"
                placeholder={walletSource.address}
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
                  onClick={handleCloseDeleteSourceModal}
                  disabled={deleteWalletResult.isLoading}
                >
                  {declineText || 'Back'}
                </button>
                <div className="w-full" data-tip="disabled-delete" data-for="disabled-delete">
                  <button
                    disabled={deleteWalletResult.isLoading || memberData?.data?.role !== 'Owner'}
                    type="button"
                    onClick={handleDeleteSourceOfFund}
                    className="relative w-full text-white text-base font-semibold font-inter bg-grey-900 hover:bg-grey-901 rounded-lg h-14 disabled:cursor-not-allowed disabled:opacity-50 flex grow justify-center items-center"
                  >
                    {deleteWalletResult.isLoading ? (
                      <span className="flex">
                        <Loader />
                        <span className="pl-4">{acceptText}</span>
                      </span>
                    ) : (
                      <p>{acceptText || 'Try Again'}</p>
                    )}
                  </button>
                  {memberData?.data?.role !== 'Owner' && (
                    <ReactTooltip
                      id="disabled-delete"
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
                onClick={handleCloseDeleteSourceModal}
                disabled={deleteWalletResult.isLoading}
              >
                {declineText || 'Back'}
              </button>
            )}
          </div>
        </div>
      )}

      {showSuccessModal && (
        <NotificationPopUp
          title={(error && 'error') || 'Successfully deleted wallet'}
          type="success"
          description={error}
          setShowModal={setShowSuccessModal}
          showModal={showSuccessModal}
          onClose={handleCloseDeleteSourceModal}
        />
      )}
      {showErrorModal && (
        <NotificationPopUp
          title="Unable to Edit Wallet"
          acceptText="Dismiss"
          description={responseError || 'There was an issue updating the wallet. Please try again.'}
          type="error"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => {
            setResponseError(undefined)
            handleCloseDeleteSourceModal()
          }}
        />
      )}
    </Modal>
  )
}

export default DeleteSourceModal
