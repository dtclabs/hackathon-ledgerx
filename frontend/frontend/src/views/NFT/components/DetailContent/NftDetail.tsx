import { INft } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import BlueCheck from '@/public/svg/blue-rounded-check.svg'
import ArrowSmallRight from '@/public/svg/icons/arrow-narrow-small-right.svg'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import { useMemo } from 'react'
import FiatWithTooltip from '../../../../components-v2/molecules/FiatWithTooltip/FiatWithTooltip'
import { DetailType, getNftImage } from '../../nft-utils'
import FloorPriceTable from './FloorValueTable'
import TraitsTable from './TraitsTable'

const NftDetail = ({
  nft,
  chainIcons,
  contractAddress,
  onClickCollection
}: {
  nft: INft
  chainIcons: any
  contractAddress: string
  onClickCollection: () => void
}) => {
  const orgSettings = useAppSelector(orgSettingsSelector)
  const average = useMemo(() => {
    if (nft.floorPrices?.length) {
      const totalAmount = nft.floorPrices?.reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue.cryptocurrencyAmount) || 0,
        0
      )
      const totalFiatAmount = nft.floorPrices?.reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue.fiatCurrencyAmount) || 0,
        0
      )
      return {
        amount: (totalAmount / nft.floorPrices.length).toString(),
        fiatAmount: (totalFiatAmount / nft.floorPrices.length).toString()
      }
    }
    return {
      amount: null,
      fiatAmount: null
    }
  }, [nft.floorPrices])

  const fiatCurrency = nft.fiatCurrency || orgSettings?.fiatCurrency?.code

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex gap-8 w-full">
        <div>
          <Image
            src={getNftImage(nft.imageUrl)}
            alt="nft"
            className="rounded-lg"
            width={400}
            height={400}
            layout="fixed"
          />
        </div>
        <div className="flex flex-col gap-4 w-full">
          {/* collection name */}
          <div
            aria-hidden
            onClick={onClickCollection}
            className="flex items-center justify-start gap-1 hover:underline hover:cursor-pointer"
          >
            <Typography color="primary" classNames="truncate">
              {nft.collectionSimplified.name}
            </Typography>
            <Image src={BlueCheck} alt="blue-check" width={14} height={14} />
            <Image src={ArrowSmallRight} alt="arrow" width={14} height={14} />
          </div>
          {/* nft name */}
          <div className="flex items-center justify-between">
            <Typography color="primary" variant="heading3" classNames="truncate">
              {nft.name}
            </Typography>
            <div className="flex items-center">
              <Image src={chainIcons[nft.blockchainId]} width={16} height={16} className="rounded" />
              <DividerVertical height="h-[16px]" space="mx-2" />
              <Typography color="primary" styleVariant="semibold" variant="body1" classNames="max-w-[200px] truncate">
                ID: {nft.tokenId || '-'}
              </Typography>
            </div>
          </div>
          {/* current value */}
          <FloorPriceTable
            id={nft.id}
            type={DetailType.NFT}
            tokenId={nft.tokenId}
            blockchainId={nft.blockchainId}
            contractAddress={contractAddress}
            averageFiatAmount={average.fiatAmount}
            averageAmount={average.amount}
            cryptocurrency={nft.costBasisCryptocurrency?.symbol || 'ETH'}
            fiatCurrency={nft?.fiatCurrency || orgSettings?.fiatCurrency?.code}
            values={nft.floorPrices || []}
            orgSettings={orgSettings}
            title="Current Value"
          />
          {/* cost basis */}
          <div className="rounded-lg border grid grid-cols-4 gap-3 border-grey-200 p-4">
            <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Cost Basis
              </Typography>
              {nft.costBasisFiatAmount ? (
                <CryptoFiatInfoDisplay
                  id={`cost-basis-${nft.id}`}
                  classNames="flex flex-col-reverse gap-1 w-fit"
                  iso={orgSettings?.country?.iso}
                  cryptocurrency={{
                    image: '',
                    amount: nft.costBasisAmount || '0',
                    symbol: nft.costBasisCryptocurrency.symbol,
                    variant: 'caption',
                    color: 'secondary'
                  }}
                  fiatcurrency={{
                    iso: orgSettings?.country?.iso,
                    currencyCode: fiatCurrency,
                    currencySymbol: orgSettings?.fiatCurrency?.symbol,
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
            <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Unrealised Gains/Losses
              </Typography>
              <FiatWithTooltip
                id={nft.id}
                fiatCurrency={fiatCurrency}
                settings={orgSettings}
                fiatAmount={nft.gainLoss}
                type="gainLoss"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Wallet
              </Typography>
              <Typography color="primary">{nft.ownerContact.name}</Typography>
            </div>
            <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Chain
              </Typography>
              <Typography color="primary" classNames="capitalize">
                {nft.blockchainId}
              </Typography>
            </div>
          </div>

          <div className="rounded-lg border grid grid-cols-4 gap-3 border-grey-200 p-4">
            <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Date of Acquisition
              </Typography>
              <Typography color="primary">
                {nft.acquiredAt ? format(new Date(nft.acquiredAt), 'dd MMM yyyy') : '-'}
              </Typography>
            </div>
            {/* <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Acquisition Method
              </Typography>
              <Typography color="primary">Purchase</Typography>
            </div> */}
            <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Last Updated
              </Typography>
              <Typography color="primary">
                {nft.acquiredAt ? format(new Date(nft.acquiredAt), 'dd MMM yyyy') : '-'}
              </Typography>
            </div>
            <div className="flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Rarity Rank
              </Typography>
              <Typography color="primary" classNames="capitalize">
                {nft.rarityRank || '-'}
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <TraitsTable traits={nft.traits} id={nft.id} />
    </div>
  )
}

export default NftDetail
