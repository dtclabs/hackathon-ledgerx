import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'

@Entity()
export class FeatureWaitlistRequest extends BaseEntity {
  @Column({ name: 'requested_by' })
  requestedBy: string

  @Column({ name: 'contact_email' })
  contactEmail: string

  @Column({ name: 'feature_name' })
  featureName: FeatureName

  @Column({ name: 'organization_id' })
  organizationId: string

  @Column({ nullable: true })
  comment: string

  static create(params: {
    requestedBy: string
    contactEmail: string
    featureName: FeatureName
    organizationId: string
  }): FeatureWaitlistRequest {
    const featureWhitelistRequest = new FeatureWaitlistRequest()
    featureWhitelistRequest.requestedBy = params.requestedBy
    featureWhitelistRequest.contactEmail = params.contactEmail
    featureWhitelistRequest.featureName = params.featureName
    featureWhitelistRequest.organizationId = params.organizationId

    return featureWhitelistRequest
  }
}

export enum FeatureName {
  NFT = 'nft'
}
