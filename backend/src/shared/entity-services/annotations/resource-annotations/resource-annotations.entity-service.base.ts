import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { dateHelper } from '../../../helpers/date.helper'
import { BaseEntityService } from '../../base.entity-service'
import { ResourceAnnotationBase } from './resource-annotation.entity.base'

export abstract class ResourceAnnotationsEntityServiceBase<
  T extends ResourceAnnotationBase<any>
> extends BaseEntityService<T> {
  protected abstract entity: new () => T

  constructor(private resourceAnnotationBaseRepository: Repository<T>) {
    super(resourceAnnotationBaseRepository)
  }

  createResourceAnnotation(params: { resourceId: string; annotationId: string; createdBy: string }) {
    const resourceAnnotation = ResourceAnnotationBase.create<T>(this.entity, params)

    return this.resourceAnnotationBaseRepository.save(resourceAnnotation)
  }

  async upsertResourceAnnotation(params: { resourceId: string; annotationId: string; createdBy: string }) {
    const whereOptions: FindManyOptions<T> = {
      where: { resource: { id: params.resourceId }, annotation: { id: params.annotationId } } as any
    }

    const exist = await this.resourceAnnotationBaseRepository.findOne(whereOptions)
    if (exist) {
      return exist
    } else {
      const resourceAnnotation = ResourceAnnotationBase.create<T>(this.entity, params)

      return this.resourceAnnotationBaseRepository.save(resourceAnnotation)
    }
  }

  softDeleteByResourceAndAnnotation(params: { resourceId: string; annotationId: string; deletedBy: string }) {
    const where: FindOptionsWhere<T> = {
      resource: { id: params.resourceId } as any,
      annotation: { id: params.annotationId } as any
    }

    const updateData = {
      deletedAt: dateHelper.getUTCTimestamp(),
      deletedBy: params.deletedBy
    } as any

    return this.resourceAnnotationBaseRepository.update(where, updateData)
  }

  softDeleteByAnnotation(params: { annotationId: string; deletedBy: string }) {
    const where: FindOptionsWhere<T> = {
      annotation: { id: params.annotationId } as any
    }

    const updateData = {
      deletedAt: dateHelper.getUTCTimestamp(),
      deletedBy: params.deletedBy
    } as any

    return this.resourceAnnotationBaseRepository.update(where, updateData)
  }

  softDeleteByResourceIds(params: { resourceIds: string[]; deletedBy: string }) {
    const where: FindOptionsWhere<T> = {
      resource: { id: In(params.resourceIds) } as any
    }

    const updateData = {
      deletedAt: dateHelper.getUTCTimestamp(),
      deletedBy: params.deletedBy
    } as any

    return this.resourceAnnotationBaseRepository.update(where, updateData)
  }
}
