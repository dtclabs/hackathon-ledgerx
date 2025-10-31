/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { FC, useState, useMemo, useEffect, ChangeEvent } from 'react'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import Typography from '@/components-v2/atoms/Typography'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import Decrease from '@/public/svg/Decrease.svg'
import Increase from '@/public/svg/Increase.svg'
import Accordion from '@/components-v2/molecules/Accordion'
import { isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import CheckboxCustom from '@/components-v2/atoms/CheckBoxCustom'
import ReactTooltip from 'react-tooltip'

interface IProps {
  locale: {
    country: any
    timezone: any
    fiatCurrency: any
  }
  chains: any
  asset: {
    supportedChains: any
    currency: string
    cryptocurrencyAmount: string
    totalTokenAmount: any
    totalFiatAmount: number
    totalCostBasis: number
    gainLoss: number
    networks: any
  }
  selectedAssets: any
  onClickCheckbox: any
  assetColorRef: any
  disabled?: any
}

const AssetRow: FC<IProps> = ({ locale, asset, chains, onClickCheckbox, selectedAssets, assetColorRef, disabled }) => {
  const [isOpen, setIsOpen] = useState(false)
  const supportedChainsDataV2 = useMemo(() => {
    const filteredChains = chains?.filter(
      (chain) => asset.supportedChains.filter((assetChain) => assetChain.id === chain.id).length > 0
    )
    return filteredChains.map((chain) => ({
      ...chain,
      isGrayedOut: asset.supportedChains.find((assetChain) => assetChain.id === chain.id).isGrayedOut
    }))
  }, [...asset.supportedChains, ...chains])
  const supportedChainsData = chains?.filter((chain) => asset?.supportedChains.includes(chain.id))

  useEffect(() => {
    setIsOpen(false)
  }, [...asset.supportedChains])

  const position = asset.gainLoss > 0 ? 'positive' : asset.gainLoss < 0 ? 'negative' : null

  const gainLossFiatAmount = toNearestDecimal(String(Math.abs(asset.gainLoss)), locale.country?.iso, 2)
  const percentageChange = toNearestDecimal(
    String((Math.abs(asset.gainLoss) * 100) / parseFloat(String(asset.totalCostBasis))),
    locale.country?.iso,
    2
  )

  return (
    <Accordion
      fullWidth
      disabled={asset?.supportedChains?.length <= 1}
      isExpand={isOpen}
      setIsExpand={setIsOpen}
      expandElement={
        <div>
          {asset?.networks?.map((_asset) => {
            const gainLoss = _asset.totalCurrentFiatValue - _asset.totalCostBasis
            return (
              <ChildRow
                key={`${asset?.currency}-${_asset?.blockchainId}`}
                locale={locale}
                chains={chains}
                asset={_asset}
                gainLoss={gainLoss}
              />
            )
          })}
        </div>
      }
    >
      <div
        className="flex flex-row items-center gap-2 h-[70px] "
        style={{ borderBottom: '1px solid #F1F1EF', backgroundColor: isOpen ? '#F1F1EF' : 'white' }}
      >
        <div
          className="flex flex-row items-center pl-6 basis-2/12"
          data-tip="Tooltip content"
          data-for={asset.currency}
        >
          {disabled && !selectedAssets[asset.currency] && (
            <ReactTooltip
              id={asset.currency}
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              place="top"
              className="!opacity-100 !rounded-lg"
            >
              At least one asset must be selected.
            </ReactTooltip>
          )}
          <CheckboxCustom
            checked={!selectedAssets[asset.currency]}
            label={asset?.currency}
            onChange={onClickCheckbox(asset.currency)}
            id={asset.currency}
            checkboxGroupName={asset.currency}
            inputExtendClassName={`${assetColorRef[asset.currency]?.className}`}
            wrapperClassName="!bg-transparent"
            disabled={disabled ? !selectedAssets[asset.currency] : false}
          />
        </div>

        <div className="basis-1/12">
          <ChainList chains={isFeatureEnabledForThisEnv ? supportedChainsDataV2 : supportedChainsData} />
        </div>
        <div className="basis-2/12">
          <Typography variant="body2">
            {/* {`${numToWord(asset?.totalTokenAmount, CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 5)} ${asset?.currency}`} */}
            {`${toNearestDecimal(String(asset.totalTokenAmount), locale.country?.iso, 2)} ${asset?.currency}`}
          </Typography>
        </div>
        <div className="basis-2/12">
          <Typography variant="body2">
            {`${locale?.fiatCurrency?.symbol}${toNearestDecimal(
              String(asset.totalFiatAmount),
              locale.country?.iso,
              2
            )} ${locale?.fiatCurrency?.code?.toUpperCase()}`}
          </Typography>
        </div>
        <div className="basis-3/12 flex items-center gap-1">
          {position ? <Image src={ASSET_MAP[position].icon} width={16} height={16} /> : <div className="pl-4" />}

          <Typography variant="body2" color={ASSET_MAP[position]?.color ?? 'primary'}>
            {`${locale?.fiatCurrency?.symbol}${gainLossFiatAmount} 
          ${locale?.fiatCurrency?.code?.toUpperCase()} (${
              Number.isNaN(parseFloat(percentageChange)) ? '0.00' : percentageChange
            }%)`}
          </Typography>
        </div>

        <div className="flex-grow flex justify-end pr-6">
          {asset?.supportedChains?.length > 1 && (
            <div
              className="p-1 rounded h-[25px] w-[25px] flex justify-center hover:cursor-pointer"
              style={{ backgroundColor: '#E2E2E0' }}
            >
              <Image
                src="/svg/Dropdown.svg"
                alt="DownArrow"
                className={isOpen ? 'rotate-180 ' : ''}
                height={10}
                width={15}
              />
            </div>
          )}
        </div>
      </div>
    </Accordion>
  )
}

type ColorType = 'success' | 'error'

interface AssetMapValue {
  color: ColorType
  icon: any
}

const ASSET_MAP: Record<string, AssetMapValue> = {
  positive: {
    color: 'success',
    icon: Increase
  },
  negative: {
    color: 'error',
    icon: Decrease
  }
}
const ChildRow = ({ asset, chains, locale, gainLoss }) => {
  const position = gainLoss > 0 ? 'positive' : gainLoss < 0 ? 'negative' : null
  const tokenFiatAmount = toNearestDecimal(String(asset.totalCurrentFiatValue), locale.country?.iso, 2)
  const gainLossFiatAmount = toNearestDecimal(String(Math.abs(gainLoss)), locale.country?.iso, 2)
  const percentageChange = toNearestDecimal(
    String((Math.abs(gainLoss) * 100) / parseFloat(asset.totalCostBasis)),
    locale.country?.iso,
    2
  )

  return (
    <div className="flex flex-row items-center h-[55px] gap-2 " style={{ backgroundColor: '#FBFAFA' }}>
      <div className="basis-2/12 flex flex-row items-center pl-6 gap-6">
        <div className="w-6 h-6" />
        <Typography variant="body2">{asset?.cryptocurrency?.symbol}</Typography>
      </div>

      <div className="basis-1/12">
        <ChainList chains={chains?.filter((chain) => chain?.id === asset?.blockchainId)} />
      </div>
      <div className="basis-2/12">
        <Typography variant="body2">
          {`${parseFloat(toNearestDecimal(String(asset.totalUnits), locale.country?.iso, 2)).toFixed(2)} ${
            asset?.cryptocurrency.symbol
          }`}
        </Typography>
      </div>
      <div className="basis-2/12">
        <Typography variant="body2">
          {`${locale?.fiatCurrency?.symbol}${parseFloat(tokenFiatAmount).toFixed(
            2
          )} ${locale?.fiatCurrency?.code?.toUpperCase()}`}
        </Typography>
      </div>
      <div className="basis-3/12 flex items-center gap-1">
        {position ? <Image src={ASSET_MAP[position].icon} width={16} height={16} /> : <div className="pl-4" />}
        <Typography variant="body2" color={ASSET_MAP[position]?.color ?? 'primary'}>
          {`${locale?.fiatCurrency?.symbol}${parseFloat(gainLossFiatAmount).toFixed(2)} 
          ${locale?.fiatCurrency?.code?.toUpperCase()} (${
            Number.isNaN(parseFloat(percentageChange)) ? '0.00' : percentageChange
          }%)`}
        </Typography>
      </div>
      <div className="flex-grow flex justify-end" />
    </div>
  )
}

export default AssetRow
