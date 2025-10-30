import React, { useState, useEffect } from 'react'
import { EProcessStatus } from '../../types'
import { useForm, useWatch } from 'react-hook-form'
import TextField from '@/components/TextField/TextField'
import { isAddress } from 'ethers/lib/utils'
import useSafeServiceClient from '@/hooks/useSafeServiceClient'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { logEvent } from '@/utils/logEvent'
import Modal from '@/components/Modal'
import Image from 'next/legacy/image'
import ETH from '@/public/svg/CyanETH.svg'
import SelectGroup from '../SelectGroup/SelectGroup'
import warning from '@/assets/svg/warning.svg'
import { usePostWalletMutation } from '@/slice/wallets/wallet-api'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import { useAppSelector } from '@/state'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { log } from '@/utils-v2/logger'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { SourceType } from '@/slice/wallets/wallet-types'

interface IAddWalletForm {
  name: string
  address: string
  walletGroup?: any
}

interface IAddWallet {
  setResponseError: (error: string) => void
  setStatus: (status: EProcessStatus) => void
  showAddWallet: boolean
  setShowAddWallet: (showAddWallet: boolean) => void
  groupsData: any[]
}

const AddWallet: React.FC<IAddWallet> = ({
  setResponseError,
  setStatus,
  showAddWallet,
  setShowAddWallet,
  groupsData
}) => {
  const safeService = useSafeServiceClient()
  const organizationId = useOrganizationId()
  const [disable, setDisable] = useState<any>()
  const [postWallet, postWalletResult] = usePostWalletMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const { startWalletSync } = useWalletSync({ organisationId: organizationId })
  const selectedChain = useAppSelector(selectedChainSelector)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    setValue
  } = useForm<IAddWalletForm>({
    defaultValues: { name: '', address: '', walletGroup: groupsData.length > 0 ? groupsData[0] : '' }
  })

  const walletGroup = useWatch({ control, name: 'walletGroup' })

  useEffect(() => {
    if (!showAddWallet) reset({ name: '', address: '', walletGroup: groupsData.length > 0 ? groupsData[0] : '' })
  }, [reset, showAddWallet])

  useEffect(() => {
    if (postWalletResult.isLoading) {
      setStatus(EProcessStatus.PENDING)
    }
    if (postWalletResult.isSuccess) {
      const originalArgs = postWalletResult.originalArgs.payload
      const walletId = postWalletResult.data?.data?.id
      triggerSendAnalysis({
        eventType: 'IMPORT_WALLET',
        metadata: {
          blockchainId: originalArgs?.blockchainId,
          sourceType: originalArgs?.sourceType,
          walletGroupId: originalArgs?.walletGroupId,
          walletId
        }
      })
      setStatus(EProcessStatus.SUCCESS)
    }
    if (postWalletResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setResponseError(postWalletResult.error.data.message)
      log.error(
        postWalletResult?.error?.data?.message ??
          `${postWalletResult?.error?.status} API Error when adding a new wallet`,
        [`${postWalletResult?.error?.status} API Error when adding a new wallet`],
        {
          actualErrorObject: postWalletResult?.error?.data
        },
        `${window.location.pathname}`
      )
    }
  }, [postWalletResult])
  // check if address is safe
  const checkSafeAddress = async (value: string) => {
    try {
      const safeAddressValidate = await safeService.getSafeInfo(value)
      if (safeAddressValidate) {
        setError('address', { message: 'This address is invalid.', type: 'validate' })
        return false
      }
      return true
    } catch (err) {
      log.debug(
        'Validation error while checking if wallet address is a safe',
        ['Validation error while checking if wallet address is a safe'],
        {
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
      return true
    }
  }

  // submit
  const onSubmit = async (data: IAddWalletForm) => {
    if (isSubmitting) {
      return
    }
    setDisable(true)

    await postWallet({
      orgId: organizationId,
      payload: {
        name: data.name,
        address: data.address,
        walletGroupId: data.walletGroup?.id || '',
        sourceType: SourceType.ETH,
        blockchainId: selectedChain?.id
      }
    })

    setDisable(false)
    logEvent({
      event: 'added_source_of_fund_in_app',
      payload: {
        event_category: 'Full app',
        event_label: '',
        value: 1
      }
    })
  }

  const handleClose = () => {
    if (disable) {
      setShowAddWallet(true)
    } else {
      setShowAddWallet(false)
    }
  }

  // select
  const handleSelectGroup = (item) => {
    setValue('walletGroup', item)
  }

  return (
    <Modal setShowModal={setShowAddWallet} showModal={showAddWallet}>
      <div className="w-full font-inter max-w-[650px] bg-white shadow-home-modal rounded-3xl">
        <div className="p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image src={ETH} width={32} height={32} />
              <div className="text-2xl font-semibold leading-8 text-[#344054]">Import Ethereum Wallet</div>
            </div>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-b-2xl px-8">
            <div className="py-8 w-full border-t">
              <div className="pb-8">
                <TextField
                  errorClass="pt-2"
                  disabled={isSubmitting}
                  errors={errors}
                  required
                  placeholder="e.g. 0xc0ffee254729296a45a3885639AC7E10F9d54979"
                  label="Wallet Address*"
                  name="address"
                  control={control}
                  rules={{
                    required: { value: true, message: 'Address is required.' },
                    validate: {
                      isAddress: (value: string) => isAddress(value) || 'Invalid wallet address.',
                      isWallet: async (value: string) => (await checkSafeAddress(value)) || 'Invalid wallet address.'
                    }
                  }}
                />
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <TextField
                    errorClass="pt-2"
                    placeholder="e.g. Team Wallet EOA"
                    label="Wallet Name*"
                    name="name"
                    control={control}
                    errors={errors}
                    disabled={isSubmitting}
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
                <div className="flex-1">
                  <div className="pb-4 text-sm font-medium text-[#344054]">Wallet Group*</div>
                  <SelectGroup
                    className="py-[14px] pl-4 h-12 border-[#EAECF0]"
                    onSelect={handleSelectGroup}
                    groupList={groupsData}
                    group={walletGroup}
                    fullWidth
                  />
                  {/* {submit && (
                      <div className="text-sm font-inter pt-1 flex items-center text-[#E83F6D] ">
                        <div className="mr-2 flex items-center">
                          <Image src={warning} alt="warning" />
                        </div>
                        This field is required.
                      </div>
                    )} */}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 p-8 border-t border-grey-200">
            <button
              disabled={isSubmitting}
              type="button"
              className="min-w-[118px] text-dashboard-main font-semibold font-inter bg-neutral-100 hover:bg-[#edf1f5] rounded-lg h-14"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="relative w-full text-white text-base font-semibold font-inter bg-grey-900 hover:bg-grey-901 rounded-lg h-14"
            >
              <p>Import Wallet</p>
              {postWalletResult.isLoading && (
                <img
                  src="/svg/LoaderDefault.svg"
                  alt="refresh"
                  className="w-5 animate-spin absolute left-[63%] top-[18px]"
                />
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddWallet
