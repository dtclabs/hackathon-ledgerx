/* eslint-disable arrow-body-style */

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
import WalletGroup from './components/WalletGroup/WalletGroup'
import { EWalletTab, walletTabs } from './types'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetWalletGroupsQuery } from '@/api-v2/wallet-group-api'
import Loading from '@/components/Loading'
import { useWalletSync } from '@/hooks-v2/useWalletSync'
import SyncChip from '@/components-v2/molecules/SyncChip'
import { log } from '@/utils-v2/logger'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import { FormProvider, useForm } from 'react-hook-form'
import { formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import Button from '@/components-v2/atoms/Button'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import MoneyIcon from '@/public/svg/MoneyCircle.svg'
import { useGetBalanceForWalletsGroupedByChainQuery } from '@/api-v2/balances-api'
import { uniqBy } from 'lodash'
import Typography from '@/components-v2/atoms/Typography'
import { ISource, IWalletParams, SourceType } from '@/slice/wallets/wallet-types'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { SelectWalletType } from './ImportWallet'
import useIsMobile from '@/hooks/useIsMobile'

const SourceOfFunds = () => {
  // Temporary demo switch to render sample data on the Wallets page
  const demoMode = false
  const router = useRouter()
  const isMobile = useIsMobile()
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

  const [groupChainsFilter, setGroupChainsFilter] = useState<string[]>([])
  const [direction, setDirection] = useState(true) // true is order by higher balance
  const [page, setPage] = useState(0)
  const [textSearch, setTextSearch] = useState('')
  const [textGroupSearch, setTextGroupSearch] = useState('')
  const { debouncedValue: search } = useDebounce(textSearch, 500)
  const { debouncedValue: groupSearch } = useDebounce(textGroupSearch, 500)
  const [size, setSize] = useState(process.env.NEXT_PUBLIC_MAXIMUM_TRANSACTIONS_HISTORY || '20')
  const [areAllWalletChainsSelected, setAreAllWalletChainsSelected] = useState<boolean>(isFeatureEnabledForThisEnv) // Default to true once deployed to all envs
  const [areAllGroupChainsSelected, setAreAllGroupChainsSelected] = useState<boolean>(isFeatureEnabledForThisEnv) // Default to true once deployed to all envs

  const organizationId = useOrganizationId()

  const supportedChains = useAppSelector(supportedChainsSelector)
  const uiSupportedChains = supportedChains

  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { fiatCurrency: fiatCurrencySetting, country } = useAppSelector(orgSettingsSelector)
  const { startWalletSync, lastUpdated } = useWalletSync({
    organisationId: organizationId
  })

  const [showDeleteFundNotif, setShowDeleteFundNotif] = useState(false)
  const [responseError, setResponseError] = useState<string>()
  const [showErrorModal, setShowErrorModal] = useState(false)
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
    isFetching: isWalletFetching,
    isError: isWalletFetchError,
    error: walletFetchError,
    refetch
  } = useGetWalletsQuery(
    {
      orgId: organizationId,
      params: { size, page, search, ...filter, includeCryptocurrencyMetadata: true }
    },
    { skip: !organizationId }
  )

  const { data: walletBalances, refetch: walletBalancesRefetch } = useGetBalanceForWalletsGroupedByChainQuery(
    {
      orgId: organizationId,
      params: { groupBy: 'walletId', secondGroupBy: 'blockchainId', blockchainIds: [...filter.blockchainIds] }
    },
    { skip: !organizationId }
  )

  const parsedWalletGroup = useMemo(() => {
    if (groups) {
      // search
      const searchedGroup = groupSearch
        ? groups?.filter((group) => group.name.toLowerCase().includes(groupSearch.trim().toLowerCase()))
        : [...groups]

      // chain filter

      const filteredGroup = groupChainsFilter?.length
        ? searchedGroup.filter((group) => groupChainsFilter.some((chain) => group.supportedBlockchains.includes(chain)))
        : [...searchedGroup]

      return filteredGroup
    }
    return []
  }, [groupChainsFilter, groupSearch, groups])

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

  // useEffect(() => {
  //   if (!isWalletSyncing) {
  //     refetch()
  //     walletBalancesRefetch()
  //   }
  // }, [isWalletSyncing])

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

  const handleChangeGroupSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0)
    setTextGroupSearch(e.target.value)
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
  }

  const handleWalletChainfilter = (chainIdSelected: string) => {
    if (filter.blockchainIds.includes(chainIdSelected)) {
      setFilter({ ...filter, blockchainIds: filter.blockchainIds.filter((chain) => chain !== chainIdSelected) })
      if (filter.blockchainIds.filter((chain) => chain !== chainIdSelected).length === 0) {
        setAreAllWalletChainsSelected(true)
      }
    } else {
      setFilter({ ...filter, blockchainIds: [...filter.blockchainIds, chainIdSelected] })
      setAreAllWalletChainsSelected(false)
    }
  }

  const handleAllWalletChainSelect = () => {
    setAreAllWalletChainsSelected(true)
    setFilter({ ...filter, blockchainIds: [] })
  }

  const handleGroupChainfilter = (chainIdSelected: string) => {
    if (groupChainsFilter.includes(chainIdSelected)) {
      setGroupChainsFilter(groupChainsFilter.filter((chain) => chain !== chainIdSelected))
      if (groupChainsFilter.filter((chain) => chain !== chainIdSelected).length === 0) {
        setAreAllGroupChainsSelected(true)
      }
    } else {
      setGroupChainsFilter([...groupChainsFilter, chainIdSelected])
      setAreAllGroupChainsSelected(false)
    }
  }
  const handleAllGroupChainSelect = () => {
    setAreAllGroupChainsSelected(true)
    setGroupChainsFilter([])
  }

  const funds: IScoreRatingProps[] = useMemo(() => {
    const list: IScoreRatingProps[] = []
    if (sources && walletBalances && sources?.items?.length > 0) {
      sources?.items?.forEach((source) => {
        let sourceBalance = 0
        const walletBalancesPerChain = walletBalances.groups[source.id]?.groups || {}
        Object?.keys(walletBalancesPerChain).forEach((chain) => {
          sourceBalance += parseFloat(walletBalancesPerChain[chain].value)
        }) // todo: change sourceBalance naming to totalBalance

        const walletCryptoCurrencies = source.ownedCryptocurrencies || {}
        const filteredCryptocurrencies = []
        Object.keys(walletCryptoCurrencies)
          .filter((chain) => (filter.blockchainIds.length > 0 ? filter.blockchainIds.includes(chain) : true))
          .forEach((chain) => {
            filteredCryptocurrencies.push(walletCryptoCurrencies[chain] || [])
          })
        const formattedCryptoCurrencies = (filteredCryptocurrencies.flat() as any[]).map((cryptocurrency) => {
          return {
            publicId: cryptocurrency.publicId,
            imageUrl: cryptocurrency.image.small || '',
            symbol: cryptocurrency.symbol
          }
        })

        const subTitle = (source.balance && formattedCryptoCurrencies && formattedCryptoCurrencies.length) || 0
        const blockchains = source.supportedBlockchains
        const chains = supportedChains.filter(
          (item) => blockchains?.findIndex((chain) => chain.toLowerCase() === item.id.toLowerCase()) > -1
        )

        list.push({
          id: source.id,
          fiatCurrency: fiatCurrencySetting?.code,
          total: sourceBalance,
          disabled: isWalletSyncing,
          type:
            (source.sourceType === SourceType.GNOSIS && 'Safe') ||
            (source.sourceType === SourceType.ETH && 'EOA Wallet'),
          price: formatNumberWithCommasBasedOnLocale(String(sourceBalance), country?.iso),
          balance: sourceBalance,
          subTitle: `${subTitle} ${subTitle === 1 ? 'Asset' : 'Assets'}`,
          title: source.name || source.address,
          iconRight: deleteSvg,
          onButtonClick: (e) => {
            e.stopPropagation()
            handleShowDeleteFundNotif(source.id)
          },
          iconEdit: editSvg,
          supportedChains,
          onEditButton: (e) => {
            e.stopPropagation()
            if (source.sourceType === SourceType.GNOSIS) {
              router.push(`/${organizationId}/wallets/${source.id}/edit/safe`)
            } else {
              router.push(`/${organizationId}/wallets/${source.id}/edit/eoa`)
            }
          },
          address: source && source.address,
          iconFlag: flagSvg,
          flag: !!source.flaggedAt,
          lastUpdate: source.updatedAt,
          assets: uniqBy(formattedCryptoCurrencies, 'publicId'),
          group: source.group,
          chains
        })
      })
    }

    return list
  }, [sources, walletBalances, isWalletSyncing])

  const wallets: IScoreRatingProps[] = useMemo(() => {
    return (funds && funds.sort((a, b) => (b.balance > a.balance ? (direction ? 1 : -1) : direction ? -1 : 1))) || []
  }, [direction, funds])

  // Determine whether to show main tables instead of import/empty state
  const shouldShowMainTables =
    demoMode ||
    (sources && sources?.items && sources?.items?.length > 0) ||
    search ||
    Object.values(filter).some((value) => value.length > 0)

  // Demo-mode pagination computations
  const demoTotalItems = 0
  const numericSize = Number(size) || 10
  const demoTotalPages = demoMode ? Math.max(1, Math.ceil(demoTotalItems / numericSize)) : 0
  const paginatedWallets = wallets

  useEffect(() => {
    if (responseError) {
      setShowErrorModal(true)
    }
    if (!responseError) {
      setShowErrorModal(false)
    }
  }, [responseError])

  const onWalletUpateSuccess = () => {
    refetch()
  }

  return (
    <div className="bg-white p-4 rounded-lg sm:px-4 sm:relative">
      <FormProvider {...methods}>
        <Header>
          <Header.Left>
            <Header.Left.Title>Wallet</Header.Left.Title>
            {/* {sources && sources?.items?.length > 0 && (
              <div className="pl-4">
                <SyncChip
                  disabled={sources?.items?.length === 0}
                  onClick={startWalletSync}
                  isSyncing={isWalletSyncing}
                  lastUpdated={lastUpdated}
                />
              </div>
            )} */}
          </Header.Left>

          {!demoMode &&
            ((sources && sources?.items && sources?.items?.length > 0) ||
              search ||
              Object.values(filter).some((value) => value.length > 0)) && (
              <div className="flex items-center">
                <div
                  className="flex items-center sm:absolute sm:top-4 sm:right-4"
                  data-tip="add_source_of_funds"
                  data-for="add_source_of_funds"
                >
                  {/* TODO tech debt: Create two buttons and toggle based on tab, instead of a single button */}
                  <Button
                    variant="black"
                    type="button"
                    disabled={isWalletSyncing}
                    height={isMobile ? 32 : 40}
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
                  {isWalletSyncing && (
                    <ReactTooltip
                      id="add_source_of_funds"
                      borderColor="#eaeaec"
                      border
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      place="top"
                      className="!opacity-100 !rounded-lg"
                    >
                      <Typography classNames="max-w-[250px]" variant="caption" color="black">
                        We are syncing transactions data. You will be able to add a wallet after the sync is completed.
                      </Typography>
                    </ReactTooltip>
                  )}
                </div>
              </div>
            )}
        </Header>
        <View.Content>
          <div className="font-inter">
            {shouldShowMainTables ? (
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
                    setPage={setPage}
                    setSize={setSize}
                    setFilter={setFilter}
                    totalPages={demoMode ? demoTotalPages : Number(sources?.totalPages)}
                    data={(paginatedWallets || []) as any}
                    groupsData={groups}
                    textSearch={textSearch}
                    onChangeSearch={handleChangeSearch}
                    onResetSearch={handleResetSearch}
                    areAllChainsSelected={areAllWalletChainsSelected}
                    supportedChains={uiSupportedChains}
                    hideSupportedChains
                    handleChainfilter={handleWalletChainfilter}
                    handleAllChainSelect={handleAllWalletChainSelect}
                    emptyState={
                      <div>
                        <EmptyData>
                          {/* {!isWalletFetching && <EmptyData.Icon icon={MoneyIcon} />} */}
                          <EmptyData.Title>
                            {loading ||
                            isWalletFetching ||
                            (!loading && !isWalletFetching && sources?.items?.length > 0 && wallets?.length === 0) ? (
                              <Loading dark title="Fetching Data" />
                            ) : (
                              'No wallets found for the applied filters'
                            )}
                          </EmptyData.Title>
                        </EmptyData>
                      </div>
                    }
                  />
                </TabItem>
                <TabItem key={EWalletTab.GROUPS}>
                  <WalletGroup
                    data={parsedWalletGroup}
                    supportedChains={uiSupportedChains}
                    areAllChainsSelected={areAllGroupChainsSelected}
                    handleChainfilter={handleGroupChainfilter}
                    handleAllChainSelect={handleAllGroupChainSelect}
                    groupChainsFilter={groupChainsFilter}
                    handleChangeSearch={handleChangeGroupSearch}
                  />
                </TabItem>
              </UnderlineTabs>
            ) : loading ? (
              <Loading dark title="Fetching Data" />
            ) : (
              <SelectWalletType />
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
          </div>
        </View.Content>
      </FormProvider>
    </div>
  )
}

export default SourceOfFunds
