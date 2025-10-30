import { INftCollection } from '@/api-v2/nft/nfts.type'
import Typography from '@/components-v2/atoms/Typography'
import Accordion from '@/components-v2/molecules/Accordion'
import ChainList from '@/components-v2/molecules/ChainList/ChainList'
import { CryptoFiatInfoDisplay } from '@/components-v2/molecules/CryptoFiatInfoDisplay'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import BlueCheck from '@/public/svg/blue-rounded-check.svg'
import InfoIcon from '@/public/svg/icons/info-icon-circle-grey.svg'
import { numToWord } from '@/utils-v2/numToWord'
import Image from 'next/legacy/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import FiatWithTooltip from '../../../../components-v2/molecules/FiatWithTooltip/FiatWithTooltip'
import { NFTTooltip, getNftImage } from '../../nft-utils'
import CollectionExtendTable from './CollectionExtendTable'

const CollectionRowItem = ({
  collection,
  isLast,
  extendSettings,
  orgSettings,
  blockChainsFilter,
  chainIcons,
  newLimit,
  onSelectNft,
  setExtendSettings,
  onSelectCollection
}: {
  collection: INftCollection
  extendSettings: { collapseAll: boolean; extendAll: boolean }
  isLast: boolean
  orgSettings: any
  chainIcons: any
  blockChainsFilter: any[]
  newLimit: () => void
  onSelectNft: (nft) => void
  onSelectCollection: (collection) => void
  setExtendSettings: (extendSettings: { collapseAll: boolean; extendAll: boolean }) => void
}) => {
  const [isExtend, setIsExtend] = useState(false)

  const cardRef = useRef<HTMLDivElement>()

  const blockChainList = useMemo(
    () =>
      collection.blockChains
        .map((chain) => ({
          ...chain,
          isGrayedOut: !blockChainsFilter && !blockChainsFilter?.find((blockChainId) => blockChainId === chain.id)
        }))
        .sort((chain) => (chain.isGrayedOut ? -1 : 1)),
    [collection.blockChains, blockChainsFilter]
  )

  useEffect(() => {
    if (!cardRef?.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (isLast && entry.isIntersecting) {
        newLimit()
        observer.unobserve(entry.target)
      }
    })

    observer.observe(cardRef.current)
  }, [isLast])

  useEffect(() => {
    if (extendSettings?.extendAll) {
      setIsExtend(true)
    } else if (extendSettings?.collapseAll) {
      setIsExtend(false)
    }
  }, [extendSettings?.collapseAll, extendSettings?.extendAll])

  const fiatCurrency = collection.fiatCurrency || orgSettings?.fiatCurrency?.code

  return (
    <Accordion
      fullWidth
      isExpand={isExtend}
      setIsExpand={setIsExtend}
      onExpandClick={() => {
        setExtendSettings({ ...extendSettings, collapseAll: false })
      }}
      onCollapseClick={() => {
        setExtendSettings({ ...extendSettings, extendAll: false })
      }}
      expandElement={
        <CollectionExtendTable
          id={collection.id}
          nfts={collection.nftSimplifiedList}
          chainIcons={chainIcons}
          settings={orgSettings}
          onChildClick={(nft) => {
            onSelectNft(nft)
            onSelectCollection(collection)
          }}
        />
      }
      wrapperClassName="bg-white rounded-lg shadow-card-2 hover:cursor-pointer px-6 py-4"
    >
      <div className="w-full flex items-center" ref={cardRef}>
        <div className="flex justify-between w-full gap-3">
          <div className="flex items-center gap-3 w-[22%] max-w-[250px] laptop:max-w-[200px]">
            <div className="shrink-0 h-10">
              <Image
                alt="collection"
                src={getNftImage(collection.imageUrl)}
                width={40}
                height={40}
                className="rounded-[4px]"
              />
            </div>
            <div>
              <div
                aria-hidden
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectCollection(collection)
                }}
                className="flex items-center gap-1"
              >
                <Typography
                  styleVariant="semibold"
                  classNames="laptop:max-w-[120px] max-w-[170px] truncate hover:underline"
                >
                  {collection.name}
                </Typography>
                <div className="shrink-0">
                  <Image src={BlueCheck} alt="blue-check" width={12} height={12} />
                </div>
              </div>
              <div className="flex items-center">
                <ChainList chains={blockChainList || []} />
              </div>
            </div>
          </div>
          <div className="flex flex-col w-1/6 gap-1">
            <div className="flex items-center gap-2">
              <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
                Floor Price
              </Typography>
              <Image
                data-tip={`floor-price-tooltip-${collection.id}`}
                data-for={`floor-price-tooltip-${collection.id}`}
                src={InfoIcon}
                width={14}
                height={14}
              />
              <ReactTooltip
                id={`floor-price-tooltip-${collection.id}`}
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg w-[280px]"
              >
                {NFTTooltip.FLOOR_PRICE}
              </ReactTooltip>
            </div>
            <Typography color="primary">
              {collection.floorPriceAggregate.floorPriceAverageFiatAmount
                ? `${orgSettings?.fiatCurrency?.symbol}${numToWord(
                    collection.floorPriceAggregate.floorPriceAverageFiatAmount?.toString() || '0'
                  )} ${fiatCurrency}`
                : '-'}
            </Typography>
            <Typography color="secondary" variant="caption">
              {collection.floorPriceAggregate.floorPriceAverageCryptocurrencyAmount
                ? `${numToWord(
                    collection.floorPriceAggregate.floorPriceAverageCryptocurrencyAmount?.toString() || '0'
                  )} ${collection.floorPriceAggregate.floorPriceAverageCryptocurrency?.symbol || 'ETH'}`
                : '-'}
            </Typography>
          </div>
          <div className="flex flex-col w-[12%] gap-1">
            <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
              # Items Owned
            </Typography>
            <Typography color="primary">{collection.totalNft}</Typography>
          </div>
          <div className="flex flex-col w-1/6 gap-1">
            <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
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
          <div className="flex flex-col w-1/6 gap-1">
            <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
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
          <div className="flex flex-col gap-1 w-1/6">
            <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
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
        <DividerVertical height="h-10" space="ml-4" />
        <div className="p-[6px] ml-4 rounded h-6 w-6 bg-grey-200 flex items-center justify-center">
          <Image
            src="/svg/Dropdown.svg"
            alt="DownArrow"
            className={isExtend ? 'rotate-180 ' : ''}
            height={10}
            width={15}
          />
        </div>
      </div>
    </Accordion>
  )
}

export default CollectionRowItem
