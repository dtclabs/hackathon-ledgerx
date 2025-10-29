import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { NftAddressSyncMetadata, NftSyncStatus } from './interfaces'
import { NftOrganizationSync } from './nft-organization-sync.entity'

@Entity()
@Index(`IDX_nftAddressSync_organizationId_status`, [`organizationId`, `status`])
export class NftAddressSync extends BaseEntity {
  @Column()
  address: string

  @Column()
  blockchainId: string // Only ethereum for now

  @Column({ name: 'sync_id', nullable: true })
  syncId: string

  @Column()
  status: NftSyncStatus

  @Column({ name: 'organization_id' })
  organizationId: string

  @Column({ name: 'wallet_id' })
  walletId: string

  @Column({ name: 'last_executed_at', nullable: true })
  lastExecutedAt: Date

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ type: 'json', nullable: true })
  error: any

  @Column({ type: 'json', nullable: true })
  metadata: NftAddressSyncMetadata

  @Column({ name: 'operational_remark', nullable: true })
  operationalRemark: string

  @ManyToOne(() => NftOrganizationSync, (nftOrganizationSync) => nftOrganizationSync.nftAddressSyncs)
  @JoinColumn({ name: 'nft_organization_sync_id' })
  nftOrganizationSync: NftOrganizationSync
}
