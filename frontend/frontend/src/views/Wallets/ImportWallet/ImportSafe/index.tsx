import { useOrganizationId } from '@/utils/getOrganizationId'
import { AuthenticatedView as View, Header, Footer } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useRouter } from 'next/router'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Link from 'next/link'
import safeIcon from '@/public/svg/logos/safe-logo.svg'
import { useGetWalletsQuery, usePostWalletMutation } from '@/slice/wallets/wallet-api'
import { useAppSelector } from '@/state'
import SafeServiceClient, { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { useWeb3React } from '@web3-react/core'
import _ from 'lodash'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import AddSafeForm from '../../components/AddSafe/AddSafeForm/AddSafeForm'
import AddSafeReview from '../../components/AddSafe/AddSafeReview/AddSafeReview'
import { safeServiceUrl } from '@/constants/safe'
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { toChecksumAddress } from 'ethereumjs-util'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useGetWalletGroupsQuery } from '@/api-v2/wallet-group-api'
import { log } from '@/utils-v2/logger'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { toast } from 'react-toastify'
import { useGetAllContactsQuery } from '@/slice/contacts/contacts-api'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { DEFAULT_WALLET_GROUP_NAME, EImportSafeStep, SourceType } from '@/slice/wallets/wallet-types'

const netWorkRpc = {
  ethereum: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  goerli: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
}

interface IAddSafeForm {
  name: string
  address: string
  walletGroup?: any
}

const ImportSafe = () => {
  const organizationId = useOrganizationId()
  const router = useRouter()
  const { account } = useWeb3React()
  const selectedChain = useAppSelector(selectedChainSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const [disable, setDisable] = useState<any>()
  const [safeStep, setSafeStep] = useState<EImportSafeStep>(EImportSafeStep.FORM)
  const [availableSourceList, setAvailableSourceList] = useState<string[]>()
  const [loadingSourceList, setLoadingSourceList] = useState(false)
  const [safeError, setSafeError] = useState<string>()
  const [isSubmit, setIsSubmit] = useState(false)
  const [checking, setChecking] = useState(false)
  const [safeInfo, setSafeInfo] = useState<SafeInfoResponse | null>(null)
  const [responseError, setResponseError] = useState<string>()
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [postGnosis, postGnosisResult] = usePostWalletMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()

  // POSSIBLE OPTIMIZATION LATER: This approach might not be scalable later when an organization will have
  // a large number of contacts. Maybe an API endpoint that checks for existing contact and returns a name ?
  // Maybe add this to mainview component and the map of contacts can be used across app ?
  const [organizationContacts, setOrganizationContacts] = useState<Map<any, any>>()
  const {
    data: contacts,
    isSuccess: isGetContactsSuccess,
    isFetching
  } = useGetAllContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId }
  )

  const {
    data: groups,
    isError: isGetWalletGroupsError,
    error: getWalletGroupsError,
    isSuccess: isGetWalletGroupsSuccess
  } = useGetWalletGroupsQuery(
    {
      orgId: organizationId
    },
    { skip: !organizationId }
  )

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

  useEffect(() => {
    if (!isFetching && isGetContactsSuccess) {
      const contactsMap = new Map()
      for (const contact of contacts) {
        if (contact?.addresses.length > 0) {
          contact.addresses.map((addressObj) => contactsMap.set(toChecksumAddress(addressObj.address), contact.name))
        }
      }
      setOrganizationContacts(contactsMap)
    }
  }, [isFetching, isGetContactsSuccess])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<IAddSafeForm>({
    defaultValues: { name: '', address: '', walletGroup: [] }
  })
  const name = useWatch({ control, name: 'name' })
  const address = useWatch({ control, name: 'address' })
  const walletGroup = useWatch({ control, name: 'walletGroup' })
  const groupsFormatted = groups?.map((group) => ({ value: group.id, label: group.name }))

  useEffect(() => {
    if (isGetWalletGroupsSuccess) {
      const defaultGroups = groups.find((group) => group.name.includes(DEFAULT_WALLET_GROUP_NAME))
      if (defaultGroups) {
        setValue('walletGroup', { value: defaultGroups.id, label: defaultGroups.name })
      } else {
        setValue('walletGroup', { value: groups[0].id, label: groups[0].name })
      }
    }
  }, [isGetWalletGroupsSuccess])

  const {
    data: sources,
    isLoading: loading,
    isError: isWalletFetchError,
    error: walletFetchError,
    refetch
  } = useGetWalletsQuery({
    orgId: organizationId,
    params: { size: 999, page: 0 } // Possible Optimization: Maybe filter it specifically for safes ? Might need BE help for that
  })

  useEffect(() => {
    if (isWalletFetchError) {
      log.critical(
        walletFetchError?.message ?? 'Error while fetching wallets',
        ['Error while fetching wallets'],
        {
          actualErrorObject: walletFetchError.data,
          errorStatusCode: walletFetchError.status
        },
        `${window.location.pathname}`
      )
    }
  }, [isWalletFetchError])

  const safeService = useMemo(() => {
    let service: SafeServiceClient
    if (selectedChain) {
      try {
        const serviceUrl =
          (selectedChain && safeServiceUrl[selectedChain.id]) || 'https://safe-transaction-mainnet.safe.global'
        const signer = new ethers.providers.JsonRpcProvider(netWorkRpc[selectedChain.id]).getSigner()
        const ethAdapter = new EthersAdapter({
          ethers,
          signer
        })
        service = new SafeServiceClient({
          txServiceUrl: serviceUrl,
          ethAdapter
        })
      } catch (error: any) {
        log.error(
          error?.message ?? 'Error while fetching safe info on Add Safe form',
          ['Error while fetching safe info on Add Safe form'],
          {
            actualErrorObject: error
          },
          `${window.location.pathname}`
        )
      }
    }
    return service
  }, [selectedChain])

  useEffect(() => {
    if (postGnosisResult.isLoading) {
      // setStatus(EProcessStatus.PENDING)
    }
    if (postGnosisResult.isSuccess) {
      // setStatus(EProcessStatus.SUCCESS)
      const originalArgs = postGnosisResult.originalArgs.payload
      const walletId = postGnosisResult.data?.data?.id
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
    if (postGnosisResult.isError) {
      // setStatus(EProcessStatus.FAILED)
      setShowErrorModal(true)
      setResponseError(postGnosisResult.error.data.message)
      log.error(
        postGnosisResult.error?.message ?? 'Error while adding safe using the POST /wallets API for gnosis',
        ['Error while adding safe using the POST /wallets API for gnosis'],
        {
          actualErrorObject: postGnosisResult.error.data
        },
        `${window.location.pathname}`
      )
    }
  }, [postGnosisResult])

  // get Available safe
  const getAvailableSourceList = useCallback(async () => {
    try {
      setLoadingSourceList(true)
      if (safeService && account && sources) {
        const safelist = await safeService.getSafesByOwner(account)
        const newList = _.difference(safelist.safes, sources.items && sources.items.map((item) => item.address))
        setAvailableSourceList(newList)
        setSafeError(null)
      }
      setLoadingSourceList(false)
    } catch (err) {
      setLoadingSourceList(false)
      setAvailableSourceList(undefined)
      setSafeError('Could not fetch existing safes. Please enter the safe address manually.')
      log.error(
        // @ts-ignore TS2339
        err?.message ?? 'Error while fetching safes of existing wallets from the gnosis api',
        ['Error while fetching safes of existing wallets from the gnosis api'],
        {
          actualErrorObject: err
        },
        `${window.location.pathname}`
      )
    }
  }, [account, safeService, sources, selectedChain])

  useEffect(() => {
    getAvailableSourceList()
  }, [getAvailableSourceList, selectedChain])

  // get safe info
  const getSafeInfo = useCallback(async () => {
    if (address && safeService) {
      try {
        const result = await safeService.getSafeInfo(toChecksumAddress(address))
        setSafeInfo(result)
      } catch (error: any) {
        setSafeError('Could not fetch safe details. You may try again later.')
        log.error(
          // @ts-ignore TS2339
          error?.message ?? 'Error while fetching safe info',
          ['Error while fetching safe info'],
          {
            actualErrorObject: error
          },
          `${window.location.pathname}`
        )
      }
    }
  }, [address, safeService])

  useEffect(() => {
    if (safeStep === EImportSafeStep.REVIEW) {
      getSafeInfo()
    }
    if (safeStep === EImportSafeStep.FORM) {
      setSafeInfo(null)
    }
  }, [getSafeInfo, safeStep])

  // Import safe
  const handleImportGnosisSource = async () => {
    if (safeInfo) {
      setIsSubmit(true)
      setDisable(true)
      await postGnosis({
        orgId: organizationId,
        payload: {
          address: toChecksumAddress(safeInfo.address),
          blockchainId: selectedChain?.id,
          name,
          sourceType: SourceType.GNOSIS,
          walletGroupId: walletGroup?.value || ''
        }
      })
      setIsSubmit(false)
      setDisable(false)
    }
  }

  const handleBack = () => {
    if (isSubmit) {
      setSafeStep(EImportSafeStep.REVIEW)
    } else {
      setSafeStep(EImportSafeStep.FORM)
    }
  }

  // select
  const handleSelectGroup = (item) => {
    setValue('walletGroup', item)
  }
  const handleSelectAddress = (selectedAddress: string) => {
    reset({ address: selectedAddress, name, walletGroup })
  }

  const onSubmit = () => {
    setSafeError('')
    setSafeStep(EImportSafeStep.REVIEW)
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
                <Image src={safeIcon} width={32} height={32} />
                <span>Import Safe</span>
              </div>
            </Link>
          </Breadcrumb>
        </div>
      </Header>
      <View.Content>
        <form onSubmit={handleSubmit(onSubmit)}>
          {safeStep === EImportSafeStep.FORM ? (
            <AddSafeForm
              address={address}
              control={control}
              availableSourceList={availableSourceList}
              errors={errors}
              isSubmitting={isSubmitting}
              onSelectAddress={handleSelectAddress}
              onSelectGroup={handleSelectGroup}
              safeError={safeError}
              loadingSourceList={loadingSourceList}
              groupsData={groupsFormatted}
              group={walletGroup}
              safeService={safeService}
              setChecking={setChecking}
              selectedChain={selectedChain}
              supportedChains={supportedChains}
            />
          ) : (
            <AddSafeReview safeError={safeError} safeInfo={safeInfo} organizationContacts={organizationContacts} />
          )}
          {/* </div> */}
        </form>
      </View.Content>
      <Footer>
        <div className="flex justify-end">
          {safeStep === EImportSafeStep.REVIEW ? (
            <>
              <Button
                disabled={isSubmitting}
                variant="grey"
                height={48}
                label="Back"
                classNames="mr-4"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                disabled={isSubmitting}
                variant="black"
                height={48}
                label="Import Safe"
                width="w-[200px]"
                type="submit"
                form="import-wallet-form"
                loading={isSubmitting || postGnosisResult.isLoading}
                onClick={handleImportGnosisSource}
              >
                Import Safe
              </Button>
            </>
          ) : (
            <>
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
                label="Continue"
                width="w-[200px]"
                type="submit"
                form="import-wallet-form"
                disabled={isSubmitting || checking || Object.keys(errors).length > 0}
                loading={isSubmitting || postGnosisResult.isLoading}
                onClick={handleSubmit(onSubmit)}
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </Footer>
      {showErrorModal && (
        <NotificationPopUp
          acceptText="Dismiss"
          title={
            responseError.includes('exists')
              ? (responseError.includes('name') && 'Safe Name Already Exists') ||
                (responseError.includes('address') && 'Safe Address Already Exists')
              : 'Unable to add safe'
          }
          description={
            responseError.includes('exists')
              ? (responseError.includes('address') &&
                  'This safe address has already been added. Please try adding another address.') ||
                (responseError.includes('name') &&
                  'This safe name has already been added. Please try adding another name or edit the existing safe details.')
              : 'There was an issue adding the safe. Please try again.'
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

export default ImportSafe
