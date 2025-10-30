import Typography from '@/components-v2/atoms/Typography'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'
import { FiatCurrencyDisplay } from '@/components-v2/molecules/FiatCurrencyDisplay'
import { CryptoInfoDisplay } from '@/components-v2/molecules/CryptoInfoDisplay'

const DisplayTotalAssetAmount = (params) => {
  const { data, isParsingTransactionOwnership, permissionMap } = params

  return (
    <div className="h-full flex items-center">
      {data?.isRejected || data?.isUnknown ? (
        <Typography>-</Typography>
      ) : (
        <div>
          {data?.cryptocurrencies?.length > 1 ? (
            <Typography variant="body2">{data?.cryptocurrencies?.length} Assets</Typography>
          ) : (
            <CryptoInfoDisplay
              symbol={data?.cryptocurrencies?.[0]?.symbol}
              image={data?.cryptocurrencies?.[0]?.image}
              amount={String(data?.cryptocurrencies?.[0]?.totalCryptocurrencyAmount)}
            />
          )}
          <FiatCurrencyDisplay
            iso={data?.fiatCurrencyData?.iso}
            currencyCode={data?.fiatCurrencyData?.code}
            currencySymbol={data?.fiatCurrencyData?.symbol}
            fiatAmount={String(data?.fiatTotalAmount)}
            textColor="secondary"
          />
        </div>
      )}
    </div>
  )
}
export default DisplayTotalAssetAmount
