import { api } from '@/api-v2'
import {
  useGetCollectionsQuery,
  useGetNftAggregateQuery,
  useGetNftsQuery,
  useGetSimplifiedCollectionsQuery
} from '@/api-v2/nft/nfts-api'
import { INft, INftCollection } from '@/api-v2/nft/nfts.type'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { Input } from '@/components-v2'
import { SideModal } from '@/components-v2/SideModal'
import MultiSelectCheckboxTab from '@/components-v2/atoms/MultiSelectCheckboxTab'
import Typography from '@/components-v2/atoms/Typography'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { SwitchButton } from '@/components-v2/molecules/SwitchButton'
import SyncChip from '@/components-v2/molecules/SyncChip'
import { Header, AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import { useNftSync } from '@/hooks-v2/useNftsSync'
import { useDebounce } from '@/hooks/useDebounce'
import AllChainsSvg from '@/public/svg/allChains.svg'
import ArrowLeft from '@/public/svg/arrowLeft.svg'
import DiamondIcon from '@/public/svg/icons/diamond-icon.svg'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { useAppDispatch, useAppSelector } from '@/state'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Filter from '@/views/MakePayment2/components/ImportDraftPaymentsModal/DraftFilterDropdown'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import CollectionRowItem from './components/CollectionRow/CollectionRowItem'
import DetailContent from './components/DetailContent/DetailContent'
import Footer from './components/Footer'
import NFTRowItem from './components/NFTRowItem'
import SettingButton from './components/SettingButton'
import { parseCollection } from './nft-utils'
import { CollectionsLoading, NFTsLoading } from './components/NFTsDashboardLoading'

interface INftParams {
  page?: number
  size?: number
  order?: string
  direction?: string
  walletIds?: { value: string; label: string }[]
  collectionIds?: { value: string; label: string }[]
  blockchainIds?: string[]
}

const MAX_PAGE_SIZE = 10

// Turn it to false for first part of release, as now we only support ETH
const ENABLE_BLOCKCHAIN_FILTER = false

const NFTPage: FC = () => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const dispatch = useAppDispatch()
  const isExistedData = useRef<boolean>(false)
  const detailRef = useRef(null)
  const listRef = useRef(null)
  const showBanner = useAppSelector(showBannerSelector)
  const orgSettings = useAppSelector(orgSettingsSelector)
  const chainIcons = useAppSelector(selectChainIcons)
  const supportedChains = useAppSelector(supportedChainsSelector)

  const [detailName, setDetailName] = useState<string>('')
  const [nftPageData, setNftPageData] = useState<INft[]>([])
  const [collectionPageData, setCollectionPageData] = useState<INftCollection[]>([])
  const [isGroupCollection, setIsGroupCollection] = useState(false)
  const [extendSettings, setExtendSettings] = useState({
    collapseAll: true,
    extendAll: false
  })

  // detail panel
  const [showBackBtn, setShowBackBtn] = useState(false)
  const [selectedNft, setSelectedNft] = useState<INft>(null)
  const [selectedCollection, setSelectedCollection] = useState<INftCollection>(null)

  const [search, setSearch] = useState('')
  const [nftParams, setNftParams] = useState<INftParams>({
    page: 0,
    size: MAX_PAGE_SIZE,
    walletIds: [],
    collectionIds: [],
    blockchainIds: []
  })
  const { debouncedValue: debouncedSearch } = useDebounce(search, 300)

  const { data: wallets } = useGetWalletsQuery({
    orgId: organizationId,
    params: { size: 999, page: 0 }
  })

  const parsedParams = useMemo(
    () => ({
      ...nftParams,
      walletIds: nftParams.walletIds.map((item) => item.value),
      collectionIds: nftParams.collectionIds.map((item) => item.value)
    }),
    [nftParams]
  )

  const {
    startNftSync,
    lastUpdated,
    isSyncing: isNftSyncing,
    hasSyncedBefore
  } = useNftSync({
    organizationId,
    onSyncSuccess: () => {
      setNftParams((prev) => ({ ...prev, page: 0 }))
      dispatch(api.util.invalidateTags(['nfts']))
    }
  })

  const { data: collectionList } = useGetSimplifiedCollectionsQuery(
    {
      organizationId
    },
    {
      skip: !organizationId
    }
  )

  const {
    data: collectionApiData,
    error: collectionError,
    isLoading: collectionLoading,
    isSuccess: collectionSuccess,
    isFetching: collectionFetching
  } = useGetCollectionsQuery(
    {
      organizationId,
      params: {
        ...parsedParams,
        search: debouncedSearch
      }
    },
    {
      skip: !organizationId || (!isGroupCollection && nftParams.page !== 0)
    }
  )

  const {
    data: nftApiData,
    error: nftError,
    isLoading: nftLoading,
    isSuccess: nftSuccess,
    isFetching: nftFetching
  } = useGetNftsQuery(
    {
      organizationId,
      params: {
        ...parsedParams,
        search: debouncedSearch
      }
    },
    {
      skip: !organizationId || (isGroupCollection && nftParams.page !== 0)
    }
  )
  const {
    data: nftAggregate,
    error: nftAggregateError,
    isLoading: nftAggregateLoading,
    isFetching: nftAggregateFetching
  } = useGetNftAggregateQuery(
    {
      organizationId,
      params: {
        ...parsedParams,
        size: 9999
      }
    },
    {
      skip: !organizationId || isGroupCollection
    }
  )

  const isGlobalLoading = Boolean(nftParams.page === 0 && (nftLoading || collectionLoading))

  useEffect(() => {
    setNftParams((prev) => ({ ...prev, page: 0 }))
  }, [debouncedSearch])

  const handleNewLimit = () => {
    setNftParams((prev) => ({ ...prev, page: nftParams.page + 1 }))
  }

  const handleSwitch = () => {
    setIsGroupCollection(!isGroupCollection)
    listRef.current.scrollTop = 0
    setNftParams((prev) => ({
      ...prev,
      page: 0,
      size: MAX_PAGE_SIZE
    }))
  }

  const handleOnSearch = (e: any) => {
    listRef.current.scrollTop = 0
    setSearch(e.target.value)
  }

  const handleSelectWallets = (_wallets: any[]) => {
    listRef.current.scrollTop = 0
    setNftParams((prev) => ({ ...prev, page: 0, walletIds: [..._wallets] }))
  }

  const handleSelectChain = (_chainId: string) => {
    if (nftParams.blockchainIds.includes(_chainId)) {
      const applyFilterArray = nftParams.blockchainIds.filter((chain) => chain !== _chainId)
      setNftParams((prev) => ({ ...prev, page: 0, blockchainIds: [...applyFilterArray] }))
    } else {
      setNftParams((prev) => ({ ...prev, page: 0, blockchainIds: [...nftParams.blockchainIds, _chainId] }))
    }
  }

  const handleSelectAllChain = () => {
    if (nftParams.blockchainIds.length > 0) {
      setNftParams((prev) => ({ ...prev, page: 0, blockchainIds: [] }))
    }
  }

  const handleSelectCollections = (_collections: any[]) => {
    listRef.current.scrollTop = 0
    setNftParams((prev) => ({ ...prev, page: 0, collectionIds: [..._collections] }))
  }

  const walletsOptions = useMemo(() => {
    if (wallets) {
      const mappingWallets = wallets.items.map((wallet) => ({
        value: wallet.id,
        address: wallet.address,
        label: wallet.name
      }))

      return mappingWallets
    }
    return []
  }, [wallets])

  const isFiltering = useMemo(
    () =>
      debouncedSearch ||
      nftParams.walletIds?.length ||
      nftParams.collectionIds?.length ||
      nftParams.blockchainIds?.length,
    [nftParams, debouncedSearch]
  )

  useEffect(() => {
    if (!collectionLoading && collectionSuccess) {
      const parsedData =
        collectionApiData?.items?.map((_collection) => parseCollection(_collection, supportedChains)) || []
      if (nftParams.page > 0) {
        setCollectionPageData((prev) => [...prev, ...parsedData])
      } else {
        setCollectionPageData(parsedData)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionApiData, collectionLoading])

  useEffect(() => {
    if (!nftLoading && nftSuccess) {
      if (nftParams.page > 0) {
        setNftPageData((prev) => [...prev, ...nftApiData.items])
      } else {
        setNftPageData(nftApiData?.items)
      }
    }
  }, [nftApiData, nftLoading])

  useEffect(() => {
    if (nftError || collectionError) toast.error('NFTs error.')
  }, [collectionError, nftError])

  useEffect(() => {
    if (!isExistedData.current && nftApiData?.items?.length) {
      isExistedData.current = true
    }
  }, [nftApiData])

  const handleSelectNft = (item) => {
    setSelectedNft(item)
  }
  const handleSelectNftCollection = (item) => {
    setSelectedCollection(item)
  }

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>NFTs</Header.Left.Title>
          <div className="pl-4">
            <SyncChip
              disabled={!wallets?.totalItems}
              onClick={startNftSync}
              isSyncing={isNftSyncing}
              lastUpdated={lastUpdated}
              title="Nfts"
            />
          </div>
        </Header.Left>
      </Header>
      <View.Content>
        {(isFiltering || isExistedData.current) && (
          <>
            {ENABLE_BLOCKCHAIN_FILTER && (
              <div className="flex mb-3 gap-x-3">
                <MultiSelectCheckboxTab
                  label="All Chains"
                  imageUrl={AllChainsSvg}
                  id="allChainsFilter"
                  onChange={handleSelectAllChain}
                  checked={
                    !nftParams.blockchainIds.length || nftParams.blockchainIds.length === supportedChains?.length
                  }
                  checkboxGroupName="chainsFilter"
                />
                {supportedChains?.map((chain) => (
                  <MultiSelectCheckboxTab
                    label={chain.name}
                    imageUrl={chain.imageUrl}
                    checked={nftParams.blockchainIds.includes(chain.id)}
                    onChange={() => handleSelectChain(chain.id)}
                    checkboxGroupName="chainsFilter"
                    id={chain.id}
                    key={chain.id}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-between h-10">
              <div className="w-1/3">
                <Input
                  onChange={handleOnSearch}
                  value={search}
                  classNames="text-sm h-[32px]"
                  isSearch
                  placeholder="Search by NFT name, ID or collection"
                  id="nft-search-input"
                />
              </div>
              <div className="flex items-center gap-3">
                <SwitchButton
                  label="Group by Collections"
                  className="h-[32px]"
                  check={isGroupCollection}
                  onCheck={handleSwitch}
                  loading={nftLoading || collectionLoading}
                />
                <div className="flex items-center gap-3">
                  <Filter
                    classNames="w-[210px]"
                    name="Collection"
                    dropdownHeight="max-h-[280px]"
                    value={nftParams.collectionIds || []}
                    options={
                      collectionList?.map((_collection) => ({
                        value: _collection.id,
                        label: _collection.name
                      })) || []
                    }
                    onChange={handleSelectCollections}
                    onClear={() => handleSelectCollections([])}
                  />
                  <Filter
                    name="Wallet"
                    dropdownHeight="max-h-[280px]"
                    value={nftParams.walletIds || []}
                    options={walletsOptions}
                    onChange={handleSelectWallets}
                    onClear={() => handleSelectWallets([])}
                  />
                  <SettingButton
                    isGroupCollection={isGroupCollection}
                    extendSettings={extendSettings}
                    setExtendSettings={setExtendSettings}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {!isGroupCollection ? (
          <div
            ref={listRef}
            className={`overflow-auto flex flex-col gap-4 mt-3 ${
              ENABLE_BLOCKCHAIN_FILTER
                ? showBanner
                  ? 'h-[calc(100vh-408px)]'
                  : 'h-[calc(100vh-340px)]'
                : showBanner
                ? 'h-[calc(100vh-366px)]'
                : 'h-[calc(100vh-298px)]'
            }`}
          >
            {isGlobalLoading && <NFTsLoading rows={2} />}
            {!isGlobalLoading &&
              nftPageData?.length > 0 &&
              nftPageData.map((_nft, index) => (
                <NFTRowItem
                  nft={_nft}
                  key={_nft.id}
                  settings={orgSettings}
                  chainIcons={chainIcons}
                  onSelectNft={handleSelectNft}
                  onSelectCollection={handleSelectNftCollection}
                  isLast={index === nftPageData.length - 1 && index + 1 < nftApiData?.totalItems}
                  onNewLimit={handleNewLimit}
                />
              ))}
            {!isGlobalLoading && !nftPageData?.length && (
              <div
                className={`${
                  showBanner ? 'h-[calc(100vh-366px)]' : 'h-[calc(100vh-298px)]'
                } flex justify-center items-center flex-col`}
              >
                {!wallets?.totalItems ? (
                  <EmptyData>
                    <EmptyData.Icon icon={DiamondIcon} background height={32} width={32} />
                    <EmptyData.Title>No NFTs found</EmptyData.Title>
                    {Object.values(nftParams).every((param) => !param || !param?.length) && (
                      <>
                        <EmptyData.Subtitle>Import your wallet to view NFTs.</EmptyData.Subtitle>
                        <EmptyData.CTA
                          label="Import Wallet"
                          onClick={() => router.push(`/${organizationId}/wallets`)}
                        />
                      </>
                    )}
                  </EmptyData>
                ) : (
                  <EmptyData>
                    <EmptyData.Icon icon={DiamondIcon} background height={32} width={32} />
                    <EmptyData.Title>
                      {isNftSyncing
                        ? 'Syncing NFTs'
                        : Object.values(nftParams).every((param) => !param || !param?.length)
                        ? hasSyncedBefore
                          ? 'No NFTs found'
                          : "You haven't synced your NFTs yet."
                        : 'No NFTs found'}
                    </EmptyData.Title>
                    {Object.values(nftParams).every((param) => !param || !param?.length) && !isNftSyncing && (
                      <>
                        <EmptyData.Subtitle>
                          {hasSyncedBefore ? 'You can sync again to update the data.' : 'Sync now to track your NFTs.'}
                        </EmptyData.Subtitle>
                        <EmptyData.CTA
                          label={hasSyncedBefore ? 'Sync Again' : 'Sync Now'}
                          disabled={isNftSyncing}
                          onClick={() => startNftSync()}
                        />
                      </>
                    )}
                  </EmptyData>
                )}
              </div>
            )}
            {!isGlobalLoading && nftPageData?.length > 0 && nftFetching && <NFTsLoading rows={2} />}
          </div>
        ) : (
          <div
            ref={listRef}
            className={`overflow-auto flex flex-col gap-4 mt-3 ${
              ENABLE_BLOCKCHAIN_FILTER
                ? showBanner
                  ? 'h-[calc(100vh-346px)]'
                  : 'h-[calc(100vh-288px)]'
                : showBanner
                ? 'h-[calc(100vh-304px)]'
                : 'h-[calc(100vh-236px)]'
            }`}
          >
            {isGlobalLoading && <CollectionsLoading rows={2} />}
            {!isGlobalLoading &&
              collectionPageData?.length > 0 &&
              collectionPageData.map((_collection, index) => (
                <CollectionRowItem
                  key={_collection.id}
                  collection={_collection}
                  chainIcons={chainIcons}
                  orgSettings={orgSettings}
                  extendSettings={extendSettings}
                  onSelectCollection={handleSelectNftCollection}
                  onSelectNft={handleSelectNft}
                  setExtendSettings={setExtendSettings}
                  blockChainsFilter={nftParams.blockchainIds}
                  isLast={index === collectionPageData.length - 1 && index + 1 < collectionApiData?.totalItems}
                  newLimit={() => handleNewLimit()}
                />
              ))}
            {!isGlobalLoading && !collectionPageData?.length && (
              <div
                className={`${
                  showBanner ? 'h-[calc(100vh-342px)]' : 'h-[calc(100vh-274px)]'
                } flex justify-center items-center flex-col`}
              >
                <EmptyData>
                  <EmptyData.Icon icon={DiamondIcon} />
                  <EmptyData.Title>
                    {Object.values(nftParams).every((param) => !param || !param?.length)
                      ? 'No NFT Found'
                      : 'No NFT Search Result Found'}
                  </EmptyData.Title>
                </EmptyData>
              </div>
            )}
            {!isGlobalLoading && collectionPageData?.length > 0 && collectionFetching && (
              <CollectionsLoading rows={2} />
            )}
          </div>
        )}
      </View.Content>
      {!isGroupCollection && (
        <View.Footer extraClassName="!p-0">
          {nftAggregate && nftPageData.length !== 0 && <Footer settings={orgSettings} aggregate={nftAggregate} />}
        </View.Footer>
      )}
      <SideModal
        renderActionButtons={false}
        title={
          <div className="flex flex-row items-center gap-1">
            {showBackBtn && (
              <Image
                className="cursor-pointer"
                onClick={() => {
                  detailRef.current.backToCollection()
                }}
                src={ArrowLeft}
                width={40}
              />
            )}
            <Typography variant="heading2">{detailName}</Typography>
          </div>
        }
        modalWidth="w-[1280px]"
        showModal={!!selectedNft || !!selectedCollection}
        setShowModal={() => {
          setSelectedNft(null)
          setSelectedCollection(null)
        }}
        onClose={() => {
          setShowBackBtn(false)
          setSelectedNft(null)
          setSelectedCollection(null)
        }}
      >
        <DetailContent
          isClose={!selectedNft && !selectedCollection}
          chainIcons={chainIcons}
          selectedNft={selectedNft}
          selectedCollection={selectedCollection}
          setDetailName={setDetailName}
          setShowBackBtn={setShowBackBtn}
          detailRef={detailRef}
        />
      </SideModal>
    </>
  )
}

export default NFTPage
