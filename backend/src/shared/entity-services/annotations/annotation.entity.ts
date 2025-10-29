import { Column, Entity, Unique } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { AnnotationType } from './interfaces'

@Entity()
@Unique('UQ_annotation_organizationId_publicId', ['organizationId', 'publicId'])
export class Annotation extends PublicEntity {
  @Column()
  name: string

  @Column()
  type: AnnotationType

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string

  @Column({ name: 'created_by', nullable: true })
  createdBy: string

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy: string

  static create(params: {
    name: string
    type: AnnotationType
    organizationId?: string
    createdBy?: string
  }): Annotation {
    const annotation: Annotation = new Annotation()
    annotation.name = params.name
    annotation.type = params.type
    annotation.organizationId = params.organizationId
    annotation.createdBy = params.createdBy
    annotation.updatedBy = params.createdBy

    return annotation
  }
}
