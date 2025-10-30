import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { Organization } from '../shared/entity-services/organizations/organization.entity'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'

@Entity('portfolio_positions')
@Index(['organizationId', 'walletId', 'symbol'])
@Index(['organizationId', 'symbol'])
export class PortfolioPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'organization_id' })
  organizationId: string

  @ManyToOne(() => Organization)
  organization: Organization

  @Column({ name: 'wallet_id' })
  walletId: string

  @ManyToOne(() => Wallet)
  wallet: Wallet

  @Column()
  symbol: string

  @Column()
  address: string // Token mint address

  @Column()
  blockchain: string

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  quantity: string

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  averageCostPrice: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  totalCost: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  currentPrice: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  currentValue: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  unrealizedPnL: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 2, default: '0' })
  unrealizedPnLPercentage: string

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  realizedPnL: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  totalFees: string // USD

  @Column({ type: 'timestamp', nullable: true })
  firstPurchaseDate: Date

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionDate: Date

  @Column({ type: 'timestamp', nullable: true })
  priceLastUpdatedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  static create(data: Partial<PortfolioPosition>): PortfolioPosition {
    const position = new PortfolioPosition()
    Object.assign(position, data)
    return position
  }
}

@Entity('portfolio_transactions')
@Index(['organizationId', 'walletId'])
@Index(['transactionHash', 'blockchain'])
export class PortfolioTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'organization_id' })
  organizationId: string

  @ManyToOne(() => Organization)
  organization: Organization

  @Column({ name: 'wallet_id' })
  walletId: string

  @ManyToOne(() => Wallet)
  wallet: Wallet

  @Column()
  transactionHash: string

  @Column()
  blockchain: string

  @Column()
  symbol: string

  @Column()
  tokenAddress: string

  @Column({ type: 'enum', enum: ['BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT', 'STAKE', 'UNSTAKE', 'REWARD'] })
  type: string

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  quantity: string

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  pricePerToken: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  totalValue: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  fees: string // USD

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  realizedPnL: string // USD (for SELL transactions)

  @Column({ type: 'timestamp' })
  transactionDate: Date

  @Column({ type: 'bigint', nullable: true })
  blockNumber: number

  @Column({ type: 'json', nullable: true })
  metadata: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  static create(data: Partial<PortfolioTransaction>): PortfolioTransaction {
    const transaction = new PortfolioTransaction()
    Object.assign(transaction, data)
    return transaction
  }
}