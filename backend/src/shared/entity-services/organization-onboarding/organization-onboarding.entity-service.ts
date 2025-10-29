import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { OrganizationOnboarding } from './organization-onboarding.entity'

@Injectable()
export class OrganizationOnboardingEntityService extends BaseEntityService<OrganizationOnboarding> {
  constructor(
    @InjectRepository(OrganizationOnboarding)
    private OrganizationOnboardingRepository: Repository<OrganizationOnboarding>
  ) {
    super(OrganizationOnboardingRepository)
  }
}
