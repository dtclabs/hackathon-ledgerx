import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../core/entities/base.entity'
import { CreateAnalysisEventTrackerDto } from './interface'

@Entity()
export class AnalysisEventTracker extends BaseEntity {
  @Column({ name: 'event_type' })
  eventType: string

  @Column()
  browser: string

  @Column()
  timezone: string

  @Column()
  location: string

  @Column()
  device: string

  @Column()
  url: string

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string

  @Column({ name: 'account_id', nullable: true })
  accountId: string

  @Column({ name: 'trace_id', nullable: true })
  traceId: string

  @Column({ name: 'referrer_url', nullable: true })
  referrerUrl: string

  @Column({ type: 'json', nullable: true })
  metadata?: any

  static map(dto: CreateAnalysisEventTrackerDto): AnalysisEventTracker {
    const eventTracker = new AnalysisEventTracker()
    eventTracker.eventType = dto.eventType
    eventTracker.browser = dto.browser
    eventTracker.timezone = dto.timezone
    eventTracker.location = dto.location
    eventTracker.device = dto.device
    eventTracker.organizationId = dto.organizationId
    eventTracker.url = dto.url
    eventTracker.accountId = dto.accountId
    eventTracker.traceId = dto.traceId
    eventTracker.referrerUrl = dto.referrerUrl
    eventTracker.metadata = dto.metadata

    return eventTracker
  }
}
