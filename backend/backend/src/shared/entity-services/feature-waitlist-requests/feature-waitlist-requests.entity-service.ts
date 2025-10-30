import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, In, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { FeatureName, FeatureWaitlistRequest } from './feature-waitlist-requests.entity'

@Injectable()
export class FeatureWaitlistRequestsEntityService extends BaseEntityService<FeatureWaitlistRequest> {
  constructor(
    @InjectRepository(FeatureWaitlistRequest)
    private featureWaitlistRequestRepository: Repository<FeatureWaitlistRequest>
  ) {
    super(featureWaitlistRequestRepository)
  }

  getByOrganizationId(organizationId: string, featureNames?: FeatureName[]): Promise<FeatureWaitlistRequest[]> {
    const whereCondition: FindOptionsWhere<FeatureWaitlistRequest> = { organizationId }

    if (featureNames?.length) {
      whereCondition.featureName = In(featureNames)
    }

    return this.featureWaitlistRequestRepository.find({
      where: whereCondition
    })
  }

  createFeatureWaitlistRequest(params: {
    requestedBy: string
    contactEmail: string
    featureName: FeatureName
    organizationId: string
  }): Promise<FeatureWaitlistRequest> {
    const featureWhitelistRequest = FeatureWaitlistRequest.create(params)

    return this.featureWaitlistRequestRepository.save(featureWhitelistRequest)
  }
}
