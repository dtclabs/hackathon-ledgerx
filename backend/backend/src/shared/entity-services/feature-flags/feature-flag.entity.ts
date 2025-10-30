import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'

@Entity()
@Index('UQ_feature_flag_name', ['name'], {
  unique: true,
  where: `"deleted_at" IS NULL AND "organization_id" IS NULL`
})
@Index('UQ_conditional_feature_flag_name_organization_id', ['name', 'organizationId'], {
  unique: true,
  where: `"deleted_at" IS NULL AND "organization_id" IS NOT NULL`
})
export class FeatureFlag extends BaseEntity {
  @Column()
  name: string

  @Column({ name: 'is_enabled', default: false })
  isEnabled: boolean

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string
}
