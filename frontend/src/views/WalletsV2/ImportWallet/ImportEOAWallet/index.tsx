import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useForm, useWatch } from 'react-hook-form'
import TextField from '@/components/TextField/TextField'
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
import SOL from '@/public/svg/sample-token/Solana.svg'
import { toast } from 'react-toastify'
import Typography from '@/components-v2/atoms/Typography'
import CustomDropdownMenu from '../../components/CustomDropdownMenu'
import CreateGroupModal from '../../components/CreateGroupModal/CreateGroupModal'
import Loading from '@/components/Loading'
import { addLinkToMessage } from '../../utils'
import { DEFAULT_WALLET_GROUP_NAME, SourceType } from '@/slice/wallets/wallet-types'
import useIsMobile from '@/hooks/useIsMobile'

interface IAddWalletForm {
  name: string
  address: string
  walletGroup?: any
  supportedBlockchains: string[]
}

export const WORD_TO_LINK = 'our team'

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
  const isMobile = useIsMobile()
  const [disable, setDisable] = useState<any>()
  const [postWallet, postWalletResult] = usePostWalletMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [responseError, setResponseError] = useState<{ message: string; statusCode: number }>()
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const selectedChain = useAppSelector(selectedChainSelector)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChainsForWallet, setSelectedChainsForWallet] = useState<string[]>(['solana'])
  const formRef = useRef(null)
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])
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
          supportedBlockchains: selectedChainsForWallet,
          walletId
        }
      })
      toast.success('Wallet added')
      router.push(`/${organizationId}/wallets`)
    }
    if (postWalletResult.isError) {
      setShowErrorModal(true)
      setResponseError(postWalletResult.error.data)
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

  const errorHandler = useMemo(() => {
    if (responseError) {
      if (responseError.statusCode === 422) {
        return {
          title: 'Wallet Is Not Allowed',
          description: responseError?.message.includes(WORD_TO_LINK)
            ? addLinkToMessage(responseError?.message, WORD_TO_LINK)
            : responseError?.message
        }
      }

      if (responseError.message.includes('exists')) {
        return responseError.message.includes('name')
          ? {
              title: 'Wallet Name Already Exists',
              description:
                'This wallet name has already been added. Please try adding another name or edit the existing wallet details.'
            }
          : responseError.message.includes('address')
          ? {
              title: 'Wallet Address Already Exists',
              description: 'This wallet address has already been added. Please try adding another address.'
            }
          : {
              title: 'Unable To Add Wallet',
              description: 'There was an issue adding the wallet. Please try again.'
            }
      }
    }
    return {
      title: 'Unable To Add Wallet',
      description: 'There was an issue adding the wallet. Please try again.'
    }
  }, [responseError])

  // submit
  const onSubmit = async (data: IAddWalletForm) => {
    if (isSubmitting || selectedChainsForWallet.length === 0) {
      return
    }
    setDisable(true)

    await postWallet({
      orgId: organizationId,
      payload: {
        name: data.name,
        address: data.address,
        walletGroupId: data.walletGroup?.value || '',
        sourceType: 'sol' as unknown as SourceType,
        blockchainId: 'solana',
        supportedBlockchains: ['solana']
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

  const isValidSolanaAddress = (value: string) => {
    const cleaned = (value || '').trim()
    // Base58 charset without 0, O, I, l; typical Solana pubkey length 32-44
    const base58Pattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    return base58Pattern.test(cleaned)
  }

  const breadcrumbItems = [
    { to: `/${organizationId}/wallets`, label: 'Wallets' },
    { to: `/${organizationId}/wallets/import`, label: isMobile ? 'Import' : 'Import Wallet' }
  ]

  return (
    <div className="bg-white p-4 rounded-lg ">
      <Header>
        <div className="flex items-center sm:gap-1">
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
              <div className="flex items-center gap-4 sm:gap-2 ">
                <Image src={SOL} width={32} height={32} />
                <Typography variant="heading2" classNames="sm:!text-xs">
                  {isMobile ? 'Solana' : 'Import Solana Wallet'}
                </Typography>
              </div>
            </Link>
          </Breadcrumb>
        </div>
      </Header>
      <View.Content>
        {isLoading ? (
          <Loading dark title="Fetching Data" />
        ) : (
          <form ref={formRef}>
            <div className="pb-8 pt-6 sm:pb-4 sm:pt-8">
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
                  placeholder="e.g. 7W8qK... (Solana address)"
                  name="address"
                  control={control}
                  rules={{
                    required: { value: true, message: 'Address is required.' },
                    validate: {
                      isAddress: (value: string) => isValidSolanaAddress(value) || 'Invalid Solana address.'
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-6 sm:flex-col sm:gap-4">
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
                  customComponents={{
                    // eslint-disable-next-line react/no-unstable-nested-components
                    MenuList: (props) => (
                      <CustomDropdownMenu {...props} onCreateGroup={() => setShowCreateGroup(true)} />
                    )
                  }}
                />
              </div>
            </div>
          </form>
        )}
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
            variant="blueOutlined"
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
          title={errorHandler?.title}
          description={errorHandler?.description}
          type="error"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => {
            setResponseError(null)
            setShowErrorModal(false)
          }}
        />
      )}
      <CreateGroupModal groups={groups} setShowModal={setShowCreateGroup} showModal={showCreateGroup} action="Create" />
    </div>
  )
}

export default ImportEOAWallet
