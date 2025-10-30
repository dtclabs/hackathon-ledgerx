import { FC } from 'react'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { currencyToWord, numToWord, formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'
import Typography from '@/components-v2/atoms/Typography'
import ReactTooltip from 'react-tooltip'

interface IProps {
  cryptocurrencyAmount: string
  fiatAmount: string
  symbol: string
  iso: any
  fiatCurrency: string
  decimal: number
  currencySymbol: string
  direction: string
  id: string
}

const CryptocurrencyPrice: FC<IProps> = ({
  cryptocurrencyAmount,
  fiatAmount,
  direction,
  symbol,
  iso,
  fiatCurrency,
  currencySymbol,
  decimal,
  id
}) => (
  <div className="w-fit" data-tip={`cryptocurrency-price-${id}`} data-for={`cryptocurrency-price-${id}`}>
    <div
      className={`flex flex-row items-center justify-end gap-1 ${
        direction === 'outgoing' ? '  text-[#B41414]' : 'text-[#0BA740]'
      } `}
    >
      {direction === 'outgoing' ? '-' : '+'}
      <Typography classNames={` ${direction === 'outgoing' ? '  text-[#B41414]' : 'text-[#0BA740]'}`} variant="body2">
        {`${numToWord(cryptocurrencyAmount, CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 5)} ${symbol}`}
      </Typography>
    </div>

    <Typography color="secondary" variant="caption">
      {`~ ${currencySymbol}${currencyToWord(
        fiatAmount,
        CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
        iso,
        2
      )} ${fiatCurrency?.toUpperCase()}`}
    </Typography>
    <ReactTooltip
      id={`cryptocurrency-price-${id}`}
      borderColor="#eaeaec"
      border
      backgroundColor="white"
      textColor="#111111"
      effect="solid"
      place="top"
      className="!opacity-100 !rounded-lg"
    >
      <div className={`text-sm ${direction === 'outgoing' ? '  text-[#B41414]' : 'text-[#0BA740]'}`}>
        <Typography>{`${numToWord(cryptocurrencyAmount, iso, decimal)} ${symbol}`}</Typography>
        <Typography classNames="mt-[0.25rem]" color="black">
          {`${currencySymbol}${formatNumberWithCommasBasedOnLocale(fiatAmount, iso)} ${fiatCurrency.toUpperCase()}`}
        </Typography>
      </div>
    </ReactTooltip>
  </div>
)

export default CryptocurrencyPrice
