import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../shared/entity-services/base.entity-service'
import { Group } from './group.entity'

@Injectable()
export class GroupsService extends BaseEntityService<Group> {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>
  ) {
    super(groupsRepository)
  }
}
