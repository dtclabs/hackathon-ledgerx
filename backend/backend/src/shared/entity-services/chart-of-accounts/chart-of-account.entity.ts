import { Column, DeepPartial, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { Account } from '../account/account.entity'
import { Integration } from '../integration/integration.entity'
import { Organization } from '../organizations/organization.entity'

@Entity()
@Index('UQ_chart_of_account_remoteId', ['remoteId'], {
  unique: true,
  where: `"deleted_at" IS NULL AND "rootfi_id" IS NULL`
})
@Index('UQ_chart_of_account_rootfiId', ['rootfiId'], {
  unique: true,
  where: `"deleted_at IS NULL AND "merge_id" IS NULL`
})
export class ChartOfAccount extends PublicEntity {
  @Column()
  name: string

  @Column({ nullable: true })
  code: string

  @Column()
  type: COAType

  @Column({ nullable: true })
  description: string

  @Column({ name: 'remote_id', nullable: true })
  remoteId: string

  @Column({ name: 'rootfi_id', nullable: true })
  rootfiId: string

  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integration_name', referencedColumnName: 'name' })
  integration: Integration

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @Column()
  source: COASource

  @Column()
  status: COASourceStatus

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'created_by' })
  createdBy: Account

  @Column({ name: 'platform_id', nullable: true })
  platformId: string

  static create(params: {
    name: string
    code: string
    type: COAType
    organizationId: string
    source?: COASource
    status?: COASourceStatus
    description?: string
    createdBy?: string
    platformId?: string
  }): DeepPartial<ChartOfAccount> {
    const coa: DeepPartial<ChartOfAccount> = {}
    coa.name = params.name
    coa.code = params.code
    coa.type = params.type
    coa.organization = { id: params.organizationId }
    coa.source = params.source ?? COASource.HQ
    coa.status = params.status ?? COASourceStatus.ACTIVE
    coa.description = params.description ?? null
    coa.createdBy = params.createdBy ? { id: params.organizationId } : null
    coa.platformId = params.platformId ?? null
    return coa
  }
}

export enum COAType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EXPENSE = 'EXPENSE',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE'
}

export enum COASource {
  INTEGRATION = 'integration',
  HQ = 'hq'
}

export enum COASourceStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}
