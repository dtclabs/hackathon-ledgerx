import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/legacy/image'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'
import Decrease from '@/public/svg/Decrease.svg'
import Increase from '@/public/svg/Increase.svg'
import { useAppSelector } from '@/state'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { IChainItem, ChainList } from '@/components-v2/molecules/ChainList/ChainList'
import { useGetChainsQuery } from '@/api-v2/chain-api'
import Accordion from '@/components-v2/molecules/Accordion'
import AssetExpandItem from '../AssetExpandItem/index'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import { IAssetMapData } from '../..'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import Typography from '@/components-v2/atoms/Typography'

export interface IAsset {
  blockchainId: string
  cryptocurrency: any
  currentFiatPrice: string
  fiatCurrency: string
  totalCostBasis: string
  totalCurrentFiatValue: string
  totalUnits: string
}

interface IAssetItem {
  asset: IAssetMapData
  supportedChains: IChainItem[]
}

interface ISettingOptions {
  expand: boolean
  collapse: boolean
}

const AssetItem: React.FC<IAssetItem> = ({ asset, supportedChains }) => {
  const [isExpand, setIsExpand] = useState(false)
  const [settings, setSettings] = useState<ISettingOptions>()
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { fiatCurrency: fiatCurrencySetting, country: countrySetting } = useAppSelector(orgSettingsSelector)

  const tempUnits = asset?.individualChainAssetData?.reduce((acc, cur) => acc + parseFloat(cur.totalUnits), 0)
  const totalUnits = `${toNearestDecimal(tempUnits?.toString(), countrySetting?.iso, 18)} ${asset.symbol}`

  const totalCostBasis = asset.individualChainAssetData.reduce((acc, cur) => acc + parseFloat(cur.totalCostBasis), 0)
  const formattedTotalCostBasis = `${fiatCurrencySetting.symbol}${toNearestDecimal(
    totalCostBasis.toString(),
    countrySetting?.iso,
    2
  )} ${asset.fiatCurrency}`
  const totalCurrentFiatValue = asset.individualChainAssetData.reduce(
    (acc, cur) => acc + parseFloat(cur.totalCurrentFiatValue),
    0
  )
  const formattedTotalCurrentValue = `${fiatCurrencySetting.symbol}${toNearestDecimal(
    totalCurrentFiatValue.toString(),
    countrySetting?.iso,
    2
  )} ${asset.fiatCurrency}`
  const currentFiatPrice = `${fiatCurrencySetting.symbol}${toNearestDecimal(
    asset.currentFiatPrice,
    countrySetting?.iso,
    2
  )} ${asset.fiatCurrency}/${asset.symbol}`

  const unrealizedGainOrLoss = Math.abs(totalCurrentFiatValue - totalCostBasis)
  const unrealizedGainOrLossPercentage =
    unrealizedGainOrLoss !== 0 && totalCostBasis !== 0 ? Math.abs(unrealizedGainOrLoss / totalCostBasis) * 100 : 0
  const isLoss = totalCurrentFiatValue < totalCostBasis

  useEffect(() => {
    if (settings?.expand) {
      setIsExpand(true)
    } else if (settings?.collapse) {
      setIsExpand(false)
    }
  }, [settings?.collapse, settings?.expand])

  return (
    <Accordion
      fullWidth
      isExpand={isExpand}
      setIsExpand={setIsExpand}
      onExpandClick={() => {
        setSettings({ ...settings, collapse: false })
      }}
      onCollapseClick={() => {
        setSettings({ ...settings, expand: false })
      }}
      expandElement={<AssetExpandItem assetData={asset} supportedChains={supportedChains} />}
      wrapperClassName="bg-white rounded-lg shadow-card-2 mx-2 py-4 pl-6 mt-4"
    >
      <div className="cursor-pointer flex items-center">
        <div className="w-full">
          <div className="border-b pb-4 flex items-center justify-between">
            <div className="flex items-center">
              <img src={asset?.imageUrl} width={28} height={28} alt="img-token" />
              <div className="ml-3 text-neutral-900 text-sm leading-[18px] font-semibold w-[135px]">{asset?.name}</div>
              <DividerVertical height="h-5" space="mx-3" />
              <ChainList chains={supportedChains} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-1/5">
              <Typography variant="caption" styleVariant="semibold" color="secondary">
                Total Units
              </Typography>
              {isWalletSyncing ? (
                <div className="pl-1">
                  <div className="skeleton skeleton-text mt-1" style={{ width: 120 }} />
                </div>
              ) : (
                <Typography variant="body2" classNames="mt-1">
                  {totalUnits}
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
                  {currentFiatPrice}
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
                      {toNearestDecimal(totalCurrentFiatValue.toString(), countrySetting?.iso, 2) === '0' &&
                      totalCurrentFiatValue.toString() !== '0'
                        ? `~${fiatCurrencySetting.symbol}0.00 ${asset.fiatCurrency}`
                        : formattedTotalCurrentValue}
                    </Typography>
                  }
                  text={
                    <Typography variant="body2">
                      {toNearestDecimal(totalCurrentFiatValue.toString(), countrySetting?.iso, 2) === '0' &&
                      totalCurrentFiatValue.toString() !== '0'
                        ? totalCurrentFiatValue.toFixed(10)
                        : totalCurrentFiatValue}
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
                      {toNearestDecimal(totalCostBasis.toString(), countrySetting?.iso, 2) === '0' &&
                      totalCostBasis.toString() !== '0'
                        ? `~${fiatCurrencySetting.symbol}0.00 ${asset.fiatCurrency}`
                        : formattedTotalCostBasis}
                    </Typography>
                  }
                  text={
                    <Typography variant="body2" classNames="mt-1">
                      {toNearestDecimal(totalCostBasis.toString(), countrySetting?.iso, 2) === '0' &&
                      totalCostBasis.toString() !== '0'
                        ? totalCostBasis.toFixed(10)
                        : totalCostBasis}
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
                          unrealizedGainOrLoss === 0
                            ? 'text-neutral-900'
                            : !isLoss
                            ? 'text-[#0CB746]'
                            : 'text-[#C61616]'
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
                          unrealizedGainOrLoss === 0
                            ? 'text-neutral-900'
                            : !isLoss
                            ? 'text-[#0CB746]'
                            : 'text-[#C61616]'
                        }`}
                      >
                        <div>
                          {unrealizedGainOrLoss !== 0 ? `${unrealizedGainOrLoss.toFixed(10)}` : unrealizedGainOrLoss}
                        </div>
                        <div>
                          {unrealizedGainOrLoss !== 0 ? `(${unrealizedGainOrLossPercentage.toFixed(10)}%)` : ''}
                        </div>
                      </div>
                    </Typography>
                  }
                />
              )}
            </div>
          </div>
        </div>
        <DividerVertical height="h-[90px]" space="ml-4" />
        <div className="p-[6px] mx-6 rounded h-6 w-6 bg-grey-200 flex items-center justify-center">
          <Image
            src="/svg/Dropdown.svg"
            alt="DownArrow"
            className={isExpand ? 'rotate-180 ' : ''}
            height={10}
            width={15}
          />
        </div>
      </div>
    </Accordion>
  )
}

export default AssetItem
