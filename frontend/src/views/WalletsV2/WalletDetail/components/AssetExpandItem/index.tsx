import { ChainList } from '@/components-v2/molecules/ChainList/ChainList'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import React, { FC, useMemo } from 'react'
import Image from 'next/legacy/image'
import Decrease from '@/public/svg/Decrease.svg'
import Increase from '@/public/svg/Increase.svg'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import { IAssetMapData, IIndividualChainAssetData, ICryptoCurrency } from '../..'
import Typography from '@/components-v2/atoms/Typography'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { IChainItem } from '@/api-v2/chain-api'

interface IAssetExpandItem {
  supportedChains: IChainItem[]
  onChildClick?: () => void
  assetData: IAssetMapData
}

interface IAssetMetaData {
  name: string
  symbol: string
  imageUrl: string
  currentFiatPrice: string
  fiatCurrency: string
  cryptocurrency: ICryptoCurrency
}

interface IAssetChainRow {
  asset: IIndividualChainAssetData
  supportedChains: IChainItem[]
  assetMetaData: IAssetMetaData
}

const AssetChainRow: FC<IAssetChainRow> = ({ asset, supportedChains, assetMetaData }) => {
  const { fiatCurrency: fiatCurrencySetting, country: countrySetting } = useAppSelector(orgSettingsSelector)
  const isWalletSyncing = useAppSelector((state) => state.wallets.isSyncing)

  const totalCurrentFiatValue = parseFloat(asset.totalCurrentFiatValue)
  const formattedTotalCurrentValue = `${fiatCurrencySetting.symbol}${toNearestDecimal(
    totalCurrentFiatValue.toString(),
    countrySetting?.iso,
    2
  )} ${assetMetaData.fiatCurrency}`

  const totalCostBasis = parseFloat(asset.totalCostBasis)
  const formattedTotalCostBasis = `${fiatCurrencySetting.symbol}${toNearestDecimal(
    totalCostBasis.toString(),
    countrySetting?.iso,
    2
  )} ${assetMetaData.fiatCurrency}`

  const unrealizedGainOrLoss = Math.abs(totalCurrentFiatValue - totalCostBasis)
  const unrealizedGainOrLossPercentage =
    unrealizedGainOrLoss !== 0 && totalCostBasis !== 0 ? Math.abs(unrealizedGainOrLoss / totalCostBasis) * 100 : 0
  const isLoss = asset.totalCurrentFiatValue < asset.totalCostBasis

  const getTokenAddress = (forAsset) => {
    const token = assetMetaData.cryptocurrency.addresses.find(
      (address) => address.blockchainId === forAsset.blockChainId
    )
    if (token && token.address) {
      return token.address
    }
    return ''
  }

  const assetChain = useMemo(
    () => supportedChains?.find((chain) => chain?.id?.toLowerCase() === asset?.blockChainId?.toLowerCase()),
    [asset?.blockChainId, supportedChains]
  )
  return (
    <tr className="bg-grey-100 border-none">
      <td className="flex items-center px-4 py-3 last:rounded-bl">
        <ChainList
          chains={supportedChains?.filter((chain) => chain?.id?.toLowerCase() === asset?.blockChainId?.toLowerCase())}
        />
        <DividerVertical space="mx-2" />
        {getTokenAddress(asset) ? (
          <div className="flex items-center">
            <WalletAddress split={5} address={getTokenAddress(asset)}>
              <WalletAddress.Link
                address={getTokenAddress(asset)}
                isMultiple={false}
                blockExplorer={assetChain?.blockExplorer}
              />
              <WalletAddress.Copy address={getTokenAddress(asset)} />
            </WalletAddress>
          </div>
        ) : (
          '-'
        )}
      </td>
      <td className="border-none px-4 py-3">
        {isWalletSyncing ? (
          <div className="pl-1">
            <div className="skeleton skeleton-text" style={{ width: 120 }} />
          </div>
        ) : (
          <Typography variant="body2">
            {toNearestDecimal(asset.totalUnits.toString(), countrySetting?.iso, 18)}{' '}
            {assetMetaData.cryptocurrency.symbol}
          </Typography>
        )}
      </td>
      <td className="border-none px-4 py-3">
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
                {toNearestDecimal(totalCurrentFiatValue.toString(), countrySetting?.iso, 2) === '0' &&
                totalCurrentFiatValue.toString() !== '0'
                  ? `~${fiatCurrencySetting.symbol}0.00 ${assetMetaData.fiatCurrency}`
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
      </td>
      <td className="border-none px-4 py-3">
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
                {toNearestDecimal(totalCostBasis.toString(), countrySetting?.iso, 2) === '0' &&
                totalCostBasis.toString() !== '0'
                  ? `~${fiatCurrencySetting.symbol}0.00 ${assetMetaData.fiatCurrency}`
                  : formattedTotalCostBasis}
              </Typography>
            }
            text={
              <Typography variant="body2">
                {toNearestDecimal(totalCostBasis.toString(), countrySetting?.iso, 2) === '0' &&
                totalCostBasis.toString() !== '0'
                  ? totalCostBasis.toFixed(10)
                  : totalCostBasis}
              </Typography>
            }
          />
        )}
      </td>
      <td className="border-none px-4 py-3 last:rounded-br">
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
                    unrealizedGainOrLoss === 0 ? 'text-neutral-900' : !isLoss ? 'text-[#0CB746]' : 'text-[#C61616]'
                  }`}
                >
                  {toNearestDecimal(unrealizedGainOrLoss.toString(), countrySetting?.iso, 2) === '0' &&
                  unrealizedGainOrLoss !== 0
                    ? `~${fiatCurrencySetting.symbol}0.00 ${assetMetaData.fiatCurrency} (${toNearestDecimal(
                        unrealizedGainOrLossPercentage.toString(),
                        countrySetting?.iso,
                        2
                      )}%)`
                    : `${fiatCurrencySetting.symbol}${toNearestDecimal(
                        unrealizedGainOrLoss.toString(),
                        countrySetting?.iso,
                        2
                      )} ${assetMetaData.fiatCurrency.toUpperCase()} (${toNearestDecimal(
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
                    unrealizedGainOrLoss === 0 ? 'text-neutral-900' : !isLoss ? 'text-[#0CB746]' : 'text-[#C61616]'
                  }`}
                >
                  <div>{unrealizedGainOrLoss !== 0 ? `${unrealizedGainOrLoss.toFixed(10)}` : unrealizedGainOrLoss}</div>
                  <div>{unrealizedGainOrLoss !== 0 ? `(${unrealizedGainOrLossPercentage.toFixed(10)}%)` : ''}</div>
                </div>
              </Typography>
            }
          />
        )}
      </td>
    </tr>
  )
}

const AssetExpandItem: FC<IAssetExpandItem> = ({ assetData, supportedChains }) => (
  <table className="table-auto w-[calc(100%-24px)] border-none mt-4 border-spacing-0 border-separate">
    <thead className="bg-grey-200 rounded-t text-left px-4 py-3 text-grey-700">
      <tr>
        <th className="border-none py-3 px-4 rounded-tl">
          <Typography variant="caption" styleVariant="semibold" classNames="text-grey-700">
            Chain/Asset Address
          </Typography>
        </th>
        <th className="border-none py-3 px-4">
          <Typography variant="caption" styleVariant="semibold" classNames="text-grey-700">
            Units
          </Typography>
        </th>
        <th className="border-none py-3 px-4">
          <Typography variant="caption" styleVariant="semibold" classNames="text-grey-700">
            Current Value
          </Typography>
        </th>
        <th className="border-none py-3 px-4">
          <Typography variant="caption" styleVariant="semibold" classNames="text-grey-700">
            Cost Basis
          </Typography>
        </th>
        <th className="border-none rounded-tr">
          <Typography variant="caption" styleVariant="semibold" classNames="text-grey-700">
            Unrealised Gains/Losses
          </Typography>
        </th>
      </tr>
    </thead>
    <tbody className="border-none">
      {assetData.individualChainAssetData.map((asset) => {
        const { individualChainAssetData, ...assetMetaDataObj } = assetData
        return (
          <AssetChainRow
            key={asset.blockChainId}
            asset={asset}
            supportedChains={supportedChains}
            assetMetaData={assetMetaDataObj}
          />
        )
      })}
    </tbody>
  </table>
)

export default AssetExpandItem
