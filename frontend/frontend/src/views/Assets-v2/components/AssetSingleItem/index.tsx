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
import Typography from '@/components-v2/atoms/Typography'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import AssetChainGroupImage from '@/components-v2/molecules/AssetChainGroupImage'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'

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
  suportedToken: any
  supportedChain: any
  walletIdsFilter: string[]
}

const AssetSingleItem: React.FC<IAssetSingleItem> = ({ asset, suportedToken, supportedChain, walletIdsFilter }) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const [showImpairModal, setShowImpairModal] = useState(false)
  const [showRevalueModal, setShowRevalueModal] = useState(false)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const chainIcons = useAppSelector(selectChainIcons)
  const supportedChains = useAppSelector(supportedChainsSelector)

  const { fiatCurrency: fiatCurrencySetting, country: countrySetting } = useAppSelector(orgSettingsSelector)

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
  const isLoss = +asset.totalCurrentFiatValue < +asset.totalCostBasis

  const chainName = useMemo(() => {
    const chain = supportedChains?.find((item) => item.id === asset.blockchainId)
    if (chain) {
      return chain.name.split(' ')[0]
    }
    return ''
  }, [asset.blockchainId, supportedChains])

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
          <AssetChainGroupImage
            assetImageUrl={asset?.cryptocurrency?.image.small}
            chainImageUrl={chainIcons[asset?.blockchainId]}
          />
          <Typography classNames="ml-3 w-[135px]" color="primary" variant="body2" styleVariant="semibold">
            {asset?.cryptocurrency?.name}
          </Typography>
          <DividerVertical height="h-5" space="mx-3" />
          <Typography variant="body2">{chainName}</Typography>
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
          <Typography styleVariant="semibold" variant="caption" color="secondary">
            Total Units
          </Typography>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <Typography variant="body2" classNames="mt-1">
              {toNearestDecimal(asset.totalUnits.toString(), countrySetting?.iso, 18)} {asset?.cryptocurrency?.symbol}
            </Typography>
          )}
        </div>
        <div className="w-1/5">
          <Typography variant="caption" styleVariant="semibold" color="secondary">
            Current Price
          </Typography>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <Typography variant="body2" classNames="mt-1">
              {`${fiatCurrencySetting?.symbol}${toNearestDecimal(
                asset.currentFiatPrice.toString(),
                countrySetting?.iso,
                2
              )} ${asset.fiatCurrency.toUpperCase()} / ${asset?.cryptocurrency?.symbol}`}
            </Typography>
          )}
        </div>
        <div className="w-1/5">
          <Typography variant="caption" styleVariant="semibold" color="secondary">
            Total Current Value
          </Typography>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              shortText={
                <Typography variant="body2" classNames="mt-1">
                  {toNearestDecimal(asset.totalCurrentFiatValue.toString(), countrySetting?.iso, 2) === '0' &&
                  asset.totalCurrentFiatValue !== '0'
                    ? `~${fiatCurrencySetting.symbol}0.00 ${asset.fiatCurrency}`
                    : `${fiatCurrencySetting?.symbol}${toNearestDecimal(
                        asset.totalCurrentFiatValue.toString(),
                        countrySetting?.iso,
                        2
                      )} ${asset.fiatCurrency.toUpperCase()}`}
                </Typography>
              }
              text={
                <Typography variant="body2">
                  {toNearestDecimal(asset.totalCurrentFiatValue.toString(), countrySetting?.iso, 2) === '0' &&
                  asset.totalCurrentFiatValue !== '0'
                    ? parseFloat(asset.totalCurrentFiatValue).toFixed(10)
                    : asset.totalCurrentFiatValue}
                </Typography>
              }
            />
          )}
        </div>
        <div className="w-1/5">
          <Typography variant="caption" styleVariant="semibold" color="secondary">
            Total Cost Basis
          </Typography>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              shortText={
                <Typography variant="body2" classNames="mt-1">
                  {toNearestDecimal(asset.totalCostBasis.toString(), countrySetting?.iso, 2) === '0' &&
                  asset.totalCostBasis !== '0'
                    ? `~${fiatCurrencySetting.symbol}0.00 ${asset.fiatCurrency}`
                    : `${fiatCurrencySetting?.symbol}${toNearestDecimal(
                        asset.totalCostBasis.toString(),
                        countrySetting?.iso,
                        2
                      )} ${asset.fiatCurrency.toUpperCase()}`}
                </Typography>
              }
              text={
                <Typography variant="body2" classNames="mt-1">
                  {toNearestDecimal(asset.totalCostBasis.toString(), countrySetting?.iso, 2) === '0' &&
                  asset.totalCostBasis !== '0'
                    ? parseFloat(asset.totalCostBasis).toFixed(10)
                    : asset.totalCostBasis}
                </Typography>
              }
            />
          )}
        </div>
        <div className="w-1/5">
          <Typography variant="caption" styleVariant="semibold" color="secondary">
            Unrealised Gains/Losses
          </Typography>
          {isWalletSyncing ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
            </div>
          ) : (
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              shortText={
                <Typography variant="body2" classNames="flex mt-1 items-center">
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
                    {toNearestDecimal(unrealizedGainOrLoss.toString(), countrySetting?.iso, 2) === '0' &&
                    unrealizedGainOrLoss !== 0
                      ? `~${fiatCurrencySetting.symbol}0.00 ${asset.fiatCurrency} (${toNearestDecimal(
                          unrealizedGainOrLossPercentage.toString(),
                          countrySetting?.iso,
                          2
                        )}%)`
                      : `${fiatCurrencySetting.symbol}${toNearestDecimal(
                          unrealizedGainOrLoss.toString(),
                          countrySetting?.iso,
                          2
                        )} ${asset.fiatCurrency.toUpperCase()} (${toNearestDecimal(
                          unrealizedGainOrLossPercentage.toString(),
                          countrySetting?.iso,
                          2
                        )}%)`}
                  </div>
                </Typography>
              }
              text={
                <Typography variant="body2" classNames="mt-1 flex flex-col">
                  <div
                    className={`ml-1 ${
                      unrealizedGainOrLoss === 0 ? 'text-neutral-900' : !isLoss ? 'text-[#0CB746]' : 'text-[#C61616]'
                    }`}
                  >
                    <Typography>
                      {unrealizedGainOrLoss !== 0 ? `${unrealizedGainOrLoss.toFixed(10)}` : unrealizedGainOrLoss}
                    </Typography>
                    <Typography>
                      {unrealizedGainOrLoss !== 0 ? `(${unrealizedGainOrLossPercentage.toFixed(10)}%)` : ''}
                    </Typography>
                  </div>
                </Typography>
              }
            />
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
