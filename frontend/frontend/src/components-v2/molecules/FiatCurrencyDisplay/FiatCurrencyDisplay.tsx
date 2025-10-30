import { FC } from 'react'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'
import { currencyToWord, formatNumberWithCommasBasedOnLocale } from '@/utils-v2/numToWord'
import Typography, { ITypographyProps } from '@/components-v2/atoms/Typography'

type IOmitTypographyProps = Omit<ITypographyProps, 'children'>
export interface IFiatCurrencyDisplayProps extends IOmitTypographyProps {
  fiatAmount: string
  currencySymbol: string
  currencyCode: string
  iso: string
  displayRaw?: boolean
  textColor?: ITypographyProps['color']
  approximately?: boolean
}

const FiatCurrencyDisplay: FC<IFiatCurrencyDisplayProps> = ({
  currencyCode,
  currencySymbol,
  fiatAmount,
  iso,
  displayRaw,
  textColor,
  styleVariant,
  variant = 'body2',
  approximately = true
}) => (
  <Typography
    variant={variant}
    styleVariant={styleVariant}
    color={textColor ?? 'primary'}
    classNames="flex flex-row gap-1"
  >
    <span>
      {displayRaw
        ? `${currencySymbol}${formatNumberWithCommasBasedOnLocale(fiatAmount, iso)}`
        : `${approximately ? '~' : ''}  ${currencySymbol}${currencyToWord(
            typeof fiatAmount === 'string' && fiatAmount.trim().length > 0 ? fiatAmount : '0',
            CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
            iso,
            2
          )}`}
    </span>
    <span>{currencyCode?.toUpperCase()}</span>
  </Typography>
)

export default FiatCurrencyDisplay
