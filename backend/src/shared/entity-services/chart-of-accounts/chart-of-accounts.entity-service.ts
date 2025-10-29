import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindOptionsWhere, In, IsNull, Not, Repository } from 'typeorm'
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { Direction } from '../../../core/interfaces'
import { BaseEntityService } from '../base.entity-service'
import { IntegrationName } from '../integration/integration.entity'
import { ChartOfAccount, COASource, COASourceStatus, COAType } from './chart-of-account.entity'
import { seedChartOfAccountForOrganizationList } from './constants'

@Injectable()
export class ChartOfAccountsEntityService extends BaseEntityService<ChartOfAccount> {
  constructor(
    @InjectRepository(ChartOfAccount)
    private chartOfAccountsRepository: Repository<ChartOfAccount>
  ) {
    super(chartOfAccountsRepository)
  }

  seedChartOfAccountsForOrganization(organizationId: string) {
    const chartOfAccountTemplates: DeepPartial<ChartOfAccount>[] = []
    for (const seed of seedChartOfAccountForOrganizationList) {
      chartOfAccountTemplates.push(
        ChartOfAccount.create({
          name: seed.name,
          type: seed.type,
          code: seed.code,
          description: seed.description,
          organizationId: organizationId
        })
      )
    }
    return this.chartOfAccountsRepository.save(chartOfAccountTemplates)
  }

  createByHQUser(params: {
    organizationId: string
    accountId: string
    name: string
    code: string
    type: COAType
    description?: string
  }) {
    const chartOfAccount: DeepPartial<ChartOfAccount> = {}
    chartOfAccount.organization = { id: params.organizationId }
    chartOfAccount.createdBy = { id: params.accountId }
    chartOfAccount.name = params.name
    chartOfAccount.code = params.code
    chartOfAccount.type = params.type
    chartOfAccount.description = params.description ?? null
    chartOfAccount.source = COASource.HQ
    chartOfAccount.status = COASourceStatus.ACTIVE
    return this.chartOfAccountsRepository.save(chartOfAccount)
  }

  updateChartOfAccounts(
    organizationId: string,
    integrationName: IntegrationName,
    source: COASource,
    isRootfi: boolean
  ) {
    const whereConditions: FindOptionsWhere<ChartOfAccount> = {
      integration: { name: integrationName },
      organization: { id: organizationId },
      ...(isRootfi ? { rootfiId: Not(IsNull()) } : { remoteId: Not(IsNull()) })
    }

    const partialEntity: QueryDeepPartialEntity<ChartOfAccount> = { source, remoteId: null }

    if (source === COASource.HQ) {
      partialEntity.integration = null
    }

    return this.chartOfAccountsRepository.update(whereConditions, partialEntity)
  }

  recoverPreviousLinkedChartOfAccounts(organizationId: string, integrationName: IntegrationName) {
    const whereConditions: FindOptionsWhere<ChartOfAccount> = {
      organization: { id: organizationId },
      rootfiId: Not(IsNull()),
      platformId: Not(IsNull())
    }
    return this.chartOfAccountsRepository.update(whereConditions, {
      source: COASource.INTEGRATION,
      integration: { name: integrationName }
    })
  }

  updateByPlatformId(platformId: string, payload: Partial<ChartOfAccount>) {
    return this.chartOfAccountsRepository.update({ platformId }, payload)
  }

  updateById(id: string, payload: Partial<ChartOfAccount>) {
    return this.chartOfAccountsRepository.update(id, payload)
  }

  updateByPublicId(publicId: string, payload: Partial<ChartOfAccount>) {
    return this.chartOfAccountsRepository.update({ publicId }, payload)
  }

  getByOrganizationIdAndPublicId(organizationId: string, publicId: string): Promise<ChartOfAccount> {
    return this.chartOfAccountsRepository.findOne({
      where: { organization: { id: organizationId }, publicId: publicId }
    })
  }

  getByOrganizationIdAndPublicIds(organizationId: string, publicIds: string[]): Promise<ChartOfAccount[]> {
    return this.chartOfAccountsRepository.find({
      where: { organization: { id: organizationId }, publicId: In(publicIds) }
    })
  }

  getByOrganizationAndCode(organizationId: string, code: string) {
    return this.chartOfAccountsRepository.findOne({
      where: { organization: { id: organizationId }, code: code }
    })
  }

  findByRemoteId(remoteId: string, relations?: string[]): Promise<ChartOfAccount> {
    if (relations) {
      return this.chartOfAccountsRepository.findOne({ where: [{ remoteId }, { rootfiId: remoteId }] as any, relations })
    }
    return this.chartOfAccountsRepository.findOne({ where: [{ remoteId }, { rootfiId: remoteId }] as any })
  }

  findByPublicIdsAndOrganization(publicIds: string[], organizationId: string) {
    return this.chartOfAccountsRepository.find({
      where: {
        publicId: In(publicIds),
        organization: { id: organizationId }
      }
    })
  }

  getByOrganizationIdAndStatus(
    organizationId: string,
    statuses: COASourceStatus[] = [COASourceStatus.ACTIVE],
    integrationNames?: IntegrationName[]
  ) {
    const whereCondition: FindOptionsWhere<ChartOfAccount> = {
      organization: { id: organizationId },
      status: In(statuses),
      deletedAt: IsNull()
    }
    if (integrationNames) {
      whereCondition.integration = { name: In(integrationNames) }
    }
    return this.chartOfAccountsRepository.find({
      where: whereCondition,
      order: { code: Direction.ASC, name: Direction.ASC }
    })
  }

  async getLatestByOrganizationIdAndPlatformId(organizationId: string, platformId: string) {
    return this.chartOfAccountsRepository.findOne({
      where: { organization: { id: organizationId }, platformId: platformId },
      order: { id: Direction.DESC },
      withDeleted: true
    })
  }

  // async findByOrganizationId(organizationId: string, query: PaginationParams) {
  //   const page = query.page || 0
  //   const size = query.size || 10
  //   const search = (query.search || '').trim()
  //   const order = query.order || 'updatedAt'
  //   const direction = (query.direction || 'DESC') as 'DESC' | 'ASC'
  //   const queryBuilder = this.chartOfAccountsRepository
  //     .createQueryBuilder('chart_of_account')
  //     .select()
  //     .where('chart_of_account.organization = :organizationId', {
  //       organizationId
  //     })
  //     .andWhere(
  //       new Brackets((COA) => {
  //         COA.where('chart_of_account.name LIKE :search', { search: `%${search}%` }).orWhere(
  //           'chart_of_account.code::text LIKE :search',
  //           { search: `%${search}%` }
  //         )
  //       })
  //     )
  //     .orderBy(`chart_of_account.${order}`, direction)
  //     .skip(size * page)
  //     .take(size)
  //   const [items, total] = await queryBuilder.getManyAndCount()

  //   return {
  //     totalItems: total,
  //     totalPages: Math.ceil(total / size),
  //     currentPage: page,
  //     items,
  //     limit: size
  //   }
  // }

  async updateChartOfAccountsTag(coaData) {
    try {
      const updatedCoa = await this.updateByPublicId(coaData.chartOfAccountPublicId, {
        name: coaData.name,
        description: coaData.description,
        code: coaData.code,
        type: coaData.type
      })
      return updatedCoa
    } catch (error) {
      return error
    }
  }

  getByOrganizationIdAndCode(organizationId: string, code: string) {
    return this.chartOfAccountsRepository.findOne({
      where: {
        code: code,
        organization: { id: organizationId }
      }
    })
  }

  deleteChartOfAccountById(id: string) {
    return this.chartOfAccountsRepository.softDelete(id)
  }

  async deleteChartOfAccountsByOrganization(where: FindOptionsWhere<ChartOfAccount>): Promise<boolean> {
    const result = await this.chartOfAccountsRepository.softDelete(where)
    return !!result.affected
  }

  async getAllImportedWithoutPlatformId(param: { relations: FindOptionsRelations<ChartOfAccount>; limit: number }) {
    const where: FindOptionsWhere<ChartOfAccount>[] | FindOptionsWhere<ChartOfAccount> = {
      platformId: IsNull(),
      source: COASource.INTEGRATION
    }

    return this.chartOfAccountsRepository.find({ where, relations: param.relations, take: param.limit })
  }
}
