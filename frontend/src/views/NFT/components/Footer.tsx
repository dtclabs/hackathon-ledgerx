import { INftAggregate } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'
import FiatWithTooltip from '../../../components-v2/molecules/FiatWithTooltip/FiatWithTooltip'

const Footer = ({ aggregate, settings }: { aggregate: INftAggregate; settings: any }) => {
  const { totalNfts, totalCostBasis, totalCurrentValue, totalGainLoss, fiatCurrency } = aggregate

  return (
    <div
      style={{
        boxShadow: '0px -8px 16px 0px rgba(0, 0, 0, 0.06)'
      }}
      className="h-[62px] w-full bg-neutral-200 px-12 py-3 flex items-center justify-between rounded-b-lg"
    >
      <Typography styleVariant="semibold" color="primary">
        Total: {totalNfts}
      </Typography>
      <div className="laptop:w-[calc(100%-270px)] w-[calc(100%-320px)] flex justify-end">
        <div className="flex justify-between w-[60%] gap-4">
          <div className="flex flex-col w-1/3">
            <Typography color="secondary" styleVariant="semibold" variant="caption">
              Total Cost Basis
            </Typography>
            <FiatWithTooltip
              id="nft-cost-basis-aggregate"
              fiatCurrency={fiatCurrency}
              settings={settings}
              fiatAmount={totalCostBasis}
              styleVariant="semibold"
            />
          </div>
          <div className="flex flex-col w-1/3">
            <Typography color="secondary" styleVariant="semibold" variant="caption">
              Total Current Value
            </Typography>
            <Typography styleVariant="semibold" color="primary">
              <FiatWithTooltip
                id="nft-curr-value-aggregate"
                fiatCurrency={fiatCurrency}
                settings={settings}
                fiatAmount={totalCurrentValue}
                styleVariant="semibold"
              />
            </Typography>
          </div>
          <div className="flex flex-col w-1/3">
            <Typography color="secondary" styleVariant="semibold" variant="caption">
              Total Unrealised Gains/Losses
            </Typography>
            <FiatWithTooltip
              id="nft-gain-loss-aggregate"
              fiatCurrency={fiatCurrency}
              settings={settings}
              fiatAmount={totalGainLoss}
              styleVariant="semibold"
              type="gainLoss"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
