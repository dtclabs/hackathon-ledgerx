import { ApiProperty } from '@nestjs/swagger'
import { Column, DeepPartial, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { Token } from '../../tokens/token.entity'
import { MemberProfile } from '../member-profile.entity'
import { Cryptocurrency } from '../../cryptocurrencies/cryptocurrency.entity'

@Entity()
export class MemberAddress extends BaseEntity {
  @Column()
  @ApiProperty()
  address: string

  @ManyToOne(() => MemberProfile, (member) => member.addresses)
  @JoinColumn({ name: 'member_profile_id' })
  @ApiProperty()
  profile: MemberProfile

  @Column({ name: 'blockchain_id' })
  @ApiProperty()
  blockchainId: string

  // TODO: Legacy field, remove after migration
  @ManyToOne(() => Token, { nullable: true })
  @JoinColumn()
  token: Token

  @ManyToOne(() => Cryptocurrency)
  @JoinColumn({ name: 'cryptocurrency_id' })
  cryptocurrency: Cryptocurrency

  static create(params: {
    address: string
    memberProfileId: string
    blockchainId: string
    cryptocurrencyId: string
    tokenId?: number
  }): DeepPartial<MemberAddress> {
    const entity: DeepPartial<MemberAddress> = {}
    entity.address = params.address.toLowerCase()
    entity.profile = { id: params.memberProfileId }
    entity.blockchainId = params.blockchainId
    entity.cryptocurrency = { id: params.cryptocurrencyId }
    entity.token = params.tokenId ? { id: params.tokenId } : null
    return entity
  }
}
