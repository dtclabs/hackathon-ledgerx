import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { SolFinancialTransactionChild } from './sol-financial-transaction-child.entity'
import {
  CreateSolFinancialTransactionParentDto,
  SolFinancialTransactionParentActivity,
  SolFinancialTransactionParentExportStatus,
  SolFinancialTransactionParentStatus
} from './interfaces'

@Entity()
@Index('UQ_sol_financial_transaction_parent_publicId_organizationId', ['publicId', 'organizationId'], {
  unique: true,
  where: `"deleted_at" IS NULL`
})
@Index('IDX_sol_financial_transaction_parent_organizationId_exportStatus', ['organizationId', 'exportStatus'], {
  where: `"deleted_at" IS NULL`
})
export class SolFinancialTransactionParent extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  hash: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column()
  activity: SolFinancialTransactionParentActivity

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string

  @Column()
  status: SolFinancialTransactionParentStatus

  @Column({ name: 'export_status' })
  exportStatus: SolFinancialTransactionParentExportStatus

  @Column({ name: 'export_status_reason', nullable: true })
  exportStatusReason: string

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date

  @Column({ name: 'block_number', nullable: true })
  blockNumber: number

  @Column({ nullable: true })
  slot: number

  @Column({ nullable: true })
  fee: string

  @Column({ nullable: true })
  remark: string

  @OneToMany(
    () => SolFinancialTransactionChild,
    (solFinancialTransactionChild) => solFinancialTransactionChild.solFinancialTransactionParent
  )
  solFinancialTransactionChild: SolFinancialTransactionChild[]

  static create(createDto: CreateSolFinancialTransactionParentDto): SolFinancialTransactionParent {
    const solFinancialTransactionParent = new SolFinancialTransactionParent()
    solFinancialTransactionParent.publicId = createDto.publicId
    solFinancialTransactionParent.hash = createDto.hash
    solFinancialTransactionParent.blockchainId = createDto.blockchainId
    solFinancialTransactionParent.activity = createDto.activity
    solFinancialTransactionParent.status = createDto.status
    solFinancialTransactionParent.exportStatus = createDto.exportStatus
    solFinancialTransactionParent.organizationId = createDto.organizationId
    solFinancialTransactionParent.valueTimestamp = createDto.valueTimestamp
    solFinancialTransactionParent.blockNumber = createDto.blockNumber
    solFinancialTransactionParent.slot = createDto.slot
    solFinancialTransactionParent.fee = createDto.fee
    solFinancialTransactionParent.remark = createDto.remark
    return solFinancialTransactionParent
  }

  static createFromDto(createDto: CreateSolFinancialTransactionParentDto): SolFinancialTransactionParent {
    return this.create(createDto)
  }
}