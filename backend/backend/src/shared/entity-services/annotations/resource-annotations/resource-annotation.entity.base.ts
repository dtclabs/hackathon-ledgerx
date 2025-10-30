import { Column, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '../../../../core/entities/base.entity'
import { Annotation } from '../annotation.entity'

// Dont forget to add the removal logic in tags controller class if you are extending this class.
@Index('IDX_resourceAnnotation_resource_annotation', ['resource', 'annotation'])
export abstract class ResourceAnnotationBase<T> extends BaseEntity {
  @ManyToOne(() => Annotation)
  @JoinColumn({ name: 'annotation_id' })
  annotation: Annotation

  abstract resource: T

  @Column({ name: 'created_by', nullable: true })
  createdBy: string

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy: string

  static create<G extends ResourceAnnotationBase<any>>(
    type: { new (): G },
    params: { annotationId: string; resourceId: string; createdBy: string }
  ): G {
    const instance = new type()
    instance.annotation = { id: params.annotationId } as Annotation
    instance.resource = { id: params.resourceId } as any
    instance.createdBy = params.createdBy

    return instance
  }
}
