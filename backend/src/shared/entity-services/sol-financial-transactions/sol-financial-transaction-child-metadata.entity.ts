import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Category } from '../../../categories/category.entity'
import { ChartOfAccount } from '../chart-of-accounts/chart-of-account.entity'
import { SolFinancialTransactionChild } from './sol-financial-transaction-child.entity'
import {
  SolFinancialTransactionChildMetadataDirection,
  SolFinancialTransactionChildMetadataStatus,
  SolFinancialTransactionChildMetadataSubstatus,
  SolFinancialTransactionChildMetadataType,
  SolGainLossInclusionStatus
} from './interfaces'

@Entity()
export class SolFinancialTransactionChildMetadata extends BaseEntity {
  @OneToOne(
    () => SolFinancialTransactionChild,
    (solFinancialTransactionChild) => solFinancialTransactionChild.solFinancialTransactionChildMetadata
  )
  @JoinColumn({ name: 'sol_financial_transaction_child_id' })
  solFinancialTransactionChild: SolFinancialTransactionChild

  @Column()
  direction: SolFinancialTransactionChildMetadataDirection

  @Column()
  type: SolFinancialTransactionChildMetadataType

  @Column({ type: 'enum', enum: SolFinancialTransactionChildMetadataStatus })
  status: SolFinancialTransactionChildMetadataStatus

  @Column({ type: 'enum', array: true, enum: SolFinancialTransactionChildMetadataSubstatus, default: [] })
  substatuses: SolFinancialTransactionChildMetadataSubstatus[] = []

  @Column({ name: 'fiat_currency', nullable: true })
  fiatCurrency: string

  @Column({ name: 'fiat_amount', nullable: true })
  fiatAmount: string

  @Column({ name: 'fiat_amount_updated_by', nullable: true })
  fiatAmountUpdatedBy: string

  @Column({ name: 'fiat_amount_updated_at', nullable: true })
  fiatAmountUpdatedAt: Date

  @Column({ name: 'fiat_amount_per_unit', nullable: true })
  fiatAmountPerUnit: string

  @Column({ name: 'fiat_amount_per_unit_updated_by', nullable: true })
  fiatAmountPerUnitUpdatedBy: string

  @Column({ name: 'fiat_amount_per_unit_updated_at', nullable: true })
  fiatAmountPerUnitUpdatedAt: Date

  @Column({ name: 'cost_basis', nullable: true })
  costBasis: string

  @Column({ name: 'cost_basis_updated_by', nullable: true })
  costBasisUpdatedBy: string

  @Column({ name: 'cost_basis_updated_at', nullable: true })
  costBasisUpdatedAt: Date

  @Column({ name: 'cost_basis_per_unit', nullable: true })
  costBasisPerUnit: string

  @Column({ name: 'cost_basis_per_unit_updated_by', nullable: true })
  costBasisPerUnitUpdatedBy: string

  @Column({ name: 'cost_basis_per_unit_updated_at', nullable: true })
  costBasisPerUnitUpdatedAt: Date

  @Column({ name: 'gain_loss', nullable: true })
  gainLoss: string

  @Column({ name: 'gain_loss_updated_by', nullable: true })
  gainLossUpdatedBy: string

  @Column({ name: 'gain_loss_updated_at', nullable: true })
  gainLossUpdatedAt: Date

  @Column({ name: 'gain_loss_inclusion_status', type: 'enum', enum: SolGainLossInclusionStatus })
  gainLossInclusionStatus: SolGainLossInclusionStatus

  @Column({ nullable: true })
  metadata: string

  @Column({ name: 'solana_metadata', nullable: true, type: 'json' })
  solanaMetadata: any

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category

  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'corresponding_coa_id' })
  correspondingChartOfAccount: ChartOfAccount

  @Column({ name: 'corresponding_coa_updated_by', nullable: true })
  correspondingChartOfAccountUpdatedBy: string

  @Column({ nullable: true })
  note: string

  static createFromDtoAndChild(
    dto: any,
    child: SolFinancialTransactionChild
  ): SolFinancialTransactionChildMetadata {
    const entity = new SolFinancialTransactionChildMetadata()
    entity.solFinancialTransactionChild = child
    entity.direction = dto.direction
    entity.type = dto.type
    entity.status = dto.status
    entity.gainLossInclusionStatus = dto.gainLossInclusionStatus
    entity.solanaMetadata = dto.solanaMetadata
    return entity
  }
}