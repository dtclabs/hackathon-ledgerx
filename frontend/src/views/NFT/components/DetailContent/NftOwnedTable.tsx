import { INftsSimplified } from '@/api-v2/nft/nfts.type'
import { Input } from '@/components-v2'
import Typography from '@/components-v2/atoms/Typography'
import { format } from 'date-fns'
import Image from 'next/legacy/image'
import FiatWithTooltip from '../../../../components-v2/molecules/FiatWithTooltip/FiatWithTooltip'
import { getNftImage } from '../../nft-utils'

const NftOwnedTable = ({
  nfts,
  chainIcons,
  settings,
  search,
  onChildClick,
  onSearch
}: {
  nfts: INftsSimplified[]
  chainIcons: any
  settings: any
  search?: string
  onChildClick: (item) => void
  onSearch: (e) => void
}) => (
  <div className="rounded-lg border border-grey-200">
    <div className="rounded-t-lg flex items-center justify-between p-4 bg-gray-50">
      <Typography color="primary" variant="body1" styleVariant="semibold">
        NFTs Owned ({nfts?.length || 0})
      </Typography>
      <div className="w-1/3 bg-white">
        <Input
          onChange={onSearch}
          value={search}
          classNames="text-sm h-[32px]"
          isSearch
          placeholder="Search by NFT name"
          id="nft-detail-search-input"
        />
      </div>
    </div>
    {nfts?.length > 0 ? (
      <div className="grid grid-cols-3 p-4 gap-3">
        {nfts.map((nft) => {
          const fiatCurrency = nft.fiatCurrency || settings?.fiatCurrency?.code
          return (
            <button
              type="button"
              key={`detail-table-${nft.id}`}
              onClick={() => onChildClick(nft)}
              className="rounded-lg border border-grey-200 text-left hover:bg-grey-100"
            >
              <div className="flex gap-3 p-4 border-b border-grey-200">
                <div>
                  <Image
                    alt="nft"
                    src={getNftImage(nft.imageUrl)}
                    width={70}
                    height={70}
                    layout="fixed"
                    className="rounded-[4px]"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1 truncate">
                  <Typography color="primary" styleVariant="semibold" classNames="truncate mb-2">
                    {nft.name}
                  </Typography>
                  <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
                    Date of Acquisition
                  </Typography>
                  <Typography color="primary">
                    {nft.acquiredAt ? format(new Date(nft.acquiredAt), 'dd MMM yyyy') : '-'}
                  </Typography>
                </div>
                <div>
                  <Image src={chainIcons[nft.blockchainId]} width={18} height={18} className="rounded" />
                </div>
              </div>
              <div className="flex gap-4 p-4">
                <div className="w-1/2 flex flex-col gap-1">
                  <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
                    Cost Basis
                  </Typography>
                  <FiatWithTooltip
                    id={nft.id}
                    fiatCurrency={fiatCurrency}
                    settings={settings}
                    fiatAmount={nft.costBasisFiatAmount}
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-1">
                  <Typography color="secondary" variant="caption" styleVariant="semibold" classNames="leading-4">
                    Current Value
                  </Typography>
                  <FiatWithTooltip
                    id={nft.id}
                    fiatCurrency={fiatCurrency}
                    settings={settings}
                    fiatAmount={nft.currentValueFiatAmount}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    ) : (
      <div className="h-[200px] flex items-center justify-center">
        <Typography color="secondary" variant="heading3">
          No NFT Found
        </Typography>
      </div>
    )}
  </div>
)

export default NftOwnedTable
