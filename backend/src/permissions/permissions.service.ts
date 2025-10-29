import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../shared/entity-services/base.entity-service'
import { Permission } from './permission.entity'

@Injectable()
export class PermissionsService extends BaseEntityService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>
  ) {
    super(permissionsRepository)
  }
}
