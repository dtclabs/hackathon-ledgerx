import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../core/entities/base.entity'
import { Role } from '../shared/entity-services/roles/role.entity'
import { Action, Resource } from './interfaces'

@Entity()
export class Permission extends BaseEntity {
  @ManyToOne(() => Role, (role) => role.permissions)
  @JoinColumn({ name: 'role_id' })
  role: Role

  @Column()
  @ApiProperty()
  resource: Resource

  @Column()
  @ApiProperty()
  action: Action
}
