import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, Unique } from 'typeorm'
import { BaseEntity } from '../core/entities/base.entity'

@Entity()
@Unique(['organizationId', 'name'])
export class Group extends BaseEntity {
  @Column()
  @ApiProperty()
  organizationId: string

  @Column()
  @ApiProperty()
  name: string

  @Column({ nullable: true })
  @ApiProperty()
  description: string

  // @ManyToMany(() => Account, (account) => account.groups)
  // @JoinTable({ name: 'group_members' })
  // @ApiProperty()
  // accounts: Account[]
}
