import React, { useState, useMemo, useEffect } from 'react'
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
import { IAssetData, ISettingOptions } from '../..'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import Accordion from '@/components-v2/molecules/Accordion'
import AssetExpandItem from './AssetExpandItem'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import Typography from '@/components-v2/atoms/Typography'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'

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
  asset: IAssetData
  suportedToken: any
  supportedChain: any
  walletIdsFilter: string[]
  settings: ISettingOptions
  setSettings: (settings: ISettingOptions) => void
}

const AssetItem: React.FC<IAssetItem> = ({
  asset,
  suportedToken,
  supportedChain,
  walletIdsFilter,
  setSettings,
  settings
}) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const [isExpand, setIsExpand] = useState(false)
  const [showImpairModal, setShowImpairModal] = useState(false)
  const [showRevalueModal, setShowRevalueModal] = useState(false)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { fiatCurrency: fiatCurrencySetting, country: countrySetting } = useAppSelector(orgSettingsSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)

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
    () => supportedChains?.filter((chain) => asset.supportedChains.includes(chain.id)),
    [asset.supportedChains, supportedChains]
  )

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
      expandElement={
        <AssetExpandItem
          assets={asset.networks}
          supportedChains={supportedChainsData}
          onChildClick={(selectedAsset, blockchainId) => {
            handleShowTaxLots(selectedAsset, blockchainId)
          }}
        />
      }
      wrapperClassName="bg-white rounded-lg shadow-card-2 mx-2 py-4 pl-6"
    >
      <div className="cursor-pointer flex items-center">
        <div className="w-full">
          <div className="border-b pb-4 flex items-center justify-between">
            <div className="flex items-center">
              <img src={asset?.image.small} width={28} height={28} alt="img-token" />
              <div className="ml-3 text-neutral-900 text-sm leading-[18px] font-semibold w-[135px]">{asset?.name}</div>
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
                <Typography variant="body2" classNames="mt-1">
                  {toNearestDecimal(asset.totalUnits.toString(), countrySetting?.iso, 18)} {asset.symbol}
                </Typography>
              )}
            </div>
            <div className="w-1/5">
              <div className="text-grey-700 text-xs font-semibold leading-[18px]">Current Price</div>
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
                  )} ${asset.fiatCurrency.toUpperCase()} / ${asset.symbol}`}
                </Typography>
              )}
            </div>
            <div className="w-1/5">
              <div className="text-grey-700 text-xs font-semibold leading-[18px]">Total Current Value</div>
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
              <div className="text-grey-700 text-xs font-semibold leading-[18px]">Total Cost Basis</div>
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
              <div className="text-grey-700 text-xs font-semibold leading-[18px]">Unrealised Gains/Losses</div>
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
    </Accordion>
  )
}

export default AssetItem
