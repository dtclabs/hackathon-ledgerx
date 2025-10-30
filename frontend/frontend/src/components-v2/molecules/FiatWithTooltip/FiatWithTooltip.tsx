import Typography from '@/components-v2/atoms/Typography'
import { FiatCurrencyDisplay } from '@/components-v2/molecules/FiatCurrencyDisplay'
import ArrowGreen from '@/public/svg/icons/arrow-green.svg'
import ArrowRed from '@/public/svg/icons/arrow-red.svg'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'

const FiatWithTooltip = ({
  id,
  fiatAmount,
  settings,
  fiatCurrency,
  styleVariant,
  approximately = false,
  type = 'fiat'
}: {
  id: string
  fiatAmount: string
  settings: any
  fiatCurrency: string
  styleVariant?: 'semibold' | 'underline' | 'medium' | 'regular'
  approximately?: boolean
  type?: 'gainLoss' | 'fiat'
}) => (
  <>
    <div data-tip={`${type}-${id}`} data-for={`${type}-${id}`} className="flex items-center gap-1 w-fit">
      {fiatAmount && type === 'gainLoss' && (
        <Image src={parseFloat(fiatAmount) > 0 ? ArrowGreen : ArrowRed} width={12} height={12} />
      )}
      {fiatAmount ? (
        <FiatCurrencyDisplay
          iso={settings?.country?.iso}
          variant="body2"
          textColor={
            (fiatAmount || parseFloat(fiatAmount)) && type === 'gainLoss'
              ? parseFloat(fiatAmount) > 0
                ? 'success'
                : 'error'
              : 'primary'
          }
          currencyCode={fiatCurrency}
          currencySymbol={settings?.fiatCurrency?.symbol}
          fiatAmount={fiatAmount}
          approximately={approximately}
          styleVariant={styleVariant}
        />
      ) : (
        <Typography styleVariant={styleVariant}>-</Typography>
      )}
    </div>
    {fiatAmount && (
      <ReactTooltip
        id={`${type}-${id}`}
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="top"
        className="!opacity-100 !rounded-lg !text-xs"
      >
        <FiatCurrencyDisplay
          displayRaw
          iso={settings?.country?.iso}
          variant="body2"
          textColor={
            (fiatAmount || parseFloat(fiatAmount)) && type === 'gainLoss'
              ? parseFloat(fiatAmount) > 0
                ? 'success'
                : 'error'
              : 'primary'
          }
          currencyCode={fiatCurrency}
          currencySymbol={settings?.fiatCurrency?.symbol}
          fiatAmount={fiatAmount}
          approximately={approximately}
          styleVariant={styleVariant}
        />
      </ReactTooltip>
    )}
  </>
)
export default FiatWithTooltip
