import { Column, Entity, Unique } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { EProvider } from '../../../auth/interfaces'

@Entity()
@Unique('UQ_auth_whitelist_identifier_provider', ['identifier', 'provider'])
export class AuthWhitelist extends BaseEntity {
  @Column()
  identifier: string

  @Column()
  provider: EProvider
}
