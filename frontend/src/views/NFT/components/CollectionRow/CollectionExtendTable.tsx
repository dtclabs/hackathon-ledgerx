import { INftsSimplified } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import InfoIcon from '@/public/svg/icons/info-icon-circle-grey.svg'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import FiatWithTooltip from '../../../../components-v2/molecules/FiatWithTooltip/FiatWithTooltip'
import { NFTTooltip, getNftImage } from '../../nft-utils'
import ReactTooltip from 'react-tooltip'

const CollectionExtendTable = ({
  id,
  nfts,
  settings,
  chainIcons,
  onChildClick
}: {
  id: string
  nfts: INftsSimplified[]
  settings: any
  chainIcons: any
  onChildClick: (item: INftsSimplified) => void
}) => (
  <div className="mt-4 bg-grey-100 rounded">
    <div className="flex items-center gap-2 px-4 py-3 bg-grey-200 rounded-t">
      <Typography
        color="primary"
        variant="caption"
        styleVariant="semibold"
        classNames="w-[22%] max-w-[250px] laptop:max-w-[200px] macbock:max-w-[180px]"
      >
        NFT
      </Typography>
      <Typography color="primary" variant="caption" styleVariant="semibold" classNames="w-1/6">
        Wallet
      </Typography>
      <Typography color="primary" variant="caption" styleVariant="semibold" classNames="w-[12%]">
        Date Acquired
      </Typography>
      <Typography color="primary" variant="caption" styleVariant="semibold" classNames="w-1/6">
        Cost Basis
      </Typography>
      <div className="flex items-center gap-2 w-1/6">
        <Typography color="primary" variant="caption" styleVariant="semibold">
          Current Value
        </Typography>
        <Image
          data-tip={`curr-value-tooltip-${id}`}
          data-for={`curr-value-tooltip-${id}`}
          src={InfoIcon}
          width={14}
          height={14}
        />
        <ReactTooltip
          id={`curr-value-tooltip-${id}`}
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          className="!opacity-100 !rounded-lg w-[250px]"
        >
          {NFTTooltip.CURRENT_VALUE}
        </ReactTooltip>
      </div>
      <Typography color="primary" variant="caption" styleVariant="semibold" classNames="w-1/6 whitespace-nowrap">
        Unrealised Gains/Losses
      </Typography>
    </div>
    {nfts.map((nft, index) => {
      const fiatCurrency = nft.fiatCurrency || settings?.fiatCurrency?.code
      return (
        <button
          type="button"
          className={`flex items-center gap-2 px-4 py-3 w-full text-left hover:bg-grey-200 ${
            index < nfts.length - 1 && 'border-b border-grey-200'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            onChildClick(nft)
          }}
          key={`${nft.id}_${nft.blockchainId}`}
        >
          <div className="w-[22%] max-w-[250px] laptop:max-w-[200px] macbock:max-w-[180px] flex items-center gap-2">
            <div className="shrink-0 h-8">
              <Image src={getNftImage(nft.imageUrl)} alt="NFT-content" width={32} height={32} className="rounded" />
            </div>
            <div className="">
              <Typography
                styleVariant="semibold"
                classNames="laptop:max-w-[150px] max-w-[200px] macbock:max-w-[130px] truncate"
              >
                {nft.name}
              </Typography>
              <Image src={chainIcons[nft.blockchainId]} width={14} height={14} className="rounded" />
            </div>
          </div>
          <Typography classNames="w-1/6">{nft.ownerContact.name}</Typography>
          <Typography classNames="w-[12%]">
            {nft.acquiredAt ? format(new Date(nft.acquiredAt), 'dd MMM yyyy') : '-'}
          </Typography>
          <div className="flex flex-col w-1/6 gap-1">
            {nft.costBasisFiatAmount ? (
              <CryptoFiatInfoDisplay
                id={`cost-basis-${nft.id}`}
                classNames="flex flex-col-reverse gap-1 w-fit"
                iso={settings?.country?.iso}
                cryptocurrency={{
                  image: '',
                  amount: nft.costBasisAmount || '0',
                  symbol: nft.costBasisCryptocurrency.symbol,
                  variant: 'caption',
                  color: 'secondary'
                }}
                fiatcurrency={{
                  iso: settings?.country?.iso,
                  currencyCode: fiatCurrency,
                  currencySymbol: settings?.fiatCurrency?.symbol,
                  fiatAmount: nft.costBasisFiatAmount || '0',
                  approximately: false,
                  variant: 'body2',
                  color: 'primary'
                }}
              />
            ) : (
              <Typography color="primary">-</Typography>
            )}
          </div>
          <div className="flex flex-col w-1/6 gap-1">
            {nft.currentValueFiatAmount ? (
              <CryptoFiatInfoDisplay
                id={`curr-value-${nft.id}`}
                classNames="flex flex-col-reverse gap-1 w-fit"
                iso={settings?.country?.iso}
                cryptocurrency={{
                  image: '',
                  amount: nft.currentValueCryptocurrencyAmount || '0',
                  symbol: nft.currentValueCryptocurrency.symbol,
                  variant: 'caption',
                  color: 'secondary'
                }}
                fiatcurrency={{
                  iso: settings?.country?.iso,
                  currencyCode: fiatCurrency,
                  currencySymbol: settings?.fiatCurrency?.symbol,
                  fiatAmount: nft.currentValueFiatAmount || '0',
                  approximately: false,
                  variant: 'body2',
                  color: 'primary'
                }}
              />
            ) : (
              <Typography color="primary">-</Typography>
            )}
          </div>
          <div className="w-1/6 flex">
            <FiatWithTooltip
              id={nft.id}
              fiatCurrency={fiatCurrency}
              settings={settings}
              fiatAmount={nft.gainLoss}
              type="gainLoss"
            />
          </div>
        </button>
      )
    })}
  </div>
)

export default CollectionExtendTable
