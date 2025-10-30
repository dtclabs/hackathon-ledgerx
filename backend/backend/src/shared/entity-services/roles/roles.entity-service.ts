import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Role } from './role.entity'
import { ERole } from '../../../roles/interfaces'

@Injectable()
export class RolesEntityService extends BaseEntityService<Role> {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>
  ) {
    super(rolesRepository)
  }

  getByName(role: ERole) {
    return this.findOne({ where: { name: role } })
  }
}
