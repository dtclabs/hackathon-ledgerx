import { FC } from 'react'
import Image from 'next/legacy/image'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'
import { currencyToWord, formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import Typography, { ITypographyProps } from '@/components-v2/atoms/Typography'

type IOmitTypographyProps = Omit<ITypographyProps, 'children'>
export interface ICryptoInfoDisplay extends IOmitTypographyProps {
  symbol: string
  amount: string
  image: string
  iso?: string
  displayRaw?: boolean
}

const CryptoInfoDisplay: FC<ICryptoInfoDisplay> = ({
  image,
  amount,
  iso,
  symbol,
  displayRaw,
  variant = 'body2',
  color
}) => (
  <div className="flex flex-row gap-1 items-center">
    {image && <Image src={image} alt="crypt-img-icon" height={15} width={15} />}
    <div>
      <Typography variant={variant} color={color} classNames="flex flex-row gap-1">
        {displayRaw ? (
          <span>{formatNumberWithCommasBasedOnLocale(amount, iso)}</span>
        ) : (
          <span>
            {currencyToWord(
              typeof amount === 'string' && amount.trim().length > 0 ? amount : '0',
              CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
              iso,
              2
            )}
          </span>
        )}
        <span>{symbol?.toUpperCase()}</span>
      </Typography>
    </div>
  </div>
)

export default CryptoInfoDisplay
