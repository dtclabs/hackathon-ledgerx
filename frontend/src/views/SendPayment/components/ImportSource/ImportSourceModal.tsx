import React, { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useForm, useWatch } from 'react-hook-form'
import { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { isAddress } from 'ethers/lib/utils'
import _ from 'lodash'
import Image from 'next/legacy/image'
import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import Modal from '@/components/Modal'
import SuccessPopUp from '@/components/PopUp/SuccessPopUp/SuccessPopUp'
import WalletAddress from '@/components/WalletAddress/WalletAddress'
import ErrorPopUp from '@/components/PopUp/ErrorPopUp/ErrorPopUp'
import Close from '@/assets/svg/Close.svg'
import { Alert } from '@/components/Alert'
import { captureException as sentryCaptureException, captureMessage as sentryCaptureMessage } from '@sentry/nextjs'

interface IImportSourceModal {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
  onConfirm: (safe: SafeInfoResponse) => Promise<void>
  sourceList: string[]
  availableSourceList: string[]
  safeError: string
  setSafeError: React.Dispatch<React.SetStateAction<string>>
}

const ImportSourceModal: React.FC<IImportSourceModal> = ({
  showModal,
  setShowModal,
  onConfirm,
  sourceList,
  availableSourceList,
  safeError,
  setSafeError
}) => {
  const { account } = useWeb3React()
  const safeService = useSafeServiceClient()
  const [safeInfo, setSafeInfo] = useState<SafeInfoResponse | null>(null)
  const [step, setStep] = useState(1)
  const [selectedSource, setSelectedSource] = useState<string | null>()
  const [isShowModal, setIsShowModal] = useState(false)
  const [isShowModalError, setIsShowModalError] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors }
  } = useForm<{ address: string }>({ mode: 'onSubmit', reValidateMode: 'onBlur' })
  const address = useWatch({ control, name: 'address' })

  const handleShowErrorPopUp = () => {
    if (!address && !safeInfo) {
      setIsShowModalError(false)
    } else {
      setIsShowModalError(true)
    }
  }
  const getSafeInfo = useCallback(async () => {
    if (address && account && safeService) {
      try {
        const result = await safeService.getSafeInfo(address)
        if (result.owners.find((item) => item === account)) {
          setSafeInfo(result)
        } else {
          setError('address', { message: 'This address is not your own.' })
          setIsShowModalError(true)
          setStep(1)
        }
      } catch (error: any) {
        sentryCaptureException(error)
        sentryCaptureMessage('Could not fetch safe details. You may try again later.')
        setSafeError('Could not fetch safe details. You may try again later.')
      }
    }
  }, [account, address, safeService, setError])

  const handleClose = () => {
    setSafeError('')
    setShowModal(false)
  }

  const handleNext = () => {
    if (!address && selectedSource) {
      setValue('address', selectedSource)
    }
    if (address || selectedSource) {
      if (sourceList.find((item) => item === address || item === selectedSource)) {
        setError('address', { message: 'This address already exists.' })
        setStep(1)
      } else {
        setStep(2)
        setIsShowModalError(false)
        setSafeError('')
      }
    }
  }

  useEffect(() => {
    if (!showModal) {
      setStep(1)
      setSelectedSource(null)
      reset({ address: '' })
    }
  }, [reset, showModal])

  useEffect(() => {
    if (selectedSource) {
      reset({ address: selectedSource })
    }
  }, [reset, selectedSource])

  useEffect(() => {
    if (step === 2) {
      getSafeInfo()
    }
    if (step === 1) {
      setSafeInfo(null)
    }
  }, [step, getSafeInfo, reset])

  return (
    <>
      {showModal && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <div className="w-[600px] ">
            <div className=" p-8 flex justify-between items-center bg-white rounded-t-[24px]">
              <h1 className="text-[24px] font-supply text-black-0">
                {(step === 1 && 'SELECT EXISTING SAFE') || (step === 2 && 'REVIEW & CONFIRM SAFE')}
              </h1>
              <button
                type="button"
                className="rounded-[100%] bg-remove-icon w-8 h-8 flex justify-center items-center"
                onClick={handleClose}
              >
                <Image src={Close} alt="close" />
              </button>
            </div>
            {step === 1 && (
              <form onSubmit={handleSubmit(handleNext)}>
                <div className=" max-h-reviewModal overflow-auto scrollbar bg-white p-8 border-y border-gray-200">
                  <h3 className=" font-inter text-sm font-medium">Manually connect to a safe</h3>
                  <div className="mt-4 mb-8">
                    <input
                      {...register('address', {
                        minLength: { value: 26, message: 'Address is too short' },
                        maxLength: { value: 74, message: 'Address is too long' },
                        validate: address && isAddress
                      })}
                      type="text"
                      className="border border-gray-300 h-12 font-inter  placeholder:text-sm rounded-md py-2 px-3 w-full"
                      placeholder="Safe address"
                    />
                    {/* {errors.address && (
                      <span className="text-neutral-900 font-inter text-sm">
                        {errors.address.type === 'validate' ? 'This address is invalid' : errors.address.message}
                      </span>
                    )} */}
                  </div>
                  <div className="border-t" />
                  <div className="mt-6">
                    <h1 className="text-black-0 font-inter text-sm font-medium mb-4">Select an available safe</h1>
                    <div className=" flex flex-col items-center w-full gap-2">
                      {safeError ? (
                        <Alert
                          variant="danger"
                          className="mt-5 leading-6 font-medium py-3 font-inter"
                          fontSize="text-base"
                        >
                          {safeError}
                        </Alert>
                      ) : availableSourceList && availableSourceList.length > 0 ? (
                        _.difference(availableSourceList, sourceList).map((source) => (
                          <div
                            aria-hidden
                            key={source}
                            // typeof="button"
                            className={`flex w-full cursor-pointer h-14 p-6  text-black-0 gap-4 items-center border border-gray-300 rounded-lg ${
                              selectedSource === source ? 'bg-remove-icon' : ''
                            }`}
                            onClick={() => setSelectedSource(source)}
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-[100%]" />

                            <span className="flex items-center w-full ">
                              <div className=" text-base  font-normal w-full ">
                                <WalletAddress
                                  address={source}
                                  noAvatar
                                  noColor
                                  addressClassName="w-full max-w-full"
                                  addressWidth="w-full"
                                />
                              </div>
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-center flex-col border py-6 border-gray-300 rounded-lg w-full">
                          <div className="flex justify-center pb-2">
                            <img src="/svg/Transaction.svg" alt="icon" width={50} height={50} />
                          </div>
                          <div className="font-inter text-sm text-center font-medium"> No available safe!</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-b-[24px] bg-white  p-8 flex items-center gap-4 w-full">
                  <button
                    type="button"
                    className="bg-remove-icon font-inter hover:bg-gray-300 hover:opacity-80 font-semibold text-base text-black-0 py-4 px-8  rounded-lg "
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`bg-grey-900 font-inter ${
                      !address && !selectedSource ? 'opacity-50' : 'hover:bg-grey-901'
                    } text-base text-white py-4 font-semibold w-full  rounded-lg
                    `}
                    onClick={() => handleShowErrorPopUp()}
                    disabled={!address && !selectedSource}
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}
            {step === 2 && (
              <>
                <div
                  className={`${
                    safeError ? 'min-h-[200px]' : 'min-h-[410px]'
                  } max-h-reviewModal scrollbar overflow-auto bg-white px-8 pt-6 pb-8 border-y border-gray-200`}
                >
                  <div className="mb-6">
                    <h1 className=" font-inter font-medium pb-2 text-sm">Safe Address</h1>
                    <div className="text-black-0 font-medium text-base">
                      <WalletAddress
                        address={address}
                        addressClassName="w-full"
                        addressWidth="w-full"
                        noAvatar
                        noColor
                      />
                    </div>
                  </div>
                  {safeError ? (
                    <Alert variant="danger" className="mt-5 leading-6 font-medium py-3 font-inter" fontSize="text-base">
                      {safeError}
                    </Alert>
                  ) : safeInfo ? (
                    <>
                      <div className=" ">
                        <div className="flex items-center pb-2">
                          <h1 className=" font-inter text-black-0 font-medium pr-2 text-sm">Approval threshold</h1>
                          <div className="relative group max-w-max ">
                            <img src="./image/help.png" className="w-4 h-4" alt="help" />
                            <div className="absolute z-10 w-full top-10 ml-2 flex-col  hidden  group-hover:flex ">
                              <span className="z-10 p-4 w-[260px] font-inter text-sm border border-[#E4E3E7] leading-none whitespace-no-wrap font-normal text-[#27272A] bg-white shadow-lg rounded-lg">
                                The number of approvals needed to execute the transaction.
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-black-0 font-medium">{safeInfo.threshold}</p>
                      </div>
                      <div className="border-t my-4" />
                      <div>
                        <h1 className=" font-inter font-medium text-sm">Signers</h1>
                        <div className="mt-4 rounded-lg shadow-3xl font-inter border border-gray-300">
                          <div className="flex w-full text-sm p-4  text-[#727B84]  items-center border-b bg-[#F8F9FA] rounded-t-lg">
                            <div className=" text-center w-[24px] mr-4">No. </div>
                            <div>Signer’s wallet address</div>
                          </div>
                          {safeInfo &&
                            safeInfo.owners.map((owner, index) => (
                              <div
                                key={owner}
                                className={`flex w-full p-4    items-center ${index % 2 === 0 ? '' : 'bg-gray-50'} ${
                                  index === safeInfo.owners.length - 1 ? 'rounded-b-lg' : ''
                                }`}
                              >
                                <div className=" text-sm ">
                                  <WalletAddress sizeAvatar={24} noColor address={owner} showFirst={5} showLast={4} />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex justify-center items-center flex-col bg-white ">
                      {/* <img src="/svg/logos/ledgerx-logo.svg" alt="logo" className="h-10 w-auto " /> */}
                      <div className="flex gap-6 mt-6">
                        <div className="w-4 h-4 rounded-full bg-blue-400 animate-bounce" />
                        <div className="w-4 h-4 rounded-full bg-yellow-400 animate-bounce" />
                        <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-b-[24px] bg-white p-8 flex  items-center gap-4 w-full">
                  <button
                    type="button"
                    className="bg-remove-icon font-inter text-base hover:bg-gray-300 font-semibold text-black-0 py-4 px-8  rounded-lg hover:opacity-80 "
                    onClick={() => {
                      if (safeError) {
                        handleClose()
                      } else {
                        setStep(1)
                        reset({ address: '' })
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`bg-grey-900 font-inter flex justify-center items-center gap-1 hover:bg-grey-901 text-white py-4 font-semibold text-base border w-full rounded-lg shadow-primary-blue-button disabled:cursor-not-allowed disabled:opacity-50 ${
                      safeInfo ? '' : 'opacity-60'
                    }`}
                    onClick={async () => {
                      setLoadingBalance(true)
                      await onConfirm(safeInfo)
                      setIsShowModal(true)
                      setLoadingBalance(false)
                    }}
                    disabled={!!safeError || !safeInfo || loadingBalance}
                  >
                    Confirm
                    {loadingBalance && (
                      <img src="/svg/LoaderDefault.svg" className="flex w-3 h-auto animate-spin" alt="loader" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      <Modal showModal={isShowModal} setShowModal={setIsShowModal}>
        <SuccessPopUp
          address={address}
          action={() => setIsShowModal(false)}
          title="SAFE CONNECTED SUCCESSFULLY"
          description="You can now create & approve transactions"
        />
      </Modal>
      <Modal showModal={isShowModalError} setShowModal={setIsShowModalError}>
        {errors && (
          <ErrorPopUp
            // safe
            action={() => {
              setIsShowModalError(false)
              setShowModal(false)
            }}
            moreActions={() => setIsShowModalError(false)}
            title="UNABLE TO CONNECT SAFE"
            error
            description={(errors && errors.address?.message) || 'We’re having trouble connecting your safe'}
          />
        )}
      </Modal>
    </>
  )
}

export default ImportSourceModal
