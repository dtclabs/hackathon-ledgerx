/* eslint-disable arrow-body-style */

import { useAppBalance } from '@/hooks/useAppBalance'
import editSvg from '@/public/svg/Edit.svg'
import deleteSvg from '@/public/svg/TrashRed.svg'
import flagSvg from '@/public/svg/warning.svg'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useEffect, useMemo, useState } from 'react'
import { IScoreRatingProps } from './components/AddWallet/types'
import SourcesDataTable from './components/SourcesDataTable/SourcesDataTable'
import { useGetAuthenticatedProfileQuery } from '@/api-v2/members-api'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import TabItem from '@/components/TabsComponent/TabItem'
import ReactTooltip from 'react-tooltip'
import CreateGroupModal from './components/CreateGroupModal/CreateGroupModal'
import DeleteSourceModal from './components/DeleteSourceModal/DeleteSourceModal'
import EditModal from './components/EditModal/EditModal'
import FlagWalletModal from './components/FlagWallet/FlagWalletModal'
import SelectFundType from './components/SelectFundType/SelectFundType'
import WalletGroup from './components/WalletGroup/WalletGroup'
import { EProcessStatus, EWalletTab, walletTabs } from './types'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { useGetWalletGroupsQuery } from '@/api-v2/wallet-group-api'
import { WHITELIST_ENV } from '@/pages/[organizationId]/wallets'
import Loading from '@/components/Loading'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import SyncChip from '@/components-v2/molecules/SyncChip'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { log } from '@/utils-v2/logger'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import { FormProvider, useForm } from 'react-hook-form'
import { useLazyGetOrganisationCryptocurrenciesQuery } from '@/api-v2/cryptocurrencies'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import _ from 'lodash'
import Button from '@/components-v2/atoms/Button'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import Typography from '@/components-v2/atoms/Typography'
import { ISource, IWalletParams, SourceType } from '@/slice/wallets/wallet-types'

const SourceOfFunds = () => {
  const router = useRouter()
  const { ...methods } = useForm<IWalletParams>({
    defaultValues: {
      assetIds: [],
      walletGroupIds: []
    }
  })

  const [filter, setFilter] = useState<IWalletParams>({
    assetIds: [],
    walletGroupIds: [],
    blockchainIds: []
  })

  const [shouldFetchCrypto, setShouldFetchCrypto] = useState(false) // for fetching assets to filter
  const [direction, setDirection] = useState(true) // true is order by higher balance
  const [page, setPage] = useState(0)
  const [textSearch, setTextSearch] = useState('')
  const { debouncedValue: search } = useDebounce(textSearch, 500)
  const [size, setSize] = useState(process.env.NEXT_PUBLIC_MAXIMUM_TRANSACTIONS_HISTORY || '20')
  const organizationId = useOrganizationId()
  const selectedChain = useAppSelector(selectedChainSelector)

  const supportedChains = useAppSelector(supportedChainsSelector)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { country } = useAppSelector(orgSettingsSelector)
  const isImportWalletSuccess = useAppSelector((state) => state.wallets.isImportWalletSuccess)
  const { startWalletSync, lastUpdated } = useWalletSync({
    organisationId: organizationId
  })

  const [status, setStatus] = useState<EProcessStatus>(EProcessStatus.PENDING)
  const [showDeleteFundNotif, setShowDeleteFundNotif] = useState(false)
  const [showEditModalNotif, setShowEditModalNotif] = useState(false)
  const [showFlagWalletModal, setShowFlagWalletModal] = useState(false)
  const [responseError, setResponseError] = useState<string>()
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showImportedFund, setShowImportedFund] = useState(false)
  const [showSuccessImportModal, setShowSuccessImportModal] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(EWalletTab.WALLETS)

  // Isource is the source of one item
  const [sourceItem, setSourceItem] = useState<ISource>()

  const [action, setAction] = useState('')

  const {
    data: groups,
    isError: isGetWalletGroupsError,
    error: getWalletGroupsError
  } = useGetWalletGroupsQuery(
    {
      orgId: organizationId
    },
    { skip: !organizationId }
  )

  const {
    data: sources,
    isLoading: loading,
    isError: isWalletFetchError,
    error: walletFetchError,
    refetch
  } = useGetWalletsQuery(
    {
      orgId: organizationId,
      params: { size, page, search, ...filter }
    },
    { skip: !organizationId }
  )

  const [triggerGetCryptocurrencies, { data: orgCrypto, isFetching: getCrytoFetching }] =
    useLazyGetOrganisationCryptocurrenciesQuery()

  useEffect(() => {
    if (!shouldFetchCrypto && sources?.items?.length && supportedChains?.length && organizationId) {
      triggerGetCryptocurrencies({
        organisationId: organizationId,
        params: {
          blockchainIds: supportedChains?.map((chain) => chain.id),
          walletIds: sources?.items?.map((item) => item.id)
        }
      })
    }
  }, [shouldFetchCrypto, sources, supportedChains])

  useEffect(() => {
    if (!getCrytoFetching && !shouldFetchCrypto) {
      setShouldFetchCrypto(true)
    }
  }, [getCrytoFetching])

  const tokenData = useMemo(() => {
    const list = orgCrypto?.data?.map((item) => {
      const tokenAddress = item.addresses.find((chain) => chain.blockchainId === selectedChain?.id)
      return {
        id: item.publicId,
        value: item.publicId,
        name: item.symbol,
        symbol: item.symbol,
        tokenAddress: tokenAddress?.address || '',
        decimal: tokenAddress?.decimal,
        image: item.image,
        isVerified: item.isVerified
      }
    })

    return _.uniqBy(list, 'id').sort((a: any, b: any) => {
      if (a.isVerified && !b.isVerified) return -1
      if (!a.isVerified && b.isVerified) return 1
      return 0
    })
  }, [selectedChain?.id, orgCrypto])

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
    if (!isWalletSyncing) {
      setShouldFetchCrypto(false)
      refetch()
    }
  }, [isWalletSyncing])

  const {
    data: memberData,
    isError: isGetAuthenticatedProfileError,
    error: getAuthenticatedProfileError
  } = useGetAuthenticatedProfileQuery({ orgId: String(organizationId) }, { skip: !organizationId })

  useEffect(() => {
    if (isGetAuthenticatedProfileError) {
      log.error(
        getAuthenticatedProfileError?.message ?? 'Error while fetching /members/me on wallets page',
        ['Error while fetching /members/me on wallets page'],
        {
          actualErrorObject: getAuthenticatedProfileError.data,
          errorStatusCode: getAuthenticatedProfileError.status
        },
        `${window.location.pathname}`
      )
    }
  }, [isGetAuthenticatedProfileError])

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

  const { sourcesBalance, totalSourcesUsdBalance } = useAppBalance({ sourceOfFund: sources })

  const countedWalletTabs = useMemo(
    () =>
      walletTabs.map((tab) => ({
        ...tab,
        count: tab.key === EWalletTab.WALLETS ? sources?.totalItems : groups?.length
      })),
    [groups?.length, sources?.totalItems]
  )

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0)
    setTextSearch(e.target.value)
  }
  const handleResetSearch = () => {
    setPage(0)
    setTextSearch('')
  }

  const handleChangeTab = (tab: string) => {
    setActiveTab(tab)
    setPage(0)
    setSize(process.env.NEXT_PUBLIC_MAXIMUM_TRANSACTIONS_HISTORY || '20')
  }

  const handleEditSourceOfFundAction = () => {
    setShowEditModalNotif(false)
  }

  const handleEditFlagSource = () => {
    setShowFlagWalletModal(false)
  }

  const handleCloseDeleteFundModal = () => {
    setShowDeleteFundNotif(false)
  }

  const handleCloseImportSuccessModal = () => {
    setShowSuccessImportModal(false)
  }

  const handleChangeDirection = () => {
    setDirection(!direction)
  }
  // getting individual item and delete
  const handleShowDeleteFundNotif = (fundId: string) => {
    const deleteWalletSource = sources.items.find((deleteItem) => deleteItem.id === fundId)
    setShowDeleteFundNotif(true)
    setSourceItem(deleteWalletSource)
    // setSelectedSourceId(fundId)
  }

  // getting only 1 item for every ID
  const handleEditSourceOfFund = (fundId: string) => {
    const source = sources.items.find((item) => item.id === fundId)
    setShowEditModalNotif(true)
    setSourceItem(source)
  }

  // getting fund name and wallet address for flagging (read-only)
  const handleFlagWalletModal = (fundId: string) => {
    const walletSource = sources.items.find((walletItem) => walletItem.id === fundId)
    setShowFlagWalletModal(true)
    setSourceItem(walletSource)
  }

  const funds: IScoreRatingProps[] = useMemo(() => {
    const list: IScoreRatingProps[] = []
    if (sources && sourcesBalance && sources?.items?.length > 0 && selectedChain?.id) {
      const { length } = sources.items
      for (let i = 0; i < length; i++) {
        const source = sources.items[i]
        const sourceBalance = sourcesBalance.find((item) => item.id === source.id)

        let balanceList = []
        if (source && source.balance && source.balance.blockchains) {
          for (const [key, balance] of Object.entries(source.balance.blockchains)) {
            balanceList = [...balanceList, ...(balance as any)]
          }
        }

        const availableAssets =
          source.balance &&
          (WHITELIST_ENV.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)
            ? balanceList && _.uniqBy(balanceList, 'cryptocurrency.publicId')
            : source.balance[selectedChain?.id] &&
              source.balance[selectedChain?.id].filter((item) => +item.balance > 0))

        const subTitle = (source.balance && availableAssets && availableAssets.length) || 0
        const blockchains = source.balance?.blockchains ? Object.keys(source.balance?.blockchains) : []
        const chains = supportedChains.filter(
          (item) => blockchains.findIndex((chain) => chain.toLowerCase() === item.id.toLowerCase()) > -1
        )

        list.push({
          id: source.id,
          fiatCurrency: sourceBalance?.fiatCurrency || 'USD',
          total: sourceBalance?.totalUsd,
          type:
            (source.sourceType === SourceType.GNOSIS && 'Safe') ||
            (source.sourceType === SourceType.ETH && 'EOA Wallet'),
          price: formatNumberWithCommasBasedOnLocale(String(sourceBalance?.totalUsd || 0), country?.iso),
          balance: sourceBalance?.totalUsd || 0,
          rating:
            (totalSourcesUsdBalance &&
              Number(totalSourcesUsdBalance) > 0 &&
              (Number(sourceBalance?.totalUsd) / Number(totalSourcesUsdBalance)) * 100) ||
            0,
          subTitle: `${subTitle} ${subTitle === 1 ? 'Asset' : 'Assets'}`,
          title: source.name || source.address,
          iconRight: deleteSvg,
          onButtonClick: (e) => {
            e.stopPropagation()
            handleShowDeleteFundNotif(source.id)
          },
          iconEdit: editSvg,
          // TODO - This is temporary - Anything that we get from the API we will assume that is available on the wallet
          supportedChains,
          onEditButton: (e) => {
            e.stopPropagation()
            handleEditSourceOfFund(source.id)
          },
          address: source && source.address,
          iconFlag: flagSvg,
          onFlagButton: (e) => {
            e.stopPropagation()
            handleFlagWalletModal(source.id)
          },
          flag: !!source.flaggedAt,
          lastUpdate: source.updatedAt,
          assets: availableAssets,
          group: source.group,
          chains
        })
      }
    }

    return list
  }, [sources, sourcesBalance, totalSourcesUsdBalance, selectedChain])

  const wallets: IScoreRatingProps[] = useMemo(() => {
    return (funds && funds.sort((a, b) => (b.balance > a.balance ? (direction ? 1 : -1) : direction ? -1 : 1))) || []
  }, [direction, funds])

  useEffect(() => {
    if (responseError) {
      setShowErrorModal(true)
      setShowImportedFund(false)
    }
    if (!responseError) {
      setShowErrorModal(false)
    }
  }, [responseError])

  const onWalletUpateSuccess = () => {
    refetch()
  }

  return (
    <FormProvider {...methods}>
      <Header>
        <Header.Left>
          <Header.Left.Title>Wallets</Header.Left.Title>
          {sources && sources?.items?.length > 0 && (
            <div className="pl-4">
              <SyncChip
                disabled={sources?.items?.length === 0}
                onClick={startWalletSync}
                isSyncing={isWalletSyncing}
                lastUpdated={lastUpdated}
              />
            </div>
          )}
        </Header.Left>

        {((sources && sources?.items && sources?.items?.length > 0) ||
          search ||
          Object.values(filter).some((value) => value.length > 0)) && (
          <div className="flex items-center">
            <div className="flex items-center" data-tip="add_source_of_funds" data-for="add_source_of_funds">
              {/* TODO tech debt: Create two buttons and toggle based on tab, instead of a single button */}
              <Button
                variant="black"
                type="button"
                disabled={isWalletSyncing}
                height={40}
                onClick={() => {
                  if (activeTab === EWalletTab.WALLETS) router.push(`/${organizationId}/wallets/import`)
                  else {
                    setAction('Create')
                    setShowCreateGroup(!showCreateGroup)
                  }
                }}
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
                label={activeTab === EWalletTab.WALLETS ? 'Import Wallet' : 'Create Wallet Group'}
              />
              {/* <button
                type="button"
                className={`${
                  isWalletSyncing ? 'bg-neutral-300 cursor-not-allowed' : 'bg-grey-900 hover:bg-grey-901'
                } rounded-[4px] text-white px-4 py-[10px] text-sm font-inter font-medium leading-5`}
                disabled={isWalletSyncing}
                onClick={() => {
                  if (activeTab === EWalletTab.WALLETS) router.push(`/${organizationId}/wallets/import`)
                  else {
                    setAction('Create')
                    setShowCreateGroup(!showCreateGroup)
                  }
                }}
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
              >
                {activeTab === EWalletTab.WALLETS ? 'Import Wallet' : 'Create Wallet Group'}
              </button> */}
            </div>
          </div>
        )}
      </Header>
      <View.Content>
        <div className="font-inter">
          {(sources && sources?.items && sources?.items?.length > 0) ||
          search ||
          Object.values(filter).some((value) => value.length > 0) ? (
            <UnderlineTabs
              tabs={countedWalletTabs}
              active={activeTab}
              setActive={handleChangeTab}
              classNameBtn="font-semibold text-sm px-6 py-[10px]"
              wrapperClassName="border-b-[1px] border-grey-200"
            >
              <TabItem key={EWalletTab.WALLETS}>
                <SourcesDataTable
                  size={size}
                  page={page}
                  filter={filter}
                  balanceDirection={direction}
                  onChangeDirection={handleChangeDirection}
                  tokensData={tokenData}
                  setPage={setPage}
                  setSize={setSize}
                  setFilter={setFilter}
                  totalItems={Number(sources?.totalItems)}
                  totalPages={Number(sources?.totalPages)}
                  data={wallets || []}
                  groupsData={groups}
                  textSearch={textSearch}
                  onChangeSearch={handleChangeSearch}
                  onResetSearch={handleResetSearch}
                  emptyState={
                    <div>
                      <img src="/svg/MoneyCircle.svg" alt="MoneyCircle" className="mx-auto" />

                      <Typography classNames="mt-6 text-center" color="dark" variant="heading3">
                        No Funds Found
                      </Typography>

                      <Typography classNames="mt-1 text-center" variant="heading3" color="dark">
                        Add funds by importing a wallet or safe
                      </Typography>
                    </div>
                  }
                />
              </TabItem>
              <TabItem key={EWalletTab.GROUPS}>
                <WalletGroup data={groups} />
              </TabItem>
            </UnderlineTabs>
          ) : loading ? (
            <Loading dark title="Fetching Data" />
          ) : (
            <SelectFundType
              onAddSafe={() => {
                router.push(`/${organizationId}/wallets/import/safe`)
              }}
              onAddWallet={() => {
                router.push(`/${organizationId}/wallets/import/eoa`)
              }}
              title="You do not have any wallets yet."
              subTitle="Select one of the following to import a wallet/safe."
            />
          )}

          <CreateGroupModal
            groups={groups}
            setShowModal={setShowCreateGroup}
            showModal={showCreateGroup}
            action={action}
          />

          {/* Import Fund Success/Error Modals */}
          {showSuccessImportModal && (
            <NotificationPopUp
              title="Successfully added fund"
              description="You may now tag your transactions and view your balances. Please note that synchronizing your transactions for the first-time could take a few minutes."
              type="success"
              setShowModal={setShowSuccessImportModal}
              showModal={showSuccessImportModal}
              onClose={() => {
                setAction('')
                setStatus(EProcessStatus.PENDING)
              }}
            />
          )}
          {showErrorModal && (
            <NotificationPopUp
              acceptText="Dismiss"
              title={
                responseError.includes('exists')
                  ? (responseError.includes('name') && `${action} Name Already Exists`) ||
                    (responseError.includes('address') && `${action} Address Already Exists`)
                  : `Unable to add ${action}`
              }
              description={
                responseError.includes('exists')
                  ? (responseError.includes('address') &&
                      `This ${action.toLowerCase()} address has already been added. Please try adding another address.`) ||
                    (responseError.includes('name') &&
                      `This ${action.toLowerCase()} name has already been added. Please try adding another name or edit the existing ${action.toLowerCase()} details.`)
                  : 'There was an issue adding the safe. Please try again.'
              }
              type="error"
              setShowModal={setShowErrorModal}
              showModal={showErrorModal}
              onClose={() => {
                setResponseError(undefined)
                setAction('')
                setStatus(EProcessStatus.PENDING)
                setShowErrorModal(false)
              }}
            />
          )}
          {/* delete fund action modal */}
          {showDeleteFundNotif && (
            <DeleteSourceModal
              walletSource={sourceItem}
              onModalClose={() => setShowDeleteFundNotif(false)}
              showModal={showDeleteFundNotif}
              setShowModal={setShowDeleteFundNotif}
              option
              onClose={handleCloseDeleteFundModal}
              title="Delete Wallet?"
              description="All transactions and assets on this wallet will also be deleted. You can import this wallet again later."
              acceptText="Delete Wallet"
              declineText="Back"
              memberData={memberData}
            />
          )}

          {/* edit modal action modal */}
          {showEditModalNotif && (
            <EditModal
              source={sourceItem}
              option
              onEditModalClose={() => setShowEditModalNotif(false)}
              showEditModal={showEditModalNotif}
              setShowEditModal={setShowEditModalNotif}
              onClose={handleEditSourceOfFundAction}
              title="Edit Source of Fund Detail"
              description="This edits your wallet name"
              setDisable={() => console.log('')}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
              acceptText="Save Change"
              declineText="Back"
              memberData={memberData}
              onSuccess={onWalletUpateSuccess}
            />
          )}

          {/* flag wallet modal action */}
          {showFlagWalletModal && (
            <FlagWalletModal
              walletSource={sourceItem}
              onFlagWalletModalClose={() => setShowFlagWalletModal(false)}
              showFlagWalletModal={showFlagWalletModal}
              setShowFlagWalletModal={setShowFlagWalletModal}
              title="Flag this Wallet"
              onClose={handleEditFlagSource}
              description="You're flagging this wallet."
              onAccept={() => setShowFlagWalletModal(true)}
              memberData={memberData}
            />
          )}
        </div>
      </View.Content>
    </FormProvider>
  )
}

export default SourceOfFunds
