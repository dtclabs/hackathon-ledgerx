import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'

@Entity()
export class Blockchain extends BaseEntity {
  @Column({ name: 'public_id', unique: true })
  publicId: string

  @Column()
  name: string

  @Column({ name: 'chain_id', nullable: true })
  chainId: string

  @Column({ name: 'is_enabled' })
  isEnabled: boolean

  @Column({ name: 'is_testnet' })
  isTestnet: boolean

  @Column({ name: 'block_explorer', nullable: true })
  blockExplorer: string

  @Column({ name: 'api_url', nullable: true })
  apiUrl: string

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string

  @Column({ name: 'safe_url', nullable: true })
  safeUrl: string

  @Column({ name: 'coingecko_asset_platform_id', nullable: true })
  coingeckoAssetPlatformId: string

  @Column({ name: 'rpc_url', nullable: true })
  rpcUrl: string

  //https://api.request.finance/currency/chains
  @Column({ name: 'request_finance_name', nullable: true })
  requestFinanceName: string
}
