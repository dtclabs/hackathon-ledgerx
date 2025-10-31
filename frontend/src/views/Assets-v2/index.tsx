import React, { useEffect, useState, useMemo } from 'react'
import AssetsSort from './components/AssetSort'
import AssetItem from './components/AssetItem'
import { useToken } from '@/hooks/useToken'
import { useAppSelector } from '@/state'
import { sortData } from './components/AssetSort/data'
import { useDebounce } from '@/hooks/useDebounce'
import AssetsFilter from './components/AssetsFilter'
import { useGetAssetCryptocurrenciesQuery, useGetAssetsQuery } from '@/api-v2/assets-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Loading from '@/components/Loading'
import AssetIcon from '@/public/svg/asset-icon.svg'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { Button, Input } from '@/components-v2'
import { useRouter } from 'next/dist/client/router'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import Decimal from 'decimal.js'
import AssetSettings from './components/AssetSettings'
import AssetSingleItem from './components/AssetSingleItem'
import { selectAssetSettings } from '@/slice/assets/asset-selectors'
import MultiSelectCheckboxTab from '@/components-v2/atoms/MultiSelectCheckboxTab'
import allChainsSvg from '@/public/svg/allChains.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import Typography from '@/components-v2/atoms/Typography'
import Assetsv2Loading from './assetsv2Loading'

export interface IAssetData {
  id: string
  networks: any
  name: string
  symbol: string
  currentFiatPrice: string
  fiatCurrency: string
  totalUnits: string
  totalCurrentFiatValue: string
  totalCostBasis: string
  image: any
}

export interface ISupportedChain {
  id: string
  isGrayedOut: boolean
}

export interface ISettingOptions {
  view: 'group' | 'single'
  expand: boolean
  collapse: boolean
}

const Assets = () => {
  const selectedChain = useAppSelector(selectedChainSelector)
  const { allSupportedToken, supportedChain } = useToken(selectedChain?.id)
  const router = useRouter()
  const showBanner = useAppSelector(showBannerSelector)
  const assetSettings = useAppSelector(selectAssetSettings)
  const supportedChains = useAppSelector(supportedChainsSelector)

  const organizationId = useOrganizationId()
  const [textSearch, setTextSearch] = useState('')
  const { debouncedValue: search } = useDebounce(textSearch, 300)
  const [sortBy, setSortBy] = useState(sortData[0])
  const [filter, setFilter] = useState({ blockchainIds: [], walletIds: [], cryptocurrencyIds: [] })
  const [isViewAll, setIsViewAll] = useState(false)
  const [hasZeroValueAssets, setHasZeroValueAssets] = useState<boolean>(false)
  const [settings, setSettings] = useState<ISettingOptions>(assetSettings)
  const [areAllChainsSelected, setAreAllChainsSelected] = useState<boolean>(isFeatureEnabledForThisEnv) // Default to true once deployed to all envs
  const [filterChains, setFilterChains] = useState<string[]>([])
  const {
    data: assetsFetchedFromAPI,
    isLoading,
    refetch
  } = useGetAssetsQuery(
    {
      orgId: organizationId,
      params: {
        blockchainIds: filter.blockchainIds.length > 0 ? filter.blockchainIds?.map((chain) => chain.value) : null,
        walletIds: filter.walletIds.length > 0 ? filter.walletIds?.map((wallet) => wallet.value) : null,
        cryptocurrencyIds:
          filter.cryptocurrencyIds.length > 0
            ? filter.cryptocurrencyIds?.map((cryptocurrency) => cryptocurrency.value)
            : null,
        nameOrSymbol: search
      }
    },
    { skip: !organizationId }
  )
  const { data: assetCryto, isLoading: assetCrytoLoading } = useGetAssetCryptocurrenciesQuery(
    {
      orgId: organizationId,
      blockchainIds: []
    },
    { skip: !organizationId }
  )

  useEffect(() => {
    refetch()
  }, [])

  const { data: wallet, isLoading: walletLoading } = useGetWalletsQuery(
    {
      orgId: organizationId,
      params: { size: 999, page: 0 }
    },
    { skip: !organizationId }
  )

  const walletOptions = useMemo(() => {
    if (wallet?.items.length > 0) {
      return wallet.items.map((item) => ({
        value: item.id,
        label: item.name
      }))
    }
    return []
  }, [wallet])

  const cryptocurrenciesOptions = useMemo(
    () =>
      assetCryto?.length
        ? assetCryto?.map((item) => ({
            value: item.publicId,
            label: item.symbol,
            imageUrl: item.image.small
          }))
        : [],
    [assetCryto]
  )

  const assetChainsMap = useMemo(() => {
    const ASSET_CHAIN_MAP: { [symbol: string]: ISupportedChain[] } = {}

    assetsFetchedFromAPI?.forEach((asset) => {
      if (ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol]) {
        if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || areAllChainsSelected) {
          ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [
            ...ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol],
            { id: asset?.blockchainId, isGrayedOut: false }
          ]
        } else {
          ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [
            ...ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol],
            { id: asset?.blockchainId, isGrayedOut: true }
          ]
        }
      } else {
        if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || areAllChainsSelected) {
          ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [{ id: asset?.blockchainId, isGrayedOut: false }]
        } else {
          ASSET_CHAIN_MAP[asset?.cryptocurrency?.symbol] = [{ id: asset?.blockchainId, isGrayedOut: true }]
        }
      }
    })

    return ASSET_CHAIN_MAP
  }, [assetsFetchedFromAPI, filterChains])

  const assets = useMemo(() => {
    setHasZeroValueAssets(false)
    if (settings.view === 'group') {
      const ASSET_MAP: { [symbol: string]: IAssetData } = {}

      assetsFetchedFromAPI?.forEach((asset) => {
        if (ASSET_MAP[asset?.cryptocurrency?.symbol]) {
          if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || areAllChainsSelected) {
            ASSET_MAP[asset?.cryptocurrency?.symbol].networks.push(asset)
            ASSET_MAP[asset?.cryptocurrency?.symbol].totalCurrentFiatValue = Decimal.add(
              ASSET_MAP[asset?.cryptocurrency?.symbol].totalCurrentFiatValue,
              asset.totalCurrentFiatValue
            ).toString()
            ASSET_MAP[asset?.cryptocurrency?.symbol].totalUnits = Decimal.add(
              ASSET_MAP[asset?.cryptocurrency?.symbol].totalUnits,
              asset.totalUnits
            ).toString()
            ASSET_MAP[asset?.cryptocurrency?.symbol].totalCostBasis = Decimal.add(
              ASSET_MAP[asset?.cryptocurrency?.symbol].totalCostBasis,
              asset.totalCostBasis
            ).toString()
          }
        } else {
          if ((filterChains.length > 0 && filterChains.includes(asset.blockchainId)) || areAllChainsSelected) {
            ASSET_MAP[asset?.cryptocurrency?.symbol] = {
              id: asset?.cryptocurrency?.publicId,
              networks: [asset],
              name: asset?.cryptocurrency?.name,
              symbol: asset?.cryptocurrency?.symbol,
              currentFiatPrice: asset.currentFiatPrice,
              fiatCurrency: asset.fiatCurrency,
              totalUnits: asset.totalUnits,
              totalCurrentFiatValue: asset.totalCurrentFiatValue,
              totalCostBasis: asset.totalCostBasis,
              image: asset?.cryptocurrency?.image
            }
          }
        }
      })

      if (Object.entries(ASSET_MAP).length > 0) {
        const assetList = Object.entries(ASSET_MAP).map(([currency, value]: [string, IAssetData]) => ({
          ...value,
          name: `${value?.name} (${currency})`
        }))
        setHasZeroValueAssets(assetList.some((item) => item.totalCurrentFiatValue === '0'))
        const sortedList = !isViewAll ? assetList.filter((item) => item.totalCurrentFiatValue !== '0') : [...assetList]
        switch (sortBy) {
          case sortData[0]:
            return sortedList?.sort((a, b) => (+a.totalCurrentFiatValue < +b.totalCurrentFiatValue ? 1 : -1))
          case sortData[1]:
            return sortedList?.sort((a, b) => (+a.totalCurrentFiatValue > +b.totalCurrentFiatValue ? 1 : -1))
          case sortData[2]:
            return sortedList?.sort((a, b) => (+a.totalUnits < +b.totalUnits ? 1 : -1))
          case sortData[3]:
            return sortedList?.sort((a, b) => (+a.totalUnits > +b.totalUnits ? 1 : -1))
          default:
            return sortedList
        }
      }
    } else if (settings.view === 'single') {
      if (assetsFetchedFromAPI) {
        const filteredList =
          filterChains.length > 0
            ? assetsFetchedFromAPI.filter((asset) => filterChains.includes(asset.blockchainId))
            : assetsFetchedFromAPI
        const list = !isViewAll ? filteredList.filter((item) => item.totalCurrentFiatValue !== '0') : [...filteredList]
        setHasZeroValueAssets(filteredList.some((item) => item.totalCurrentFiatValue === '0'))
        switch (sortBy) {
          case sortData[0]:
            return list?.sort((a, b) => (+a.totalCurrentFiatValue < +b.totalCurrentFiatValue ? 1 : -1))
          case sortData[1]:
            return list?.sort((a, b) => (+a.totalCurrentFiatValue > +b.totalCurrentFiatValue ? 1 : -1))
          case sortData[2]:
            return list?.sort((a, b) => (+a.totalUnits < +b.totalUnits ? 1 : -1))
          case sortData[3]:
            return list?.sort((a, b) => (+a.totalUnits > +b.totalUnits ? 1 : -1))
          default:
            return list
        }
      }
    }
    return []
  }, [assetsFetchedFromAPI, isViewAll, settings.view, sortBy, filterChains, areAllChainsSelected])

  const handleResetSearch = () => {
    setTextSearch('')
  }

  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsViewAll(true)
    setTextSearch(e.target.value)
  }

  useEffect(() => {
    if (!search) {
      setIsViewAll(false)
    }
  }, [search])

  const handleSort = (item) => {
    setSortBy(item)
  }

  const handleFilterByBlockChain = (list: any[]) => {
    setFilter({ ...filter, blockchainIds: [...list] })
    // logic ...
  }
  const handleResetBlockChainFilter = () => {
    setFilter({ ...filter, blockchainIds: [] })
  }
  const handleFilterByWallet = (list: any[]) => {
    setFilter({ ...filter, walletIds: [...list] })
  }
  const handleResetWalletFilter = () => {
    setFilter({ ...filter, walletIds: [] })
  }
  const handleFilterByCryptoCurrency = (cryptocurrencyIds: any[]) => {
    setFilter({ ...filter, cryptocurrencyIds })
  }
  const handleResetCryptoCurrencyFilter = () => {
    setFilter({ ...filter, cryptocurrencyIds: [] })
  }

  const handleImportWallet = () => {
    router.push(`/${router.query.organizationId}/wallets`)
  }

  const handleViewAll = () => {
    setIsViewAll(true)
  }
  const handleHideAll = () => {
    setIsViewAll(false)
  }

  const handleAllChainSelect = () => {
    setAreAllChainsSelected(true)
    if (filterChains.length > 0) {
      setFilterChains([])
    }
  }

  const handleChainfilter = (chainIdSelected: string) => {
    if (filterChains.includes(chainIdSelected)) {
      const applyFilterArray = filterChains.filter((chain) => chain !== chainIdSelected)
      setFilterChains(applyFilterArray)
      if (applyFilterArray.length === 0) {
        setAreAllChainsSelected(true)
      }
    } else {
      setFilterChains([...filterChains, chainIdSelected])
      setAreAllChainsSelected(false)
    }
  }

  const getUIForZeroAssets = () => {
    let displayMessage
    if (filterChains.length > 0) {
      displayMessage = 'There are no assets in the selected chain.'
    } else if (assetsFetchedFromAPI.length > 0 && assets.length === 0) {
      displayMessage = 'All assets in this wallet have zero balance'
    } else {
      displayMessage = 'There are no assets in your selected wallets.'
    }
    return (
      <div className="border p-3 rounded-lg border-grey-200">
        <Typography variant="body2" styleVariant="semibold">
          {displayMessage}
        </Typography>
      </div>
    )
  }
  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>Assets</Header.Left.Title>
        </Header.Left>
      </Header>
      <View.Content className="overflow-hidden">
        {isLoading || walletLoading ? (
          <Assetsv2Loading />
        ) : (assetsFetchedFromAPI && assetsFetchedFromAPI.length > 0) || search || filter.walletIds.length > 0 ? (
          <div className="pt-2">
            {isFeatureEnabledForThisEnv && (
              <div className="flex mb-5 gap-x-3">
                <MultiSelectCheckboxTab
                  label="All Chains"
                  imageUrl={allChainsSvg}
                  id="allChainsFilter"
                  onChange={handleAllChainSelect}
                  checked={areAllChainsSelected}
                  checkboxGroupName="chainsFilter"
                />
                {supportedChains?.map((chain) => (
                  <MultiSelectCheckboxTab
                    label={chain.name}
                    imageUrl={chain.imageUrl}
                    checked={filterChains.includes(chain.id)}
                    onChange={() => handleChainfilter(chain.id)}
                    checkboxGroupName="chainsFilter"
                    id={chain.id}
                    key={chain.id}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              {/* Search bar */}
              <div className="w-1/4">
                <Input
                  placeholder="Search by asset name or symbol"
                  id="wallet-search"
                  onChange={handleChangeText}
                  isSearch
                  classNames="h-[34px] text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <AssetsSort sortBy={sortBy} onSort={handleSort} />
                <AssetsFilter
                  className="text-sm"
                  width="w-[210px]"
                  name="Wallet"
                  filter={filter.walletIds || []}
                  options={walletOptions}
                  onApply={handleFilterByWallet}
                  onReset={handleResetWalletFilter}
                />
                <AssetsFilter
                  className="text-sm"
                  width="w-[210px]"
                  name="Asset"
                  filter={filter.cryptocurrencyIds || []}
                  options={cryptocurrenciesOptions}
                  onApply={handleFilterByCryptoCurrency}
                  onReset={handleResetCryptoCurrencyFilter}
                />
                <AssetSettings settings={settings} setSettings={setSettings} />
              </div>
            </div>
            <div className="flex flex-col items-center w-full">
              <div
                className={`${
                  showBanner ? 'h-[calc(100vh-368px)]' : 'h-[calc(100vh-300px)]'
                } mt-3 overflow-auto scrollbar flex flex-col gap-4 w-full py-4`}
              >
                {assets && assets.length > 0
                  ? assets.map((asset) =>
                      settings.view === 'group' ? (
                        <AssetItem
                          key={`${asset.id}`}
                          asset={asset}
                          assetChains={assetChainsMap[asset.symbol]}
                          suportedToken={allSupportedToken}
                          supportedChain={supportedChain}
                          setSettings={setSettings}
                          settings={settings}
                          walletIdsFilter={filter.walletIds?.map((item) => item.value)}
                        />
                      ) : (
                        <AssetSingleItem
                          key={`${asset?.cryptocurrency.publicId}_${asset?.blockchainId}`}
                          asset={asset}
                          suportedToken={allSupportedToken}
                          supportedChain={supportedChain}
                          walletIdsFilter={filter.walletIds?.map((item) => item.value)}
                        />
                      )
                    )
                  : getUIForZeroAssets()}
                {assetsFetchedFromAPI?.length > 0 &&
                  !isViewAll &&
                  assets.length < assetsFetchedFromAPI.length &&
                  hasZeroValueAssets && (
                    <div className="flex items-center text-center mx-auto gap-2 mt-2 pr-6">
                      <Typography variant="caption">Token with zero balances are not displayed</Typography>
                      <Button size="xs" color="secondary" onClick={handleViewAll}>
                        View All
                      </Button>
                    </div>
                  )}
                {assets && assets.length > 0 && !search && assets?.some((item) => +item.totalUnits === 0) && (
                  <div className="flex items-center text-center mx-auto gap-2 mt-2 pr-6">
                    <Typography variant="caption">Token with zero balances are displayed</Typography>
                    <Button size="xs" color="secondary" onClick={handleHideAll}>
                      Hide All
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center">
            <EmptyData>
              <EmptyData.Icon icon={AssetIcon} />
              <EmptyData.Title>
                {wallet?.totalItems === 0 ? 'You require a wallet to view assets' : 'No assets found'}
              </EmptyData.Title>
              <EmptyData.Subtitle>
                {wallet?.totalItems === 0 ? 'Add a wallet to view your assets' : ''}
              </EmptyData.Subtitle>
              <EmptyData.CTA onClick={handleImportWallet} label="Import Wallet" />
            </EmptyData>
          </div>
        )}
      </View.Content>
    </>
  )
}

export default Assets
