import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { Organization } from '../organizations/organization.entity'
import { WalletGroup } from '../wallet-groups/wallet-group.entity'
import {
  GnosisWalletMetadata,
  SourceType,
  WalletBalance,
  WalletOwnedCryptocurrenciesMap,
  WalletStatusesEnum
} from './interfaces'
import { WalletSync } from './wallet-sync.entity'

@Entity()
export class Wallet extends PublicEntity {
  @Column()
  name: string

  @Column()
  address: string

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column({ name: 'source_type', type: 'enum', enum: SourceType, default: SourceType.ETH })
  sourceType: SourceType

  @Column({ type: 'json', nullable: true })
  metadata: GnosisWalletMetadata[] | null

  @Column({ name: 'flagged_at', nullable: true })
  flaggedAt: Date

  @ManyToOne(() => WalletGroup, (walletGroup) => walletGroup.wallets)
  @JoinColumn({ name: 'wallet_group_id' })
  walletGroup: WalletGroup

  @Column({ type: 'json', nullable: true })
  balance: WalletBalance

  @Column({ type: 'enum', enum: WalletStatusesEnum, default: WalletStatusesEnum.SYNCED })
  status: WalletStatusesEnum = WalletStatusesEnum.SYNCED

  @Column({ name: 'last_synced_at', nullable: true })
  lastSyncedAt: Date

  @OneToMany(() => WalletSync, (walletSync) => walletSync.wallet)
  walletSyncs: WalletSync[]

  @Column({ name: 'supported_blockchains', type: 'json' })
  supportedBlockchains: string[]

  @Column({ name: 'owned_cryptocurrencies', type: 'json', nullable: true })
  ownedCryptocurrencies: WalletOwnedCryptocurrenciesMap

  static create(param: {
    name: string
    address: string
    organizationId: string
    sourceType: SourceType
    walletGroupId: string
    metadata: GnosisWalletMetadata[] | null
    lastSyncedAt: Date
    supportedBlockchains: string[]
  }) {
    const wallet = new Wallet()
    wallet.name = param.name
    // Preserve case sensitivity for SOL addresses, lowercase for others
    wallet.address = param.sourceType === SourceType.SOL ? param.address : param.address.toLowerCase()
    wallet.organization = { id: param.organizationId } as Organization
    wallet.sourceType = param.sourceType
    wallet.walletGroup = { id: param.walletGroupId } as WalletGroup
    wallet.metadata = param.metadata
    wallet.lastSyncedAt = param.lastSyncedAt
    wallet.supportedBlockchains = param.supportedBlockchains

    return wallet
  }
}
