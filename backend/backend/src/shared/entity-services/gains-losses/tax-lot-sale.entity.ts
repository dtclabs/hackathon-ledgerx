import Decimal from 'decimal.js'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { CreateTaxLotSaleDto } from './interfaces'
import { TaxLot } from './tax-lot.entity'

@Entity()
@Index('IDX_tax_lot_sale_walletId_blockchainId', ['walletId', 'blockchainId'])
@Index('IDX_tax_lot_sale_childId', ['financialTransactionChildId'])
@Index('IDX_tax_lot_sale_taxLotId', ['taxLot'])
export class TaxLotSale extends BaseEntity {
  @Column({ name: 'financial_transaction_child_id', type: 'bigint' })
  financialTransactionChildId: string

  @ManyToOne(() => TaxLot, (taxLot) => taxLot.taxLotSales)
  @JoinColumn({ name: 'tax_lot_id' })
  taxLot: TaxLot

  @ManyToOne(() => Cryptocurrency)
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  @Column({ name: 'sold_amount' })
  soldAmount: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'cost_basis_amount', nullable: true })
  costBasisAmount: string

  @Column({ name: 'cost_basis_per_unit', nullable: true })
  costBasisPerUnit: string

  @Column({ name: 'cost_basis_fiat_currency' })
  costBasisFiatCurrency: string

  @Column({ name: 'cost_basis_updated_by' })
  costBasisUpdatedBy: string

  @Column({ name: 'sold_at' })
  soldAt: Date

  @Column({ name: 'wallet_id', type: 'bigint' })
  walletId: string

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string

  @Column('jsonb', { name: 'audit_metadata_list', nullable: true })
  auditMetadataList: TaxLotSaleAuditMetadata[]

  static createFromDto(dto: CreateTaxLotSaleDto): TaxLotSale {
    const taxLotSale = new TaxLotSale()
    taxLotSale.financialTransactionChildId = dto.financialTransactionChildId
    taxLotSale.taxLot = dto.taxLot
    taxLotSale.cryptocurrency = dto.cryptocurrency
    taxLotSale.soldAmount = dto.soldAmount
    taxLotSale.blockchainId = dto.blockchainId
    const costBasisAmount =
      dto.taxLot.costBasisPerUnit !== null ? Decimal.mul(dto.taxLot.costBasisPerUnit, dto.soldAmount) : null
    taxLotSale.costBasisAmount = costBasisAmount ? costBasisAmount.toString() : null
    taxLotSale.costBasisPerUnit = costBasisAmount ? dto.taxLot.costBasisPerUnit : null
    taxLotSale.costBasisFiatCurrency = dto.taxLot.costBasisFiatCurrency
    taxLotSale.costBasisUpdatedBy = dto.updatedBy
    taxLotSale.soldAt = dto.soldAt
    taxLotSale.walletId = dto.walletId
    taxLotSale.organizationId = dto.organizationId
    taxLotSale.auditMetadataList = []

    return taxLotSale
  }
}

export interface TaxLotSaleAuditMetadata {
  updatedAt: Date
  newCostBasisPerUnit: string
  newCostBasisAmount: string
  updatedBy: string
  previousCostBasisPerUnit: string | null
  previousCostBasisAmount: string | null
}
