import { Column, Entity, Unique } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'

@Entity()
@Unique('UQ_whitelisted_address', ['address'])
export class WhitelistedAddress extends BaseEntity {
  @Column()
  address: string

  @Column({ nullable: true })
  description: string

  @Column({ name: 'requested_by' })
  requestedBy: string
}
