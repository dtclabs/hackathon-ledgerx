import Modal from '@/components/Modal'
import Image from 'next/legacy/image'
import React, { useEffect, useState } from 'react'
import { IFlagWalletModal } from './types'
import Close from '@/assets/svg/Close.svg'
import TextField from '@/components/TextField/TextField'
import { useOrganizationId } from '@/utils/getOrganizationId'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import Loader from '@/components/Loader/Loader'
import ReactTooltip from 'react-tooltip'
import { useUpdateWalletMutation } from '@/slice/wallets/wallet-api'
import { toast } from 'react-toastify'
import { log } from '@/utils-v2/logger'

const FlagWalletModal: React.FC<IFlagWalletModal> = ({
  setShowFlagWalletModal,
  showFlagWalletModal,
  onFlagWalletModalClose,
  onClose,
  disableEscPress,
  title,
  description,
  walletSource,
  type = 'normal',
  memberData
}) => {
  const organizationId = useOrganizationId()
  const [showFlagAction, setShowFlagAction] = useState(true)
  const [showSuccessFlag, setShowSuccessFlag] = useState(false)
  const [showErrorFlag, setShowErrorFlag] = useState(false)
  const [showErrorUnflag, setShowErrorUnflag] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // update source of fund details
  const [editWallet, editWalletResult] = useUpdateWalletMutation()

  const handleFlagSource = () => {
    if (organizationId && walletSource.id) {
      editWallet({
        orgId: organizationId,
        payload: { name: walletSource.name, flagged: true, walletGroupId: walletSource.group.id },
        id: walletSource.id
      })
    }
  }
  const unflagSource = () => {
    if (organizationId && walletSource.id) {
      editWallet({
        orgId: organizationId,
        payload: { name: walletSource.name, flagged: false, walletGroupId: walletSource.group.id },
        id: walletSource.id
      })
    }
  }
  useEffect(() => {
    if (editWalletResult.isSuccess) {
      toast.success(`${walletSource.flaggedAt ? 'Wallet Unflagged' : 'Wallet Flagged'}`)
      setShowFlagWalletModal(false)
      setShowFlagAction(false)
    }
    if (editWalletResult.isError) {
      setShowErrorFlag(true)
      setShowErrorUnflag(true)
      setShowFlagAction(false)
      log.error(
        `${editWalletResult?.error?.status} API Error on flagging wallet`,
        [`${editWalletResult?.error?.status} API Error on flagging wallet`],
        {
          actualErrorObject: editWalletResult?.error
        },
        `${window.location.pathname}`
      )
    }
  }, [editWalletResult])

  // closing the modal
  const handleCloseFlagWalletModal = () => {
    setShowFlagWalletModal(false)
  }

  return (
    <Modal
      zIndex="z-50"
      isDisabledOuterClick
      setShowModal={setShowFlagWalletModal}
      showModal={showFlagWalletModal}
      disableESCPress={disableEscPress}
      onClose={onFlagWalletModalClose || onClose}
    >
      {showFlagAction && (
        <div className="w-[600px] rounded-2xl shadow-free-modal font-inter bg-white">
          <div className="p-8 border-b">
            <div className="flex justify-between items-center mb-2">
              <h1 className="font-semibold text-2xl text-dashboard-main whitespace-pre-line">{title}</h1>
              <button
                type="button"
                onClick={handleCloseFlagWalletModal}
                className="bg-[#F3F5F7] flex justify-center items-center p-[14px] rounded-full "
              >
                <Image src={Close} alt="close" height={12} width={12} />
              </button>
            </div>
            <div className="text-sm font-medium text-dashboard-sub whitespace-pre-line">{description}</div>
          </div>
          <div className="flex flex-col justify-between p-8 gap-4 ">
            <div className="flex flex-col items-start w-full">
              <TextField
                errorClass="pt-2"
                placeholder={walletSource.name}
                label="Wallet Name"
                name="name"
                // control={control}
                disabled
              />
            </div>
            <div className="flex flex-col items-start w-full">
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
            {!walletSource.flaggedAt ? (
              <>
                {' '}
                <button
                  type="button"
                  className="min-w-[118px] text-dashboard-main font-semibold font-inter bg-neutral-100 hover:bg-[#edf1f5] rounded-lg h-14"
                  onClick={handleCloseFlagWalletModal}
                >
                  Back
                </button>
                <div className="w-full" data-tip="disabled-flag" data-for="disabled-flag">
                  <button
                    type="button"
                    onClick={handleFlagSource}
                    disabled={memberData?.data?.role !== 'Owner'}
                    className="relative w-full text-white text-base font-semibold font-inter bg-grey-900 hover:bg-grey-901 rounded-lg h-14 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? <Loader /> : <div className="pr-2">Flag Wallet</div>}
                  </button>
                  {memberData?.data?.role !== 'Owner' && (
                    <ReactTooltip
                      id="disabled-flag"
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
              <div className="w-full" data-tip="disabled-unflag" data-for="disabled-unflag">
                <button
                  type="button"
                  className="bg-grey-900 rounded-[4px] text-white w-full py-4 font-semibold whitespace-nowrap disabled:opacity-80 hover:bg-grey-901 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={unflagSource}
                  disabled={memberData?.data?.role !== 'Owner'}
                >
                  Unflag Wallet
                </button>
                {memberData?.data?.role !== 'Owner' && (
                  <ReactTooltip
                    id="disabled-unflag"
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
            )}
          </div>
        </div>
      )}

      {showSuccessFlag && (
        <NotificationPopUp
          title={walletSource.disabled ? 'Successfully Unflag Source of Fund' : 'Successfully Flag Source of Fund'}
          type="success"
          setShowModal={setShowSuccessFlag}
          showModal={showSuccessFlag}
          onClose={handleCloseFlagWalletModal}
        />
      )}

      {showErrorFlag && (
        <NotificationPopUp
          title="Unable to Flag Source of Fund"
          acceptText="Dismiss"
          description="There was an issue updating the source of fund. Please try again."
          type="error"
          setShowModal={setShowErrorUnflag}
          showModal={showErrorUnflag}
          onClose={handleCloseFlagWalletModal}
        />
      )}
      {showErrorUnflag && (
        <NotificationPopUp
          title="Unable to Unflag Source of Fund"
          acceptText="Dismiss"
          description="There was an issue updating the source of fund. Please try again."
          type="error"
          setShowModal={setShowErrorUnflag}
          showModal={showErrorUnflag}
          onClose={handleCloseFlagWalletModal}
        />
      )}
    </Modal>
  )
}
export default FlagWalletModal
