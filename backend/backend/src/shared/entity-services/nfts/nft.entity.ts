import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { NftCollection } from '../nft-collections/nft-collection.entity'
import { Organization } from '../organizations/organization.entity'
import { Wallet } from '../wallets/wallet.entity'
import { NftGainLossMetadata, NftTrait, NftTransactionMetadata } from './interfaces'

@Entity()
@Index(`UQ_nft_organization_sourceId_additionalIdNull`, [`organization`, `sourceId`], {
  unique: true,
  where: `"deleted_at" IS NULL AND "source_additional_id" IS NULL`
})
@Index(`UQ_nft_organization_sourceId_additionalId`, [`organization`, `sourceId`, `sourceAdditionalId`, `quantityId`], {
  unique: true,
  where: `"deleted_at" IS NULL AND "source_additional_id" IS NOT NULL AND "quantity_id" IS NOT NULL`
})
@Index(`IDX_nft_organization_nftCollection`, [`organization`, `nftCollection`], {
  where: `"deleted_at" IS NULL`
})
export class Nft extends PublicEntity {
  @Column()
  name: string

  @Column({ name: 'token_id' })
  tokenId: string

  @Column({ name: 'source_id' })
  sourceId: string

  //Optional additional ID for erc1155 case. From data service.
  //If you are looking at this, please check how this is being populated.
  @Column({ name: 'source_additional_id', nullable: true })
  sourceAdditionalId: string

  //Only for ERC1155 as each individual amount need to be unique in our system.
  @Column({ name: 'quantity_id', nullable: true })
  quantityId: number

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'acquired_at' })
  acquiredAt: Date

  @ManyToOne(() => NftCollection)
  @JoinColumn({ name: 'nft_collection_id' })
  nftCollection: NftCollection

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'transaction_hash', nullable: true }) // Should be non-nullable in the future, separate column as I want to search by this column
  transactionHash: string

  @Column({ name: 'transaction_metadata', type: 'json', nullable: true })
  transactionMetadata: NftTransactionMetadata

  @Column({ name: 'gain_loss_metadata', type: 'json', nullable: true })
  gainLossMetadata: NftGainLossMetadata

  @Column({ type: 'json', nullable: true })
  traits: NftTrait[]

  @Column({ name: 'rarity_rank', nullable: true })
  rarityRank: string
}
