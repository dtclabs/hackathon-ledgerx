import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import TextField from '@/components/TextField/TextField'
import { isAddress } from 'ethers/lib/utils'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { logEvent } from '@/utils/logEvent'
import { usePostWalletMutation } from '@/slice/wallets/wallet-api'
import { useAppSelector } from '@/state'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { log } from '@/utils-v2/logger'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useGetWalletGroupsQuery } from '@/api-v2/wallet-group-api'
import { AuthenticatedView as View, Header, Footer } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import DropDown from '@/components-v2/atoms/Dropdown/index'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Link from 'next/link'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'
import ETH from '@/public/svg/CyanETH.svg'
import { toast } from 'react-toastify'
import { toChecksumAddress } from 'ethereumjs-util'
import Typography from '@/components-v2/atoms/Typography'
import { DEFAULT_WALLET_GROUP_NAME, SourceType } from '@/slice/wallets/wallet-types'

interface IAddWalletForm {
  name: string
  address: string
  walletGroup?: any
}

const ImportEOAWallet: React.FC = () => {
  const organizationId = useOrganizationId()
  const {
    data: groups,
    isError: isGetWalletGroupsError,
    error: getWalletGroupsError,
    isSuccess: isGetWalletGroupsSuccess
  } = useGetWalletGroupsQuery({
    orgId: organizationId
  })
  const [disable, setDisable] = useState<any>()
  const [postWallet, postWalletResult] = usePostWalletMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [responseError, setResponseError] = useState<string>()
  const [showErrorModal, setShowErrorModal] = useState(false)
  const selectedChain = useAppSelector(selectedChainSelector)
  const formRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (isGetWalletGroupsError) {
      log.error(
        getWalletGroupsError?.message ?? 'Error while fetching wallet groups on wallets page',
        ['Error while fetching wallet groups on wallets page'],
        {
          actualErrorObject: getWalletGroupsError.data,
          errorStatusCode: getWalletGroupsError.status
        },
        `${window.location.pathname}`
      )
    }
  }, [isGetWalletGroupsError])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<IAddWalletForm>({
    defaultValues: { name: '', address: '', walletGroup: [] }
  })

  const walletGroup = useWatch({ control, name: 'walletGroup' })
  const groupsFormatted = groups?.map((group) => ({ value: group.id, label: group.name }))

  useEffect(() => {
    reset({ name: '', address: '', walletGroup: [] })
  }, [reset])

  useEffect(() => {
    if (isGetWalletGroupsSuccess) {
      const defaultGroups = groups.find((group) => group.name.includes(DEFAULT_WALLET_GROUP_NAME))
      if (defaultGroups) {
        setValue('walletGroup', { value: defaultGroups.id, label: defaultGroups.name })
      } else {
        setValue('walletGroup', { value: groups[0]?.id, label: groups[0]?.name })
      }
    }
  }, [isGetWalletGroupsSuccess])

  useEffect(() => {
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
      toast.success('Wallet added')
      router.push(`/${organizationId}/wallets`)
    }
    if (postWalletResult.isError) {
      setShowErrorModal(true)
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
        address: toChecksumAddress(data.address),
        walletGroupId: data.walletGroup?.value || '',
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

  // select
  const handleSelectGroup = (item) => {
    setValue('walletGroup', item)
  }

  const breadcrumbItems = [
    { to: `/${organizationId}/wallets`, label: 'Wallets' },
    { to: `/${organizationId}/wallets/import`, label: 'Import Wallet' }
  ]

  return (
    <>
      <Header>
        <div className="flex items-center">
          <Button
            variant="ghost"
            height={24}
            classNames="!h-[30px] p-[0.5rem]"
            leadingIcon={<Image src={leftArrow} className="rotate-90 py-[20px]" height={10} width={10} />}
            onClick={() => router.back()}
          />
          <Breadcrumb>
            {breadcrumbItems.map(({ to, label }) => (
              <Link key={to} href={to} legacyBehavior>
                {label}
              </Link>
            ))}
            <Link href={`/${organizationId}/wallets/import/eoa`} legacyBehavior>
              <div className="flex items-center gap-4">
                <Image src={ETH} width={32} height={32} />
                <span>Import Ethereum Wallet</span>
              </div>
            </Link>
          </Breadcrumb>
        </div>
      </Header>
      <View.Content>
        <form ref={formRef}>
          <div className="pb-8">
            <div className="flex-1 flex flex-col">
              <Typography variant="subtitle2" color="primary" classNames="mb-3">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="address">Wallet Address</label>
                <span className="text-error-500 ml-0.5">*</span>
              </Typography>
              <TextField
                errorClass="pt-2"
                disabled={isSubmitting}
                errors={errors}
                required
                placeholder="e.g. 0xc0ffee254729296a45a3885639AC7E10F9d54979"
                name="address"
                control={control}
                rules={{
                  required: { value: true, message: 'Address is required.' },
                  validate: {
                    isAddress: (value: string) => isAddress(value) || 'Invalid wallet address.'
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col">
              <Typography variant="subtitle2" color="primary" classNames="mb-3">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="name">Wallet Name</label>
                <span className="text-error-500 ml-0.5">*</span>
              </Typography>
              <TextField
                errorClass="pt-2"
                placeholder="e.g. Team Wallet EOA"
                name="name"
                control={control}
                errors={errors}
                disabled={isSubmitting} // 120 margin and 80 breadcrumb height
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
            <div className="flex-1 flex flex-col">
              <Typography variant="subtitle2" color="primary" classNames="mb-3">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="walletGroup">Wallet Group</label>
                <span className="text-error-500 ml-0.5">*</span>
              </Typography>
              <DropDown
                value={walletGroup}
                options={groupsFormatted}
                handleOnChange={handleSelectGroup}
                placeholder="Select a Wallet Group"
                name="walletGroup"
                width="100%"
              />
            </div>
          </div>
        </form>
      </View.Content>
      <Footer>
        <div className="flex justify-end">
          <Button
            variant="grey"
            height={48}
            label="Cancel"
            classNames="mr-4"
            disabled={isSubmitting}
            onClick={() => router.push(`/${organizationId}/wallets`)}
          >
            Cancel
          </Button>
          <Button
            variant="black"
            height={48}
            label="Import Wallet"
            width="w-[200px]"
            type="submit"
            form="import-wallet-form"
            disabled={isSubmitting}
            loading={isSubmitting || postWalletResult.isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            Import Wallet
          </Button>
        </div>
      </Footer>
      {showErrorModal && (
        <NotificationPopUp
          acceptText="Dismiss"
          title={
            responseError.includes('exists')
              ? (responseError.includes('name') && 'Wallet Name Already Exists') ||
                (responseError.includes('address') && 'Wallet Address Already Exists')
              : 'Unable to add wallet'
          }
          description={
            responseError.includes('exists')
              ? (responseError.includes('address') &&
                  'This wallet address has already been added. Please try adding another address.') ||
                (responseError.includes('name') &&
                  'This wallet name has already been added. Please try adding another name or edit the existing wallet details.')
              : 'There was an issue adding the wallet. Please try again.'
          }
          type="error"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => {
            setResponseError(undefined)
            setShowErrorModal(false)
          }}
        />
      )}
    </>
  )
}

export default ImportEOAWallet
