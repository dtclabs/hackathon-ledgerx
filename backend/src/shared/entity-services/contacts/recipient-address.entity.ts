import { ApiProperty } from '@nestjs/swagger'
import { Column, DeepPartial, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { Cryptocurrency } from '../cryptocurrencies/cryptocurrency.entity'
import { Token } from '../tokens/token.entity'
import { Recipient } from './recipient.entity'

@Entity()
export class RecipientAddress extends PublicEntity {
  @Column()
  @ApiProperty()
  address: string

  @ManyToOne(() => Recipient, (recipient) => recipient.recipientAddresses)
  @JoinColumn({ name: 'recipient_id' })
  @ApiProperty()
  recipient: Recipient

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  // // TODO: Legacy field, remove after migration
  @ManyToOne(() => Token, (token) => token.recipientAddresses, { nullable: true })
  @JoinColumn()
  token: Token

  @ManyToOne(() => Cryptocurrency, { nullable: true })
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  static create(param: {
    address: string
    recipientId: string
    blockchainId: string
    tokenId?: number
    cryptocurrencyId?: string
  }): DeepPartial<RecipientAddress> {
    const entity: DeepPartial<RecipientAddress> = {}
    // Preserve case for Solana addresses, lowercase for EVM
    entity.address = param.blockchainId?.toLowerCase().includes('solana') 
      ? param.address 
      : param.address.toLowerCase()
    entity.recipient = { id: param.recipientId }
    entity.blockchainId = param.blockchainId
    if (param.tokenId) {
      entity.token = { id: param.tokenId }
    }
    if (param.cryptocurrencyId) {
      entity.cryptocurrency = { id: param.cryptocurrencyId }
    }

    return entity
  }
}
