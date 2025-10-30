import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { RequestType } from './interfaces'

@Entity()
export class SubscriptionRelatedRequest extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column({ name: 'request_type' })
  requestType: RequestType

  @Column({ name: 'contact_details', type: 'json', nullable: true })
  contactDetails: any

  @Column({ name: 'request_details', type: 'json', nullable: true })
  requestDetails: any
}
