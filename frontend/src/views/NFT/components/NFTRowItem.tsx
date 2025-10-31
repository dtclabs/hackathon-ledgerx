import { INft } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import BlueCheck from '@/public/svg/blue-rounded-check.svg'
import ArrowSmallRight from '@/public/svg/icons/arrow-narrow-small-right.svg'
import InfoIcon from '@/public/svg/icons/info-icon-circle-grey.svg'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import { useEffect, useRef } from 'react'
import ReactTooltip from 'react-tooltip'
import FiatWithTooltip from '../../../components-v2/molecules/FiatWithTooltip/FiatWithTooltip'
import { NFTTooltip, getNftImage } from '../nft-utils'

const RowItem = ({
  nft,
  settings,
  chainIcons,
  onSelectNft,
  onSelectCollection,
  onNewLimit,
  isLast
}: {
  nft: INft
  settings: any
  chainIcons: any
  onSelectNft: (item) => void
  onSelectCollection: (item) => void
  onNewLimit: () => void
  isLast: boolean
}) => {
  const cardRef = useRef<HTMLDivElement>()

  useEffect(() => {
    if (!cardRef?.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (isLast && entry.isIntersecting) {
        onNewLimit()
        observer.unobserve(entry.target)
      }
    })

    observer.observe(cardRef.current)
  }, [isLast])

  const fiatCurrency = nft.fiatCurrency || settings?.fiatCurrency?.code

  return (
    <div
      aria-hidden
      style={{
        boxShadow: '0px 0px 80px 0px rgba(0, 0, 0, 0.02), 0px 16px 48px -16px rgba(0, 0, 0, 0.02)'
      }}
      className="flex items-center justify-between text-sm hover:bg-gray-200 hover:cursor-pointer px-6 py-4 rounded-lg"
      ref={cardRef}
      onClick={() => onSelectNft(nft)}
    >
      <div className="flex items-center gap-3 laptop:w-[220px] w-[270px]">
        <div className="shrink-0 h-10">
          <Image alt="nft" src={getNftImage(nft.imageUrl)} width={40} height={40} className="rounded-[4px]" />
        </div>
        <div className="flex flex-col gap-1 space-between">
          <Typography styleVariant="semibold" classNames="laptop:max-w-[180px] max-w-[230px] truncate hover:underline">
            {nft.name}
          </Typography>
          <div className="flex items-center justify-start gap-1">
            <Image src={chainIcons[nft.blockchainId]} width={14} height={14} className="rounded" />
            <DividerVertical height="h-[14px]" space="mx-[2px]" />
            <div
              aria-hidden
              className="flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onSelectCollection(nft.collectionSimplified)
              }}
            >
              <Typography
                color="primary"
                variant="caption"
                classNames="laptop:max-w-[110px] max-w-[160px] truncate hover:underline"
              >
                {nft.collectionSimplified.name}
              </Typography>
              <Image src={BlueCheck} alt="blue-check" width={12} height={12} />
              <Image src={ArrowSmallRight} alt="arrow" width={12} height={12} />
            </div>
          </div>
        </div>
      </div>
      {/* ------ */}
      <div className="flex justify-between laptop:w-[calc(100%-270px)] w-[calc(100%-320px)] gap-4">
        <div className="flex flex-col gap-1 shrink w-1/5">
          <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
            Wallet
          </Typography>
          <Typography color="primary" classNames="truncate">
            {nft.ownerContact.name}
          </Typography>
        </div>
        <div className="flex flex-col gap-1 w-1/5">
          <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
            Date Acquired
          </Typography>
          <Typography color="primary">
            {nft.acquiredAt ? format(new Date(nft.acquiredAt), 'dd MMM yyyy') : '-'}
          </Typography>
        </div>
        <div className="flex flex-col gap-1 w-1/5">
          <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
            Cost Basis
          </Typography>
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
        <div className="flex flex-col gap-1 w-1/5">
          <div className="flex items-center gap-2">
            <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
              Current Value
            </Typography>
            <Image
              data-tip={`curr-value-tooltip-${nft.id}`}
              data-for={`curr-value-tooltip-${nft.id}`}
              src={InfoIcon}
              width={14}
              height={14}
            />
            <ReactTooltip
              id={`curr-value-tooltip-${nft.id}`}
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
        <div className="flex flex-col gap-1 w-1/5">
          <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
            Unrealised Gains/Losses
          </Typography>
          <FiatWithTooltip
            id={nft.id}
            fiatCurrency={fiatCurrency}
            settings={settings}
            fiatAmount={nft.gainLoss}
            type="gainLoss"
          />
        </div>
      </div>
    </div>
  )
}

export default RowItem
