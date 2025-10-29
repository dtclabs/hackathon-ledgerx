import { Column, Entity, Index, OneToMany } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { NftSyncStatus } from './interfaces'
import { NftAddressSync } from './nft-address-sync.entity'

@Entity()
@Index(`IDX_nftOrganizationSync_organizationId_status`, [`organizationId`, `status`])
export class NftOrganizationSync extends PublicEntity {
  @Column()
  status: NftSyncStatus

  @Column({ name: 'organization_id' })
  organizationId: string

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ type: 'json', nullable: true })
  error: any

  @Column({ name: 'operational_remark', nullable: true })
  operationalRemark: string

  @OneToMany(() => NftAddressSync, (nftAddressSync) => nftAddressSync.nftOrganizationSync)
  nftAddressSyncs: NftAddressSync[]
}
