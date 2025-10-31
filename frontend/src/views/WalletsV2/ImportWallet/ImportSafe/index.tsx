/* eslint-disable no-promise-executor-return */
import { useOrganizationId } from '@/utils/getOrganizationId'
import { AuthenticatedView as View, Header, Footer } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import leftArrow from '@/public/svg/Dropdown.svg'
import { useRouter } from 'next/router'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import Link from 'next/link'
import safeIcon from '@/public/svg/logos/safe-logo.svg'
import {
  useGetWalletsQuery,
  usePostWalletMutation,
  useSyncPendingTransactionsMutation
} from '@/slice/wallets/wallet-api'
import { useLazyGetPendingTransactionsNewQuery } from '@/slice/pending-transactions/pending-transactions.api'
import { useAppSelector } from '@/state'
import SafeServiceClient, { SafeInfoResponse } from '@gnosis.pm/safe-service-client'
import { useWeb3React } from '@web3-react/core'
import _ from 'lodash'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import AddSafeForm from '../../components/AddSafe/AddSafeForm/AddSafeForm'
import AddSafeReview from '../../components/AddSafe/AddSafeReview/AddSafeReview'
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { toChecksumAddress } from 'ethereumjs-util'
import { useSendAnalysisMutation } from '@/api-v2/analysis-api'
import { useGetWalletGroupsQuery } from '@/api-v2/wallet-group-api'
import { log } from '@/utils-v2/logger'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { useGetAllContactsQuery } from '@/slice/contacts/contacts-api'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import CreateGroupModal from '../../components/CreateGroupModal/CreateGroupModal'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import Typography from '@/components-v2/atoms/Typography'
import { DEFAULT_WALLET_GROUP_NAME, EImportSafeStep, SourceType } from '@/slice/wallets/wallet-types'
import { selectNetworkRPCMap } from '@/slice/chains/chain-selectors'
import { WORD_TO_LINK } from '../ImportEOAWallet'
import { addLinkToMessage } from '../../utils'

interface IAddSafeForm {
  name: string
  address: string
  walletGroup?: any
  supportedBlockchains?: any
}

const ImportSafe = () => {
  const organizationId = useOrganizationId()
  const router = useRouter()
  const { account } = useWeb3React()
  const selectedChain = useAppSelector(selectedChainSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const NETWORK_RPC_MAP = useAppSelector(selectNetworkRPCMap)

  const [disable, setDisable] = useState<any>()
  const [safeStep, setSafeStep] = useState<EImportSafeStep>(EImportSafeStep.FORM)
  const [availableSourceList, setAvailableSourceList] = useState<string[]>()
  const [loadingSourceList, setLoadingSourceList] = useState(false)
  const [safeError, setSafeError] = useState<string>()
  const [isSubmit, setIsSubmit] = useState(false)
  const [checking, setChecking] = useState(false)
  const [safeInfo, setSafeInfo] = useState<SafeInfoResponse | null>(null)
  const [responseError, setResponseError] = useState<{ message: string; statusCode: number }>()
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [postGnosis, postGnosisResult] = usePostWalletMutation()
  const [triggerSendAnalysis] = useSendAnalysisMutation()
  const [triggerSyncPendingTransactions, syncPendingTransactionsResults] = useSyncPendingTransactionsMutation()
  const [triggerGetPendingTxns] = useLazyGetPendingTransactionsNewQuery()

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
    { skip: !organizationId, refetchOnMountOrArgChange: true }
  )

  const {
    data: groups,
    isError: isGetWalletGroupsError,
    error: getWalletGroupsError,
    isSuccess: isGetWalletGroupsSuccess
  } = useGetWalletGroupsQuery({
    orgId: organizationId
  })

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
    trigger,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    clearErrors
  } = useForm<IAddSafeForm>({
    mode: 'onChange',
    defaultValues: { name: '', address: '', walletGroup: [], supportedBlockchains: selectedChain }
  })
  const name = useWatch({ control, name: 'name' })
  const address = useWatch({ control, name: 'address' })
  const walletGroup = useWatch({ control, name: 'walletGroup' })
  const supportedBlockchains = useWatch({ control, name: 'supportedBlockchains' })
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
    isError: isWalletFetchError,
    error: walletFetchError
  } = useGetWalletsQuery(
    {
      orgId: organizationId,
      params: { size: 999, page: 0 } // Possible Optimization: Maybe filter it specifically for safes ? Might need BE help for that
    },
    { skip: !organizationId }
  )

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

  useEffect(() => {
    setValue('supportedBlockchains', selectedChain)
  }, [selectedChain])

  const safeService = useMemo(() => {
    let service: SafeServiceClient
    if (supportedBlockchains) {
      try {
        const serviceUrl = supportedBlockchains.safeUrl || 'https://safe-transaction-mainnet.safe.global'
        const signer = new ethers.providers.JsonRpcProvider(NETWORK_RPC_MAP[supportedBlockchains.id][0]).getSigner()
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
  }, [supportedBlockchains])

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
      triggerSyncPendingTransactions({ organisationId: organizationId })
      // Side Effect - On Sync Success we will redirect to wallet page
      // toast.success('Wallet added')
      // router.push(`/${organizationId}/wallets`)
    }
    if (postGnosisResult.isError) {
      // setStatus(EProcessStatus.FAILED)
      setShowErrorModal(true)
      setDisable(true)
      setResponseError(postGnosisResult.error.data)
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

  useEffect(() => {
    if (syncPendingTransactionsResults.isSuccess) {
      triggerGetPendingTransactions()
    }
  }, [syncPendingTransactionsResults.isSuccess])

  const triggerGetPendingTransactions = async () => {
    // TODO - After backend fixes we can probably simplify this
    // Wait for 5 seconds then make a call to get pending transactions
    // Give time for BE to sync the transactions
    await new Promise((resolve) => setTimeout(resolve, 5000))
    triggerGetPendingTxns({
      organizationId,
      params: {
        blockchainIds: [],
        walletIds: []
      }
    })
      .unwrap()
      .then(() => {
        setIsSubmit(false)
        setDisable(false)
        router.push(`/${organizationId}/wallets`)
      })
  }

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
      if (responseError?.message?.includes('not found')) {
        return {
          title: 'Unable to import wallet',
          description: responseError?.message ?? 'Sorry, an error occured importing your wallet'
        }
      }
      if (responseError.message.includes('exists')) {
        return responseError.message.includes('name')
          ? {
              title: 'Safe Name Already Exists',
              description:
                'This safe name has already been added. Please try adding another name or edit the existing safe details.'
            }
          : responseError.message.includes('address')
          ? {
              title: 'Safe Address Already Exists',
              description: 'This safe address has already been added. Please try adding another address.'
            }
          : {
              title: 'Unable To Add Safe',
              description: 'There was an issue adding the safe. Please try again.'
            }
      }
    }
    return {
      title: 'Unable to import',
      description: 'Sorry, an error occurred'
    }
  }, [responseError])

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
  }, [account, safeService, sources, supportedBlockchains])

  useEffect(() => {
    getAvailableSourceList()
  }, [getAvailableSourceList, supportedBlockchains])

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
          name,
          sourceType: SourceType.GNOSIS,
          walletGroupId: walletGroup?.value || '',
          supportedBlockchains: [supportedBlockchains.id]
        }
      })
      // Side Effect - After creating Gnosis walelt on success we will trigger a sync
    }
  }

  const handleBack = () => {
    if (isSubmit && !postGnosisResult.isError) {
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
    clearErrors('address')
    setValue('address', selectedAddress)
  }

  const onSubmit = () => {
    let hasError = false

    if (!address) {
      hasError = true
      setError('address', { message: 'Safe Address is required.', type: 'validate' })
    }
    if (!hasError) {
      setSafeError('')
      setSafeStep(EImportSafeStep.REVIEW)
    }
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
                <Typography variant="heading2" color="black">
                  Import Safe
                </Typography>
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
              manualChain={supportedBlockchains}
              supportedChains={supportedChains}
              control={control}
              trigger={trigger}
              setValue={setValue}
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
              checking={checking}
              setChecking={setChecking}
              selectedChain={selectedChain}
              setShowCreateGroup={setShowCreateGroup}
            />
          ) : (
            <AddSafeReview
              safeError={safeError}
              safeInfo={safeInfo}
              organizationContacts={organizationContacts}
              supportedBlockchains={supportedBlockchains}
              supportedChainsOnPlatform={supportedChains}
            />
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
                disabled={disable || isSubmitting || postGnosisResult.isLoading}
                variant="black"
                height={48}
                label="Import Safe"
                width="w-[200px]"
                type="submit"
                form="import-wallet-form"
                loading={disable || isSubmitting || postGnosisResult.isLoading}
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
          title={errorHandler?.title}
          description={errorHandler?.description}
          type="error"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
          onClose={() => {
            setResponseError(null)
            setShowErrorModal(false)
            setDisable(false)
          }}
        />
      )}
      <CreateGroupModal groups={groups} setShowModal={setShowCreateGroup} showModal={showCreateGroup} action="Create" />
    </>
  )
}

export default ImportSafe
