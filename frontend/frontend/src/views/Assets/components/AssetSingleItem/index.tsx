import React, { useState, useMemo } from 'react'
import Image from 'next/legacy/image'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { Button } from '@/components-v2'
import ImpairModal from '../ImpairModal'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Decrease from '@/public/svg/Decrease.svg'
import Increase from '@/public/svg/Increase.svg'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import { useGetChainsQuery } from '@/api-v2/chain-api'
import { toNearestDecimal } from '@/utils-v2/numToWord'

export interface IAsset {
  blockchainId: string
  cryptocurrency: any
  currentFiatPrice: string
  fiatCurrency: string
  totalCostBasis: string
  totalCurrentFiatValue: string
  totalUnits: string
}

interface IAssetSingleItem {
  asset: IAsset
  walletIdsFilter: string[]
}

const AssetSingleItem: React.FC<IAssetSingleItem> = ({ asset, walletIdsFilter }) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const [showImpairModal, setShowImpairModal] = useState(false)
  const [showRevalueModal, setShowRevalueModal] = useState(false)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { fiatCurrency: fiatCurrencySetting, country: countrySetting } = useAppSelector(orgSettingsSelector)
  const { data: chainData } = useGetChainsQuery({})

  const handleShowTaxLots = (selectedAsset, blockchainId: string) => {
    if (selectedAsset) {
      let walletIdsQuery = ''
      if (walletIdsFilter?.length > 0) {
        walletIdsFilter.forEach((walletId) => {
          walletIdsQuery += `&walletId=${walletId}`
        })
      }
      router.push(
        `/${organizationId}/assets/${selectedAsset.cryptocurrency.publicId}?blockchainId=${blockchainId}${walletIdsQuery}`
      )
    }
  }

  const unrealizedGainOrLoss = Math.abs(+asset.totalCurrentFiatValue - +asset.totalCostBasis)
  const unrealizedGainOrLossPercentage =
    unrealizedGainOrLoss !== 0 || +asset.totalCostBasis !== 0
      ? Math.abs(unrealizedGainOrLoss / +asset.totalCostBasis) * 100
      : 0
  const isLoss = asset.totalCurrentFiatValue < asset.totalCostBasis

  const supportedChainsData = useMemo(
    () => chainData?.data?.filter((chain) => chain.id === asset.blockchainId),
    [asset.blockchainId, chainData?.data]
  )

  return (
    <div
      className="bg-white rounded-lg shadow-card-2 mx-2 py-4 pl-6 cursor-pointer"
      aria-hidden
      onClick={(e) => {
        e.stopPropagation()
        handleShowTaxLots(asset, asset.blockchainId)
      }}
    >
      <div className="border-b pb-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src={asset?.cryptocurrency?.image.small} width={28} height={28} alt="img-token" />
          <div className="ml-3 text-neutral-900 text-sm leading-[18px] font-semibold w-[135px]">
            {asset?.cryptocurrency?.name}
          </div>
          <DividerVertical height="h-5" space="mx-3" />
          <ChainList chains={supportedChainsData} />
        </div>
        {/* <div className="flex items-center gap-2 text-sm leading-5 font-medium">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowImpairModal(true)
                }}
                color="white"
              >
                Impair
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowRevalueModal(true)
                }}
                color="white"
              >
                Revalue
              </Button>
            </div> */}
      </div>
      <div className="mt-4 flex items-center">
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Total Units</div>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <div className="text-neutral-900 text-sm leading-5 mt-1 font-medium">
              {toNearestDecimal(asset.totalUnits.toString(), countrySetting?.iso, 18)} {asset?.cryptocurrency?.symbol}
            </div>
          )}
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Current Price</div>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <div className="text-neutral-900 text-sm leading-5 mt-1 font-medium">
              {`${fiatCurrencySetting?.symbol}${toNearestDecimal(
                asset.currentFiatPrice.toString(),
                countrySetting?.iso,
                2
              )} ${asset.fiatCurrency.toUpperCase()} / ${asset?.cryptocurrency?.symbol}`}
            </div>
          )}
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Total Current Value</div>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <div className="text-neutral-900 text-sm leading-5 mt-1 font-medium">
              {`${fiatCurrencySetting?.symbol}${toNearestDecimal(
                asset.totalCurrentFiatValue.toString(),
                countrySetting?.iso,
                2
              )} ${asset.fiatCurrency.toUpperCase()}`}
            </div>
          )}
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Total Cost Basis</div>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <div className="text-neutral-900 text-sm leading-5 mt-1 font-medium">
              {`${fiatCurrencySetting?.symbol}${toNearestDecimal(
                asset.totalCostBasis.toString(),
                countrySetting?.iso,
                2
              )} ${asset.fiatCurrency.toUpperCase()}`}
            </div>
          )}
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Unrealised Gains/Losses</div>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <div className="text-neutral-900 text-sm leading-5 mt-1 font-medium flex items-center">
              {unrealizedGainOrLoss !== 0 &&
                (isLoss ? (
                  <Image src={Decrease} width={14} height={14} />
                ) : (
                  <Image src={Increase} width={14} height={14} />
                ))}
              <div
                className={`ml-1 ${
                  unrealizedGainOrLoss === 0 ? 'text-neutral-900' : !isLoss ? 'text-[#0CB746]' : 'text-[#C61616]'
                }`}
              >
                {`${fiatCurrencySetting.symbol}${toNearestDecimal(
                  unrealizedGainOrLoss.toString(),
                  countrySetting?.iso,
                  2
                )} ${asset.fiatCurrency.toUpperCase()} (${toNearestDecimal(
                  unrealizedGainOrLossPercentage.toString(),
                  countrySetting?.iso,
                  2
                )}%)`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* {showImpairModal && (
            <ImpairModal
              showModal={showImpairModal}
              setShowModal={setShowImpairModal}
              asset={asset.cryptocurrency.symbol}
              showTimeSelect
              title="Impair"
            />
          )}
          {showRevalueModal && (
            <ImpairModal
              showModal={showRevalueModal}
              setShowModal={setShowRevalueModal}
              asset={asset.cryptocurrency.symbol}
              title="Revalue"
            />
          )} */}
    </div>
  )
}

export default AssetSingleItem
