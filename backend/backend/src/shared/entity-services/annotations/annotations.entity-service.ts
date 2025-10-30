import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindOptionsOrder, FindOptionsWhere, In, Repository } from 'typeorm'
import { dateHelper } from '../../helpers/date.helper'
import { BaseEntityService } from '../base.entity-service'
import { Annotation } from './annotation.entity'
import { AnnotationType } from './interfaces'

@Injectable()
export class AnnotationsEntityService extends BaseEntityService<Annotation> {
  constructor(
    @InjectRepository(Annotation)
    private annotationsRepository: Repository<Annotation>
  ) {
    super(annotationsRepository)
  }

  getByOrganizationId(organizationId: string, order?: FindOptionsOrder<Annotation>) {
    return this.annotationsRepository.find({ where: { organizationId }, order })
  }

  getByTypeAndOrganizationId(
    params: { organizationId: string; type: AnnotationType },
    order?: FindOptionsOrder<Annotation>
  ) {
    return this.annotationsRepository.find({
      where: { organizationId: params.organizationId, type: params.type },
      order
    })
  }

  getOneByNameAndOrganizationId(params: { organizationId: string; name: string }) {
    return this.annotationsRepository.findOne({ where: { organizationId: params.organizationId, name: params.name } })
  }

  getOneByPublicIdAndOrganizationId(params: { organizationId: string; publicId: string }) {
    return this.annotationsRepository.findOne({
      where: { organizationId: params.organizationId, publicId: params.publicId }
    })
  }

  getByPublicIdsAndOrganizationId(params: { publicIds: string[]; organizationId: string }) {
    return this.annotationsRepository.find({
      where: { publicId: In(params.publicIds), organizationId: params.organizationId }
    })
  }

  createTagByOrganizationIdAndName(params: { organizationId: string; name: string; accountId: string }) {
    const annotationTemplate = Annotation.create({
      name: params.name,
      type: AnnotationType.TAG,
      organizationId: params.organizationId,
      createdBy: params.accountId
    })

    return this.annotationsRepository.save(annotationTemplate)
  }

  deleteById(params: { organizationId: string; id: string; accountId?: string }) {
    const where: FindOptionsWhere<Annotation> = { id: params.id }
    if (params.accountId) {
      return this.annotationsRepository.update(where, {
        deletedAt: dateHelper.getUTCTimestamp(),
        deletedBy: `account_${params.accountId}`
      })
    }
    return this.annotationsRepository.softDelete(where)
  }

  updateNameByPublicIdAndOrganizationId(params: {
    organizationId: string
    publicId: string
    name: string
    accountId?: string
  }) {
    const where: FindOptionsWhere<Annotation> = { organizationId: params.organizationId, publicId: params.publicId }
    const updateData: DeepPartial<Annotation> = { name: params.name }
    if (params.accountId) {
      updateData.updatedBy = params.accountId
    }
    return this.annotationsRepository.update(where, updateData)
  }
}
