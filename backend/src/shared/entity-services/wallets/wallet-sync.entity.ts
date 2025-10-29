import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { WalletStatusesEnum } from './interfaces'
import { Wallet } from './wallet.entity'

@Entity()
export class WalletSync extends BaseEntity {
  @ManyToOne(() => Wallet, (wallet) => wallet.walletSyncs)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet

  @Column({ type: 'enum', enum: WalletStatusesEnum, nullable: true })
  status: WalletStatusesEnum

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ name: 'last_synced_at', nullable: true })
  lastSyncedAt: Date

  static create(param: { wallet: Wallet; status: WalletStatusesEnum; blockchainId: string; lastSyncedAt?: Date }) {
    const walletSync = new WalletSync()
    walletSync.wallet = param.wallet
    walletSync.status = param.status
    walletSync.blockchainId = param.blockchainId
    walletSync.lastSyncedAt = param.lastSyncedAt ?? null

    return walletSync
  }
}
