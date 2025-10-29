import { Column, Entity, Unique } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import {
  NftCollectionContractAddress,
  NftCollectionContractStandard,
  NftCollectionFloorPriceAggregate
} from './interfaces'

@Entity({ name: 'nft_collection' })
@Unique(`UQ_nftCollection_sourceId`, [`sourceId`])
export class NftCollection extends PublicEntity {
  @Column()
  name: string

  @Column({ name: 'contract_addresses', type: 'json' })
  contractAddresses: NftCollectionContractAddress[]

  @Column({ name: 'source_id' })
  sourceId: string

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string

  @Column({ name: 'banner_image_url', nullable: true })
  bannerImageUrl: string

  @Column({ nullable: true })
  description: string

  @Column({ name: 'contract_standard', nullable: true })
  contractStandard: NftCollectionContractStandard

  @Column({ name: 'token_count', type: 'numeric', nullable: true })
  tokenCount: number

  @Column({ name: 'floor_prices', type: 'json', nullable: true })
  floorPriceAggregate: NftCollectionFloorPriceAggregate

  @Column({ name: 'floor_price_updated_at', nullable: true })
  floorPriceUpdatedAt: Date
}
