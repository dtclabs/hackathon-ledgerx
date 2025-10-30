import { ITypographyProps } from '@/components-v2/atoms/Typography'
import { FC } from 'react'
import ReactTooltip from 'react-tooltip'
import { CryptoInfoDisplay, ICryptoInfoDisplay } from '../CryptoInfoDisplay'
import { FiatCurrencyDisplay, IFiatCurrencyDisplayProps } from '../FiatCurrencyDisplay'
import { SkeletonLoader } from '../SkeletonLoader'

type IExtendFiatCurrencyDisplayProps = IFiatCurrencyDisplayProps & {
  color?: ITypographyProps['color']
  variant?: ITypographyProps['variant']
}

type IExtendCryptoCurrencyDisplayProps = ICryptoInfoDisplay & {
  color?: ITypographyProps['color']
  variant?: ITypographyProps['variant']
}

interface ICryptoFiatInfoDisplayProps {
  id?: string
  iso?: string
  cryptocurrency: IExtendCryptoCurrencyDisplayProps
  fiatcurrency?: IExtendFiatCurrencyDisplayProps
  classNames?: string
  isCalculatingFiat?: boolean
  approximately?: boolean
}
// TODO - Change to composite - To handle styleVariant for either of the 2 CryptoInfoDisplay and FiatCurrencyDisplay
const CryptoFiatInfoDisplay: FC<ICryptoFiatInfoDisplayProps> = ({
  iso,
  cryptocurrency,
  fiatcurrency,
  id,
  classNames,
  isCalculatingFiat
}) => (
  <>
    <div data-tip={`crypto-info-display-${id}`} data-for={`crypto-info-display-${id}`} className={classNames}>
      <CryptoInfoDisplay
        iso={iso}
        image={cryptocurrency.image}
        amount={cryptocurrency.amount}
        symbol={cryptocurrency.symbol}
        {...cryptocurrency}
      />
      <div className="">
        {isCalculatingFiat ? (
          <SkeletonLoader variant="rounded" height={12} width={80} />
        ) : (
          fiatcurrency && (
            <FiatCurrencyDisplay
              iso={iso}
              variant={fiatcurrency.variant || 'caption'}
              textColor={fiatcurrency.color}
              currencyCode={fiatcurrency.currencyCode}
              currencySymbol={fiatcurrency.currencySymbol}
              fiatAmount={fiatcurrency.fiatAmount}
              approximately={fiatcurrency.approximately}
            />
          )
        )}
      </div>
    </div>
    <ReactTooltip
      id={`crypto-info-display-${id}`}
      borderColor="#eaeaec"
      border
      backgroundColor="white"
      textColor="#111111"
      effect="solid"
      place="top"
      scrollHide
      isCapture
      className="!opacity-100 !rounded-lg !text-xs"
    >
      <div className={classNames}>
        <div>
          <CryptoInfoDisplay
            iso={iso}
            image={cryptocurrency.image}
            amount={cryptocurrency.amount}
            symbol={cryptocurrency.symbol}
            {...cryptocurrency}
            displayRaw
          />
        </div>
        {isCalculatingFiat ? (
          <SkeletonLoader variant="rounded" height={12} width={140} />
        ) : (
          fiatcurrency && (
            <div>
              <FiatCurrencyDisplay
                iso={iso}
                variant={fiatcurrency.variant || 'caption'}
                textColor={fiatcurrency.color}
                currencyCode={fiatcurrency.currencyCode}
                currencySymbol={fiatcurrency.currencySymbol}
                fiatAmount={fiatcurrency.fiatAmount}
                approximately={fiatcurrency.approximately}
                displayRaw
              />
            </div>
          )
        )}
      </div>
    </ReactTooltip>
  </>
)

export default CryptoFiatInfoDisplay
