import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { ChartOfAccount } from '../chart-of-accounts/chart-of-account.entity'
import { Recipient } from '../contacts/recipient.entity'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { FinancialTransactionChildMetadataDirection } from '../financial-transactions/interfaces'
import { Organization } from '../organizations/organization.entity'
import { Wallet } from '../wallets/wallet.entity'
import { ChartOfAccountMappingType } from './interfaces'

@Entity()
@Index('IDX_coa_map_organization_type', ['organization', 'type'], {
  where: `"deleted_at" IS NULL`
})
export class ChartOfAccountMapping extends PublicEntity {
  @Column()
  type: ChartOfAccountMappingType

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization

  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'chart_of_account_id' })
  chartOfAccount: ChartOfAccount

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet

  @ManyToOne(() => Cryptocurrency)
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  @ManyToOne(() => Recipient)
  @JoinColumn({ name: 'recipient_id' })
  recipient: Recipient

  @Column({ nullable: true })
  direction: FinancialTransactionChildMetadataDirection
}
