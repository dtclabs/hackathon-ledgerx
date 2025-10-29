import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../base.entity-service'
import { MemberContact } from './member-contact.entity'

@Injectable()
export class MemberContactsEntityService extends BaseEntityService<MemberContact> {
  constructor(
    @InjectRepository(MemberContact)
    private memberContactRepository: Repository<MemberContact>
  ) {
    super(memberContactRepository)
  }
}
