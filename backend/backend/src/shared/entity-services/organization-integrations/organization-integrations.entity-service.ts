import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsRelations, FindOptionsWhere, In, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { BaseEntityService } from '../base.entity-service'
import { IntegrationName } from '../integration/integration.entity'
import { OrganizationIntegrationAuth } from './organization-integration-auth.entity'
import { OrganizationIntegration } from './organization-integration.entity'
import { DtcpayAuthMetadata, OrganizationIntegrationMetadata, OrganizationIntegrationStatus } from './interfaces'
import { Platform } from '../../../domain/integrations/accounting/interfaces'

@Injectable()
export class OrganizationIntegrationsEntityService extends BaseEntityService<OrganizationIntegration> {
  constructor(
    @InjectRepository(OrganizationIntegration)
    private organizationIntegrationRepository: Repository<OrganizationIntegration>,

    @InjectRepository(OrganizationIntegrationAuth)
    private organizationIntegrationAuthRepository: Repository<OrganizationIntegrationAuth>
  ) {
    super(organizationIntegrationRepository)
  }

  updateOrganizationIntegrationById(id: string, payload: Partial<OrganizationIntegration>) {
    return this.organizationIntegrationRepository.update(id, payload)
  }

  updateOrganizationIntegration(
    params: {
      integrationName?: IntegrationName
      organizationId: string
      platforms?: Platform[]
    },
    payload: Partial<OrganizationIntegration>
  ) {
    const whereCondition: FindOptionsWhere<OrganizationIntegration> = {
      organization: { id: params.organizationId }
    }

    if (params.integrationName) {
      whereCondition.integration = { name: params.integrationName }
    }

    if (params.platforms) {
      whereCondition.platform = In(params.platforms)
    }
    return this.organizationIntegrationRepository.update(whereCondition, payload)
  }

  getByOrganization(params: {
    integrationNames?: IntegrationName[]
    organizationId: string
    platforms?: Platform[]
    statuses?: OrganizationIntegrationStatus[]
  }): Promise<OrganizationIntegration[]> {
    const whereCondition: FindOptionsWhere<OrganizationIntegration> = {
      organization: { id: params.organizationId }
    }

    if (params.integrationNames) {
      whereCondition.integration = { name: In(params.integrationNames) }
    }

    if (params.platforms) {
      whereCondition.platform = In(params.platforms)
    }

    if (params.statuses) {
      whereCondition.status = In(params.statuses)
    }

    return this.organizationIntegrationRepository.find({
      where: whereCondition,
      relations: { integration: true }
    })
  }

  getByIntegrationNameAndOrganizationIdAndStatus(params: {
    integrationName: IntegrationName
    organizationId: string
    platform?: Platform
    statuses?: OrganizationIntegrationStatus[]
    relations?: FindOptionsRelations<OrganizationIntegration>
  }): Promise<OrganizationIntegration> {
    const whereCondition: FindOptionsWhere<OrganizationIntegration> = {
      integration: { name: params.integrationName },
      organization: { id: params.organizationId }
    }
    if (params.statuses) {
      whereCondition.status = In(params.statuses)
    }
    if (params.platform) {
      whereCondition.platform = params.platform
    }

    return this.organizationIntegrationRepository.findOne({
      where: whereCondition,
      relations: params.relations ?? { integration: true, organization: true }
    })
  }

  getByIntegrationNamesAndOrganizationIdAndStatus(params: {
    integrationNames: IntegrationName[]
    organizationId: string
    statuses?: OrganizationIntegrationStatus[]
    platform?: Platform
  }): Promise<OrganizationIntegration> {
    const whereCondition: FindOptionsWhere<OrganizationIntegration> = {
      integration: { name: In(params.integrationNames) },
      organization: { id: params.organizationId }
    }
    if (params.statuses) {
      whereCondition.status = In(params.statuses)
    }
    if (params.platform) {
      whereCondition.platform = params.platform
    }

    return this.organizationIntegrationRepository.findOne({
      where: whereCondition,
      relations: { integration: true, organization: true }
    })
  }

  getLastDeletedByIntegrationNamesAndOrganizationIdAndStatus(params: {
    integrationNames: IntegrationName[]
    organizationId: string
    statuses?: OrganizationIntegrationStatus[]
  }): Promise<OrganizationIntegration> {
    const whereCondition: FindOptionsWhere<OrganizationIntegration> = {
      integration: { name: In(params.integrationNames) },
      organization: { id: params.organizationId }
    }
    if (params.statuses) {
      whereCondition.status = In(params.statuses)
    }
    return this.organizationIntegrationRepository.findOne({
      where: whereCondition,
      relations: { integration: true, organization: true },
      order: { ['updatedAt']: { direction: 'DESC' } },
      withDeleted: true
    })
  }

  async createOrganizationIntegrationWithAuth(params: {
    integrationName: IntegrationName
    organizationId: string
    metadata?: OrganizationIntegrationMetadata
    auth: {
      accessToken?: string
      refreshToken?: string
      expiredAt?: Date
      metadata?: DtcpayAuthMetadata
    }
  }): Promise<OrganizationIntegration> {
    //TODO: improve below to use database transactions
    const organizationIntegration = await this.organizationIntegrationRepository.save({
      status: OrganizationIntegrationStatus.COMPLETED,
      integration: { name: params.integrationName },
      organization: { id: params.organizationId },
      metadata: params.metadata
    })

    await this.organizationIntegrationAuthRepository.save({
      organizationIntegration: { id: organizationIntegration.id },
      accessToken: params.auth.accessToken,
      refreshToken: params.auth.refreshToken,
      expiredAt: params.auth.expiredAt,
      metadata: params.auth.metadata
    })

    return organizationIntegration
  }

  async addAuthToOrganizationIntegration(params: {
    organizationIntegrationId: string
    accessToken: string
    refreshToken?: string
    expiredAt?: Date
  }) {
    await this.organizationIntegrationAuthRepository.save({
      organizationIntegration: { id: params.organizationIntegrationId },
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      expiredAt: params.expiredAt
    })
  }

  async addRootfiOrgIdToOrganizationIntegration(params: { organizationIntegrationId: string; orgId: number }) {
    await this.organizationIntegrationAuthRepository.upsert(
      {
        organizationIntegration: { id: params.organizationIntegrationId },
        rootfiOrgId: params.orgId
      },
      ['organizationIntegration.id']
    )
  }

  updateAuthById(id: string, updateData: QueryDeepPartialEntity<OrganizationIntegrationAuth>) {
    return this.organizationIntegrationAuthRepository.update(id, updateData)
  }

  async updateMetadata(id: string, metadata: OrganizationIntegrationMetadata) {
    await this.organizationIntegrationRepository.update(id, { metadata: metadata })
  }

  async softDeleteById(organizationIntegrationId: string) {
    await this.organizationIntegrationAuthRepository.softDelete({
      organizationIntegration: { id: organizationIntegrationId }
    })
    await this.organizationIntegrationRepository.softDelete({ id: organizationIntegrationId })
  }
}
