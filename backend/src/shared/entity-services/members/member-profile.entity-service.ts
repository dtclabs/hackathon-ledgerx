import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { MemberProfile } from './member-profile.entity'

@Injectable()
export class MemberProfileEntityService extends BaseEntityService<MemberProfile> {
  constructor(
    @InjectRepository(MemberProfile)
    private memberProfileRepository: Repository<MemberProfile>
  ) {
    super(memberProfileRepository)
  }
}
