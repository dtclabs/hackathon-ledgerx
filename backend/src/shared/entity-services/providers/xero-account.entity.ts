import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { Account } from '../account/account.entity'

@Entity({ name: 'auth_xero' })
@Index('IDX_auth_xero_user_id', ['xeroUserId'])
export class AuthXero extends BaseEntity {
  @Column({ nullable: true })
  @ApiProperty()
  email: string

  @Column({ unique: true, name: 'xero_user_id' })
  @ApiProperty()
  xeroUserId: string

  @ManyToOne(() => Account, (account) => account.xeroAccounts)
  @JoinColumn({ name: 'account_id' })
  @ApiProperty({ type: () => Account })
  account: Account
}
