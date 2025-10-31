import { INftCollection } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import BlueCheck from '@/public/svg/blue-rounded-check.svg'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import Image from 'next/legacy/image'
import { useMemo, useState } from 'react'
import FiatWithTooltip from '../../../../components-v2/molecules/FiatWithTooltip/FiatWithTooltip'
import { DetailType, getNftImage } from '../../nft-utils'
import FloorPriceTable from './FloorValueTable'
import NftOwnedTable from './NftOwnedTable'

const CollectionDetail = ({
  collection,
  chainIcons,
  onClickNft
}: {
  collection: INftCollection
  chainIcons: any
  onClickNft: (nft) => void
}) => {
  const orgSettings = useAppSelector(orgSettingsSelector)
  const [search, setSearch] = useState('')

  // NOTE: client side search for now
  const ownedNfts = useMemo(
    () => collection.nftSimplifiedList?.filter((nft) => nft.name?.toLowerCase().includes(search.toLowerCase())) || [],
    [collection.nftSimplifiedList, search]
  )

  const fiatCurrency = collection?.fiatCurrency || orgSettings?.fiatCurrency?.code

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex gap-8 w-full">
        <div>
          <Image
            src={getNftImage(collection.imageUrl)}
            alt="nft"
            className="rounded-lg"
            layout="fixed"
            width={112}
            height={112}
          />
        </div>
        <div className="flex flex-col gap-4 w-full">
          {/* collection name */}
          <div className="flex items-center justify-start gap-1">
            <Typography color="primary" variant="heading3" classNames="truncate">
              {collection.name}
            </Typography>
            <Image src={BlueCheck} alt="blue-check" width={14} height={14} />
          </div>
          {/* detail */}
          <div className="flex gap-2 rounded-lg border border-grey-200 p-4">
            <div className="w-1/5 flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Chains
              </Typography>
              <ChainList chains={collection.blockChains || []} />
            </div>
            <div className="w-1/5 flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Contract Address
              </Typography>
              <WalletAddress address={collection.contractAddresses[0].contractAddress}>
                <WalletAddress.Link address={collection.contractAddresses[0].contractAddress} isMultiple={false} />
                <WalletAddress.Copy address={collection.contractAddresses[0].contractAddress} />
              </WalletAddress>
            </div>
            <div className="w-1/5 flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Total Cost Basis
              </Typography>
              {collection.totalCostBasisFiatAmount ? (
                <CryptoFiatInfoDisplay
                  id={`cost-basis-${collection.id}`}
                  classNames="flex flex-col-reverse gap-1 w-fit"
                  iso={orgSettings?.country?.iso}
                  cryptocurrency={{
                    image: '',
                    amount: collection.totalCostBasisAmount || '0',
                    symbol: collection.floorPriceAggregate.floorPriceAverageCryptocurrency?.symbol || 'ETH',
                    variant: 'caption',
                    color: 'secondary'
                  }}
                  fiatcurrency={{
                    iso: orgSettings?.country?.iso,
                    currencyCode: fiatCurrency,
                    currencySymbol: orgSettings?.fiatCurrency?.symbol,
                    fiatAmount: collection.totalCostBasisFiatAmount || '0',
                    approximately: false,
                    variant: 'body2',
                    color: 'primary'
                  }}
                />
              ) : (
                <Typography color="primary">-</Typography>
              )}
            </div>
            <div className="w-1/5 flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Total Current Value
              </Typography>
              {collection.totalCurrentFiatAmount ? (
                <CryptoFiatInfoDisplay
                  id={`curr-value-${collection.id}`}
                  classNames="flex flex-col-reverse gap-1 w-fit"
                  iso={orgSettings?.country?.iso}
                  cryptocurrency={{
                    image: '',
                    amount: collection.totalCurrentAmount || '0',
                    symbol: collection.floorPriceAggregate.floorPriceAverageCryptocurrency?.symbol || 'ETH',
                    variant: 'caption',
                    color: 'secondary'
                  }}
                  fiatcurrency={{
                    iso: orgSettings?.country?.iso,
                    currencyCode: fiatCurrency,
                    currencySymbol: orgSettings?.fiatCurrency?.symbol,
                    fiatAmount: collection.totalCurrentFiatAmount || '0',
                    approximately: false,
                    variant: 'body2',
                    color: 'primary'
                  }}
                />
              ) : (
                <Typography color="primary">-</Typography>
              )}
            </div>
            <div className="w-1/5 flex flex-col gap-1">
              <Typography color="secondary" styleVariant="semibold" variant="caption">
                Unrealised Gains/Losses
              </Typography>
              <FiatWithTooltip
                id={collection.id}
                fiatCurrency={fiatCurrency}
                settings={orgSettings}
                fiatAmount={collection.totalGainLoss}
                type="gainLoss"
              />
            </div>
          </div>
        </div>
      </div>
      {/* floor price */}
      <FloorPriceTable
        id={collection.id}
        type={DetailType.COLLECTION}
        blockchainId={collection.blockChains?.[0]?.id || 'ethereum'}
        contractAddress={collection.contractAddresses?.[0]?.contractAddress}
        averageFiatAmount={collection.floorPriceAggregate.floorPriceAverageFiatAmount}
        averageAmount={collection.floorPriceAggregate.floorPriceAverageCryptocurrencyAmount}
        cryptocurrency={collection.floorPriceAggregate.floorPriceAverageCryptocurrency?.symbol}
        fiatCurrency={fiatCurrency}
        values={collection.floorPriceAggregate.floorPrices}
        orgSettings={orgSettings}
      />
      <NftOwnedTable
        settings={orgSettings}
        chainIcons={chainIcons}
        nfts={ownedNfts}
        search={search}
        onChildClick={onClickNft}
        onSearch={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}

export default CollectionDetail
