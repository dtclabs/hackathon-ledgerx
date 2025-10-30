import { FC } from 'react'
import Image from 'next/legacy/image'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { currencyToWord, numToWord, formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'

interface ITokenFiatPricingProps {
  cryptocurrencyImage: string
  cryptocurrencyAmount: string
  cryptocurrencySymbol: string
  fiatCurrency: string
  fiatCurrencySymbol?: string
  fiatAmount: string
  isLoading?: boolean
  countryIso: any
  decimal: any
}

const TokenFiatPricing: FC<ITokenFiatPricingProps> = ({
  isLoading,
  countryIso,
  fiatAmount,
  decimal,
  fiatCurrency,
  cryptocurrencyAmount,
  cryptocurrencyImage,
  cryptocurrencySymbol
}) => (
  <Tooltip
    arrow={false}
    position={ETooltipPosition.TOP}
    className="bottom-8"
    shortText={
      <>
        <div className="flex flex-row items-center gap-2 mb-[2px] font-semibold">
          {parseFloat(cryptocurrencyAmount) !== 0 && cryptocurrencyImage && (
            <Image className="rounded-[50px]" alt="" src={cryptocurrencyImage} width={14} height={14} />
          )}
          {cryptocurrencyAmount
            ? `${numToWord(cryptocurrencyAmount, CURRENCY_RELATED_CONSTANTS.numToWordThreshold, 5)} 
             
            `
            : '-'}
        </div>
        <div className="text-[#777675]">
          {isLoading ? (
            <div className="pl-1">
              <div className="skeleton skeleton-text mt-1" style={{ width: 30 }} />
            </div>
          ) : (
            `~ USD ${
              parseFloat(fiatAmount) > 0
                ? currencyToWord(fiatAmount, CURRENCY_RELATED_CONSTANTS.numToWordThreshold, countryIso, 2)
                : '-'
            }`
          )}
        </div>
      </>
    }
    text={
      <div className="text-sm p-2">
        {parseFloat(cryptocurrencyAmount) > 0 ? (
          <p>{`${numToWord(cryptocurrencyAmount, countryIso, decimal)} ${cryptocurrencySymbol}`}</p>
        ) : (
          '-'
        )}
        <p className="text-[#777675] mt-[0.25rem]">{`${
          parseFloat(fiatAmount) > 0
            ? `${fiatCurrency.toUpperCase()} ${formatNumberWithCommasBasedOnLocale(fiatAmount, countryIso)}`
            : '-'
        }`}</p>
      </div>
    }
  />
)

export default TokenFiatPricing
