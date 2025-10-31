import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/legacy/image'
import { Tabs } from '@/components-v2/Tab-v2'
import TabItem from '@/components/TabsComponent/TabItem'
import { taxLotsTabs } from './data'
import TaxLotsTable from '../TaxLotsTable'
import AssetsFilter from '../AssetsFilter'
import { useWeb3React } from '@web3-react/core'
import { useToken } from '@/hooks/useToken'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useGetAssetsQuery, useGetTaxLotsQuery } from '@/api-v2/assets-api'
import Loading from '@/components/Loading'
import { formatNumber } from '@/utils/formatNumber'
import { useAppSelector } from '@/state'
import { useGetWalletsQuery } from '@/slice/wallets/wallet-api'
import { selectedChainSelector, showBannerSelector } from '@/slice/platform/platform-slice'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import Breadcrumb from '@/components-v2/atoms/Breadcrumb'
import leftArrow from '@/public/svg/Dropdown.svg'
import Link from 'next/link'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import Typography from '@/components-v2/atoms/Typography'

export interface ITaxLot {
  id: string
  purchasedAt: string
  status: string
  walletGroupPublicId: string
  amountAvailable: string
  amountTotal: string
  costBasisAmount: string
  costBasisFiatCurrency: string
  costBasisPerUnit: string
  cryptocurrency: any
  updatedAt: string
  wallet: {
    name: string
  }
}

const TaxLots = () => {
  const router = useRouter()
  const { chainId } = useWeb3React()
  const selectedChain = useAppSelector(selectedChainSelector)

  const { supportedChain } = useToken(selectedChain?.id)
  const organizationId = useOrganizationId()

  const [asset, setAsset] = useState<any>()
  const [activeTab, setActiveTab] = useState<string>(taxLotsTabs[2].name)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [filter, setFilter] = useState([])
  const [direction, setDirection] = useState(false)
  const [loading, setLoading] = useState(true)

  const { data: wallets, isLoading: walletLoading } = useGetWalletsQuery({
    orgId: organizationId,
    params: { size: 999, page: 0 }
  })

  const options = useMemo(
    () => (wallets?.items?.length > 0 ? wallets?.items?.map((item) => ({ value: item.id, label: item.name })) : []),
    [wallets]
  )

  // Get asset totalbalance
  const { data: assets, isLoading } = useGetAssetsQuery(
    {
      orgId: organizationId,
      params: {
        blockchainIds: router.query.blockchainId,
        walletIds: filter?.map((item) => item.value)
      }
    },
    { skip: loading }
  )

  useEffect(() => {
    const filteredAsset = assets?.find(
      (item) =>
        item.cryptocurrency.publicId.toString() === router.query.id && item.blockchainId === router.query.blockchainId
    )
    if (filteredAsset) {
      setAsset(filteredAsset)
    } else if (assets && !filteredAsset) {
      setAsset((prev) => ({ ...prev, totalUnits: 0 }))
    }
  }, [assets, router.query.blockchainId, router.query.id])

  // Get taxlot by status
  const { data: allTaxLots, isLoading: allLoading } = useGetTaxLotsQuery(
    {
      orgId: organizationId,
      publicId: router.query.id,
      params: {
        size,
        page,
        walletIds: filter?.map((item) => item.value),
        direction: direction ? 'DESC' : 'ASC',
        blockchainId: router.query.blockchainId
      }
    },
    {
      skip: loading
    }
  )

  const { data: usedTaxLots, isLoading: usedLoading } = useGetTaxLotsQuery(
    {
      orgId: organizationId,
      publicId: router.query.id,
      params: {
        size,
        page,
        walletIds: filter?.map((item) => item.value),
        direction: direction ? 'DESC' : 'ASC',
        blockchainId: router.query.blockchainId,
        status: taxLotsTabs[1].value
      }
    },
    {
      skip: loading
    }
  )

  const { data: unusedTaxLots, isLoading: unusedLoading } = useGetTaxLotsQuery(
    {
      orgId: organizationId,
      publicId: router.query.id,
      params: {
        size,
        page,
        walletIds: filter?.map((item) => item.value),
        direction: direction ? 'DESC' : 'ASC',
        blockchainId: router.query.blockchainId,
        status: taxLotsTabs[2].value
      }
    },
    {
      skip: loading
    }
  )
  useEffect(() => {
    if (router.query.walletId && wallets?.items.length > 0) {
      const walletIds = Array.isArray(router.query.walletId) ? router.query.walletId : [router.query.walletId]
      const verifiedWallet = wallets.items.filter((item) => walletIds.includes(item.id))
      if (verifiedWallet.length > 0) {
        setFilter(
          verifiedWallet.map((wallet) => ({
            value: wallet.id,
            label: wallet.name
          }))
        )
      }
    }
    setLoading(false)
  }, [router.query.walletId, wallets])

  const chainName = useMemo(() => {
    const chain = supportedChain && supportedChain.find((item) => item.value === router.query.blockchainId)
    if (chain && chain?.label === 'Ethereum') {
      return `${chain?.label} mainnet`
    }
    return chain?.label
  }, [router.query.blockchainId, supportedChain])

  const countedTaxLotTab = useMemo(
    () =>
      taxLotsTabs.map((tab) => ({
        ...tab,
        count:
          tab.key === taxLotsTabs[0].name
            ? allTaxLots?.totalItems
            : tab.key === taxLotsTabs[1].name
            ? usedTaxLots?.totalItems
            : unusedTaxLots?.totalItems
      })),
    [allTaxLots?.totalItems, unusedTaxLots?.totalItems, usedTaxLots?.totalItems]
  )

  const handleChangeTab = (tab: string) => {
    setActiveTab(tab)
    setPage(0)
  }

  const handleFilter = (list: any[]) => {
    setFilter(list)
    setPage(0)
    // logic ...
  }

  const handleResetFilter = () => {
    setFilter([])
    setPage(0)
    // logic ...
  }

  const handleChangeDirection = () => {
    setDirection(!direction)
  }

  return allLoading || usedLoading || unusedLoading || isLoading || walletLoading ? (
    <Loading dark title="Fetching Data" />
  ) : (
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
          <div className="flex items-center">
            <Breadcrumb>
              <Link
                key={`/${organizationId}/assets`}
                href={`/${organizationId}/assets`}
                className="font-bold"
                legacyBehavior
              >
                <div className="flex gap-3 items-center cursor-pointer">
                  {asset && <img src={asset?.cryptocurrency?.image.small} alt="token-img" width={28} height={28} />}
                  {asset && asset.cryptocurrency.name} ({asset && asset.cryptocurrency.symbol})
                </div>
              </Link>
            </Breadcrumb>
            <div className="flex items-center">
              <DividerVertical height="h-5" />
              <Typography styleVariant="medium" variant="caption" color="primary">
                {chainName}
              </Typography>
              {asset && +asset.totalUnits > 0 && (
                <>
                  <DividerVertical height="h-5" />
                  <Typography color="primary" styleVariant="medium" variant="caption">
                    {asset && formatNumber(+asset.totalUnits)} {asset && asset.cryptocurrency.symbol}
                  </Typography>
                </>
              )}
            </div>
          </div>
        </div>
      </Header>
      <View.Content>
        <div className="text-base font-semibold leading-6">
          <div className="flex items-center justify-between">
            <h1 className="text-base text-neutral-900 leading-6 font-semibold mb-4">Tax lots</h1>
            <AssetsFilter
              name="Wallet"
              width="w-[256px]"
              filter={filter}
              options={options}
              onApply={handleFilter}
              onReset={handleResetFilter}
            />
          </div>
          <Tabs
            setActive={handleChangeTab}
            active={activeTab}
            tabs={countedTaxLotTab}
            activeStyle="text-neutral-900 z-[2] font-semibold"
            unActiveStyle="text-[#b5b5b3] border-b font-normal"
            classNameBtn="text-xs"
            className="flex flex-row-reverse mx-[2px]"
          >
            <TabItem key={taxLotsTabs[0].key}>
              <TaxLotsTable
                data={allTaxLots?.items}
                asset={asset?.cryptocurrency?.symbol}
                direction={direction}
                size={size}
                setSize={setSize}
                page={page}
                setPage={setPage}
                totalItems={allTaxLots?.totalItems}
                totalPages={allTaxLots?.totalPages}
                onChangeDirection={handleChangeDirection}
              />
            </TabItem>
            <TabItem key={taxLotsTabs[1].key}>
              <TaxLotsTable
                data={usedTaxLots?.items}
                asset={asset?.cryptocurrency?.symbol}
                direction={direction}
                size={size}
                setSize={setSize}
                page={page}
                setPage={setPage}
                totalItems={usedTaxLots?.totalItems}
                totalPages={usedTaxLots?.totalPages}
                onChangeDirection={handleChangeDirection}
              />
            </TabItem>
            <TabItem key={taxLotsTabs[2].key}>
              <TaxLotsTable
                data={unusedTaxLots?.items}
                asset={asset?.cryptocurrency?.symbol}
                direction={direction}
                size={size}
                setSize={setSize}
                page={page}
                setPage={setPage}
                totalItems={unusedTaxLots?.totalItems}
                totalPages={unusedTaxLots?.totalPages}
                onChangeDirection={handleChangeDirection}
              />
            </TabItem>
          </Tabs>
        </div>
      </View.Content>
    </>
  )
}

export default TaxLots
