import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { toShort } from '@/utils/toShort'
import React from 'react'
import Image from 'next/legacy/image'
import Decrease from '@/public/svg/Decrease.svg'
import Increase from '@/public/svg/Increase.svg'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import Typography from '@/components-v2/atoms/Typography'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import WalletAddressActionButtons from '@/components-v2/molecules/WalletAddressActionButtons'

const AssetExpandItem = ({ assets, supportedChains, onChildClick }) => {
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)
  const { fiatCurrency: fiatCurrencySetting, country: countrySetting } = useAppSelector(orgSettingsSelector)

  const getTokenAddress = (asset) => {
    const token = asset.cryptocurrency.addresses.find((address) => address.blockchainId === asset.blockchainId)
    if (token && token.address) {
      return token.address
    }
    return ''
  }

  return (
    <div className="mt-4 bg-grey-100 w-[calc(100%-24px)] rounded">
      <div className="flex items-center px-4 py-3 bg-grey-200 rounded-t">
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Chain/Asset Address</div>
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Units</div>
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Current Value</div>
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Cost Basis</div>
        </div>
        <div className="w-1/5">
          <div className="text-grey-700 text-xs font-semibold leading-[18px]">Unrealised Gains/Losses</div>
        </div>
      </div>
      {assets.map((asset) => {
        const unrealizedGainOrLoss = Math.abs(asset.totalCurrentFiatValue - asset.totalCostBasis)
        const unrealizedGainOrLossPercentage =
          unrealizedGainOrLoss !== 0 || +asset.totalCostBasis !== 0
            ? Math.abs(unrealizedGainOrLoss / asset.totalCostBasis) * 100
            : 0
        const isLoss = asset.totalCurrentFiatValue < asset.totalCostBasis
        return (
          <button
            type="button"
            className="flex items-center px-4 py-3 w-full text-left hover:bg-grey-200"
            onClick={(e) => {
              e.stopPropagation()
              onChildClick(asset, asset.blockchainId)
            }}
            key={`${asset.cryptocurrency.publicId}_${asset.blockchainId}`}
          >
            <div className="w-1/5 flex items-center">
              <ChainList
                chains={supportedChains.filter((chain) => chain.id.toLowerCase() === asset.blockchainId.toLowerCase())}
              />
              <DividerVertical space="mx-2" />
              {getTokenAddress(asset) ? (
                <div className="flex items-center">
                  <Typography variant="body2">{toShort(getTokenAddress(asset), 4, 5)}</Typography>
                  <WalletAddressActionButtons address={getTokenAddress(asset)} />
                </div>
              ) : (
                '-'
              )}
            </div>
            <div className="w-1/5">
              {isWalletSyncing ? (
                <div className="pl-1">
                  <div className="skeleton skeleton-text" style={{ width: 120 }} />
                </div>
              ) : (
                <Typography variant="body2">
                  {toNearestDecimal(asset.totalUnits.toString(), countrySetting?.iso, 18)} {asset.cryptocurrency.symbol}
                </Typography>
              )}
            </div>
            <div className="w-1/5">
              {isWalletSyncing ? (
                <div className="pl-1">
                  <div className="skeleton skeleton-text" style={{ width: 120 }} />
                </div>
              ) : (
                <Tooltip
                  arrow={false}
                  position={ETooltipPosition.TOP}
                  shortText={
                    <Typography variant="body2">
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
              {isWalletSyncing ? (
                <div className="pl-1">
                  <div className="skeleton skeleton-text" style={{ width: 120 }} />
                </div>
              ) : (
                <Tooltip
                  arrow={false}
                  position={ETooltipPosition.TOP}
                  shortText={
                    <Typography variant="body2">
                      {toNearestDecimal(asset.totalCostBasis, countrySetting?.iso, 2) === '0' &&
                      asset.totalCostBasis !== '0'
                        ? `~${fiatCurrencySetting.symbol}0.00 ${asset.fiatCurrency}`
                        : `${fiatCurrencySetting?.symbol}${toNearestDecimal(
                            asset.totalCostBasis,
                            countrySetting?.iso,
                            2
                          )} ${asset.fiatCurrency.toUpperCase()}`}
                    </Typography>
                  }
                  text={
                    <Typography variant="body2">
                      {toNearestDecimal(asset.totalCostBasis, countrySetting?.iso, 2) === '0' &&
                      asset.totalCostBasis !== '0'
                        ? parseFloat(asset.totalCostBasis).toFixed(10)
                        : asset.totalCostBasis}
                    </Typography>
                  }
                />
              )}
            </div>
            <div className="w-1/5">
              {isWalletSyncing ? (
                <div className="pl-1">
                  <div className="skeleton skeleton-text" style={{ width: 120 }} />
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
                    <Typography variant="body2" classNames="flex flex-col">
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
          </button>
        )
      })}
    </div>
  )
}

export default AssetExpandItem
