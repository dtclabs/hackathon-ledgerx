import { INftCollectionFloorPrice } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import { CURRENCY_RELATED_CONSTANTS } from '@/config-v2/constants'
import { currencyToWord } from '@/utils-v2/numToWord'
import { DetailType, getMarketPlaceLink } from '../../nft-utils'

const FloorPriceTable = ({
  id,
  type,
  values,
  title,
  tokenId,
  blockchainId,
  fiatCurrency,
  orgSettings,
  averageFiatAmount,
  averageAmount,
  contractAddress,
  cryptocurrency
}: {
  id: string
  type: DetailType
  orgSettings: any
  tokenId?: string
  blockchainId?: string
  fiatCurrency: string
  values: INftCollectionFloorPrice[]
  averageFiatAmount: string
  averageAmount: string
  contractAddress: string
  cryptocurrency: string
  title?: string
}) => (
  <div className="rounded-lg border border-grey-200">
    <div className="rounded-t-lg flex items-center justify-between p-4 bg-gray-50">
      <Typography color="primary" variant="body1" styleVariant="semibold">
        {title || 'Floor Price'}
      </Typography>
      <Typography color="primary">
        Average:{' '}
        {averageFiatAmount
          ? `${orgSettings?.fiatCurrency?.symbol}${currencyToWord(
              averageFiatAmount?.toString() || '0',
              CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
              orgSettings?.country?.iso
            )} ${fiatCurrency || orgSettings?.fiatCurrency?.code}`
          : '-'}{' '}
        |{' '}
        {averageAmount
          ? `${currencyToWord(
              averageAmount?.toString() || '0',
              CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
              orgSettings?.country?.iso
            )} ${cryptocurrency}`
          : '-'}
      </Typography>
    </div>
    <div className="grid grid-cols-4 gap-3 p-4">
      {values?.map((item) => (
        <div key={`${id}-${item.marketplaceName}`} className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Typography color="secondary" styleVariant="semibold" variant="caption">
              {item.marketplaceName}
            </Typography>
            <button
              type="button"
              className="flex items-center"
              onClick={(e) => {
                e.stopPropagation()
                const link = getMarketPlaceLink(item.marketplaceName, type, contractAddress, blockchainId, tokenId)
                window.open(link)
              }}
            >
              <SVGIcon name="ExternalLinkIcon" width={14} height={14} />
            </button>
          </div>
          <CryptoFiatInfoDisplay
            id={`floor-fiat-${id}-${item.marketplaceName}`}
            classNames="flex flex-col-reverse gap-1 w-fit"
            iso={orgSettings?.country?.iso}
            cryptocurrency={{
              image: '',
              amount: item.cryptocurrencyAmount || '0',
              symbol: item.cryptocurrency.symbol,
              variant: 'caption',
              color: 'secondary'
            }}
            fiatcurrency={{
              iso: orgSettings?.country?.iso,
              currencyCode: fiatCurrency,
              currencySymbol: orgSettings?.fiatCurrency?.symbol,
              fiatAmount: item.fiatCurrencyAmount || '0',
              approximately: false,
              variant: 'body2',
              color: 'primary'
            }}
          />
        </div>
      ))}
    </div>
  </div>
)

export default FloorPriceTable
