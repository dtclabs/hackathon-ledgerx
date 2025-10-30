import { ConflictException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { OrganizationIntegrationsDomainService } from '../domain/organization-integrations/organization-integrations.domain.service'
import { ChartOfAccountMappingsEntityService } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import {
  ChartOfAccount,
  COASource,
  COASourceStatus,
  COAType
} from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import {
  OrganizationIntegrationDisconnectType,
  OrganizationIntegrationStatus
} from '../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsEntityService } from '../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import {
  ChartOfAccountDto,
  COA_SYNC_LIMIT_IN_SECONDS,
  IdDTO,
  MergeAccountIdDTO,
  SaveSyncMigrationDataDTO
} from './inferfaces'
import { AccountingService } from '../domain/integrations/accounting/accounting.service'
import {
  Account,
  ModifiedAccount,
  RootFiSyncStatus,
  SYNC_OPERATION_DENIED
} from '../domain/integrations/accounting/interfaces'
import { OrganizationIntegration } from '../shared/entity-services/organization-integrations/organization-integration.entity'
import { IsNull, Not } from 'typeorm'

@Injectable()
export class ChartOfAccountsService {
  MERGE_MAXIMUM_PAGE_SIZE: number
  constructor(
    private chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private chartOfAccountMappingsEntityService: ChartOfAccountMappingsEntityService,
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService,
    private organizationIntegrationsDomainService: OrganizationIntegrationsDomainService,
    private accountingService: AccountingService,
    private logger: LoggerService
  ) {
    this.MERGE_MAXIMUM_PAGE_SIZE = 100
  }

  async getCOAFromIntegration(
    organizationId: string,
    integrationName: IntegrationName,
    condition: {
      createdAfter?: Date
      createdBefore?: Date
      cursor?: string
      includeDeletedData?: boolean
      includeRemoteData?: boolean
      modifiedAfter?: Date
      modifiedBefore?: Date
      pageSize?: number
      remoteId?: string | null
    },
    accountToken: string
  ): Promise<Account[]> {
    const output = await this.accountingService.getCOAFromIntegration(
      organizationId,
      integrationName,
      condition,
      accountToken
    )
    if (output.disconnected && output.message) {
      await this.organizationIntegrationsDomainService.disconnectIntegration(organizationId, integrationName, {
        disconnectType: OrganizationIntegrationDisconnectType.SYSTEM,
        disconnectDetails: {
          detectionEntryPoint: output.message
        }
      })
    }
    if (output.error) {
      throw output.error
    }
    return output.accounts
  }

  getDeletedAccount(integrationAccounts: Account[], localAccounts: ChartOfAccount[]) {
    const deletedCOAList = []
    for (const localAccount of localAccounts) {
      let flag = false
      for (const integrationAccount of integrationAccounts) {
        if (this.accountingService.compareAccount(integrationAccount, localAccount)) {
          flag = true
          break
        }
      }
      if (!flag) {
        deletedCOAList.push(localAccount)
      }
    }
    return deletedCOAList
  }

  async findCOARemoteIdAndSave(
    accountToken: string,
    mergeAccountIdList: MergeAccountIdDTO[],
    integrationName: IntegrationName,
    organizationId: string,
    accountId: string
  ): Promise<ChartOfAccount[]> {
    try {
      const COAResultList: Account[] = await this.getCOAFromIntegration(
        organizationId,
        integrationName,
        {},
        accountToken
      )
      const isRootfiAvailable = await this.accountingService.isRootFiAvailable(organizationId)
      const COAListToBeSaved = []
      const COAListToBeUpdated = []
      for (const mergeAccountId of mergeAccountIdList) {
        const integrationData = COAResultList.find((COAResult) => mergeAccountId.mergeAccountid === COAResult.id)
        if (integrationData) {
          const platformId = integrationData.remote_id
          const COAFromOrganizationIdAndPlatfromId =
            await this.chartOfAccountsEntityService.getLatestByOrganizationIdAndPlatformId(organizationId, platformId)
          if (COAFromOrganizationIdAndPlatfromId) {
            COAListToBeUpdated.push({
              id: COAFromOrganizationIdAndPlatfromId.id,
              data: {
                deletedAt: null,
                source: COASource.INTEGRATION,
                integration: integrationName,
                ...(isRootfiAvailable ? { rootfiId: integrationData.id } : { remoteId: integrationData.id })
              }
            })
          } else {
            COAListToBeSaved.push({
              name: integrationData.name,
              description: integrationData.description,
              code: integrationData.account_number,
              type: integrationData.type,
              integration: integrationName,
              organization: organizationId,
              source: COASource.INTEGRATION,
              status: integrationData.status,
              createdBy: accountId,
              platformId: platformId,
              ...(isRootfiAvailable ? { rootfiId: integrationData.id } : { remoteId: integrationData.id })
            })
          }
        }
      }
      for (const COA of COAListToBeUpdated) {
        await this.chartOfAccountsEntityService.partiallyUpdate(COA.id, COA.data)
      }
      return await this.chartOfAccountsEntityService.insert(COAListToBeSaved)
    } catch (error) {
      this.logger.error('findCOARemoteIdAndSave error', error)
      throw new ConflictException(error)
    }
  }
  async findCOARemoteIdAndUpdate(
    organizationId: string,
    COAResultFromIntegration: Account[],
    mergeAccountIdList: MergeAccountIdDTO[]
  ) {
    try {
      const COAListToBeUpdatedPromise = []
      const isRootfiAvailable = await this.accountingService.isRootFiAvailable(organizationId)
      for (const incomingData of mergeAccountIdList) {
        const integrationData = COAResultFromIntegration.find((coa) => incomingData.mergeAccountid === coa.id)
        if (integrationData) {
          const payload = {
            name: integrationData.name,
            description: integrationData.description,
            type: integrationData.type as COAType,
            code: integrationData.account_number,
            platformId: integrationData.remote_id,
            // when changing code in Xero, the rootfi_id is also changed
            ...(isRootfiAvailable ? { rootfiId: integrationData.id } : {})
          }
          COAListToBeUpdatedPromise.push(
            this.chartOfAccountsEntityService.updateByPlatformId(payload.platformId, payload)
          )
        }
      }
      const COAresult = await Promise.all(COAListToBeUpdatedPromise)
      return COAresult
    } catch (error) {
      this.logger.error('findCOARemoteIdAndUpdate error', error)
      throw new ConflictException(error)
    }
  }

  async replaceOldCOAIdWithNewCOAId(
    archivedData: SaveSyncMigrationDataDTO[],
    deletedData: SaveSyncMigrationDataDTO[],
    restoredData: IdDTO[]
  ) {
    try {
      for (const dataToMigrate of archivedData) {
        const previousCOA = await this.chartOfAccountsEntityService.findByPublicId(dataToMigrate.previousCOAId)
        if (dataToMigrate && dataToMigrate.newCOAId) {
          const newCOA = await this.chartOfAccountsEntityService.findByPublicId(dataToMigrate.newCOAId)

          await this.financialTransactionsEntityService.replaceMetadataCOAId(previousCOA.id, newCOA?.id)
          await this.chartOfAccountMappingsEntityService.replaceCOAId(previousCOA.id, newCOA?.id)
        }
        await this.chartOfAccountsEntityService.updateById(previousCOA.id, {
          status: COASourceStatus.INACTIVE
        })
      }

      for (const dataToDelete of deletedData) {
        const previousCOA = await this.chartOfAccountsEntityService.findByPublicId(dataToDelete.previousCOAId)
        if (dataToDelete && dataToDelete.newCOAId) {
          const newCOA = await this.chartOfAccountsEntityService.findByPublicId(dataToDelete.newCOAId)

          await this.financialTransactionsEntityService.replaceMetadataCOAId(previousCOA.id, newCOA?.id)
          await this.chartOfAccountMappingsEntityService.replaceCOAId(previousCOA.id, newCOA?.id)
        }
        await this.chartOfAccountsEntityService.softDelete(previousCOA.id)
      }

      for (const dataToRestore of restoredData) {
        await this.chartOfAccountsEntityService.updateByPublicId(dataToRestore.id, {
          status: COASourceStatus.ACTIVE
        })
      }

      return true
    } catch (error) {
      this.logger.error('replaceOldCOAIdWithNewCOAId error', error)
      throw new ConflictException(error)
    }
  }

  async createChartOfAccount(params: {
    organizationId: string
    accountId: string
    name: string
    code: string
    type: COAType
    description?: string
  }): Promise<ChartOfAccountDto> {
    const existingIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNamesAndOrganizationIdAndStatus({
        integrationNames: [IntegrationName.XERO, IntegrationName.QUICKBOOKS],
        organizationId: params.organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED, OrganizationIntegrationStatus.TOKEN_SWAPPED],
        platform: await this.accountingService.getAvailablePlatformName(params.organizationId, IntegrationName.XERO)
      })

    if (existingIntegration) {
      throw new ConflictException('not allowed to perform this operation')
    }
    const existingCOAWithCode = await this.chartOfAccountsEntityService.getByOrganizationAndCode(
      params.organizationId,
      params.code
    )

    if (existingCOAWithCode) {
      throw new ConflictException('Code is already used')
    }

    const chartOfAccount = await this.chartOfAccountsEntityService.createByHQUser(params)

    return ChartOfAccountDto.map(chartOfAccount)
  }

  getByOrganizationIdAndStatus(organizationId: string, statuses?: COASourceStatus[]) {
    return this.chartOfAccountsEntityService.getByOrganizationIdAndStatus(organizationId, statuses)
  }

  getLatestByOrganizationIdAndPlatformId(organizationId: string, platformId: string) {
    return this.chartOfAccountsEntityService.getLatestByOrganizationIdAndPlatformId(organizationId, platformId)
  }

  async updateHqCoa(updateData) {
    const existingIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNamesAndOrganizationIdAndStatus({
        integrationNames: [IntegrationName.XERO, IntegrationName.QUICKBOOKS],
        organizationId: updateData.organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED, OrganizationIntegrationStatus.TOKEN_SWAPPED],
        platform: await this.accountingService.getAvailablePlatformName(updateData.organizationId, IntegrationName.XERO)
      })

    if (existingIntegration) {
      throw new ConflictException('not allowed to perform this operation')
    }
    const currenctChartOfAccount = await this.chartOfAccountsEntityService.getByOrganizationIdAndPublicId(
      updateData.organizationId,
      updateData.chartOfAccountPublicId
    )
    if (!currenctChartOfAccount) {
      throw new NotFoundException('Chart Of Account  does not exist in the organization')
    }
    const checkNewCoaExist = await this.chartOfAccountsEntityService.getByOrganizationIdAndCode(
      updateData.organizationId,
      updateData.code
    )
    if (checkNewCoaExist && checkNewCoaExist.publicId !== updateData.chartOfAccountPublicId) {
      throw new ConflictException('same code already exists for the organization')
    }
    await this.chartOfAccountsEntityService.updateChartOfAccountsTag(updateData)
    return ChartOfAccountDto.map(currenctChartOfAccount)
  }

  async deleteChartOfAccount(params: { organizationId: string; chartOfAccountPublicId: string }) {
    const chartOfAccount = await this.chartOfAccountsEntityService.getByOrganizationIdAndPublicId(
      params.organizationId,
      params.chartOfAccountPublicId
    )

    if (!chartOfAccount) {
      throw new NotFoundException('Chart Of Account does not exist in the organization')
    }

    await this.financialTransactionsEntityService.replaceMetadataCOAId(chartOfAccount.id, null)
    await this.chartOfAccountMappingsEntityService.replaceCOAId(chartOfAccount.id, null)
    await this.chartOfAccountsEntityService.deleteChartOfAccountById(chartOfAccount.id)
  }

  async getSourceSyncStatus(accountToken: string, organizationId: string, integrationName: IntegrationName) {
    const integrationAccounts = await this.getCOAFromIntegration(organizationId, integrationName, {}, accountToken)
    const isRootfiAvailable = await this.accountingService.isRootFiAvailable(organizationId)
    const localChartOfAccounts = await this.chartOfAccountsEntityService.find({
      where: [
        { organization: { id: organizationId }, source: COASource.HQ },
        {
          organization: { id: organizationId },
          source: COASource.INTEGRATION,
          ...(isRootfiAvailable ? { rootfiId: Not(IsNull()) } : { remoteId: Not(IsNull()) })
        }
      ]
    })

    const sanitizedSourceCOAResult = integrationAccounts.filter((item) =>
      this.accountingService.sanitize(item, integrationName, isRootfiAvailable)
    )
    const deletedCOAList: ChartOfAccount[] = this.getDeletedAccount(integrationAccounts, localChartOfAccounts)

    const matchedSourceAndLocal: { sourceCOA: Account; localAccount: ChartOfAccount }[] = []
    const newFromSource: Account[] = []
    for (const sourceCOA of sanitizedSourceCOAResult) {
      let isMatched = false
      for (const localAccount of localChartOfAccounts) {
        if (this.accountingService.compareAccount(sourceCOA, localAccount)) {
          matchedSourceAndLocal.push({ sourceCOA, localAccount })
          isMatched = true
          break
        }
      }
      if (!isMatched) {
        if (sourceCOA.status === COASourceStatus.ACTIVE) {
          newFromSource.push(sourceCOA)
        }
      }
    }

    const modifiedAccountLocallyList: ModifiedAccount[] = []
    const archivedCOAList: ChartOfAccount[] = []
    const restoredCOAList: ChartOfAccount[] = []

    for (const { sourceCOA, localAccount } of matchedSourceAndLocal) {
      if (localAccount.status === COASourceStatus.ACTIVE && sourceCOA.status === COASourceStatus.INACTIVE) {
        archivedCOAList.push(localAccount)
      }

      if (localAccount.status === COASourceStatus.INACTIVE && sourceCOA.status === COASourceStatus.ACTIVE) {
        restoredCOAList.push(localAccount)
      }

      if (sourceCOA.status === COASourceStatus.ACTIVE) {
        const keysChangedAtSource = this.accountingService.toCheckWhichKeyChanged(
          sourceCOA,
          localAccount,
          integrationName,
          isRootfiAvailable
        )

        if (keysChangedAtSource.length) {
          modifiedAccountLocallyList.push({ ...sourceCOA, keysChangedAtSource })
        }
      }
    }

    const isItSynced =
      deletedCOAList.length === 0 &&
      modifiedAccountLocallyList.length === 0 &&
      archivedCOAList.length === 0 &&
      restoredCOAList.length === 0

    return {
      isItSynced,
      deletedCOAList,
      modifiedAccountLocallyList,
      archivedCOAList,
      restoredCOAList,
      newFromSource
    }
  }

  async getOrganizationIntegrationWithAuth(
    integrationName: IntegrationName,
    organizationId: string,
    statuses: OrganizationIntegrationStatus[]
  ): Promise<OrganizationIntegration> {
    const platform = await this.accountingService.getAvailablePlatformName(organizationId, integrationName)
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName,
        organizationId,
        platform: platform,
        statuses: statuses,
        relations: { organizationIntegrationAuth: true }
      })
    if (!organizationIntegration) {
      throw new NotFoundException(`Can not find organization integration`)
    }
    if (!organizationIntegration.organizationIntegrationAuth) {
      throw new Error(`Can not find organization integration auth`)
    }
    return organizationIntegration
  }

  async syncCOA(organizationId: string, integrationName: IntegrationName): Promise<boolean> {
    const startTime = new Date().getTime() / 1000
    let currentTime = new Date().getTime() / 1000
    // start creating sync
    try {
      const { syncId } = await this.accountingService.createSync(organizationId, integrationName)
      while (currentTime - startTime <= COA_SYNC_LIMIT_IN_SECONDS) {
        const { status } = await this.accountingService.getSync(organizationId, syncId)
        if (status === RootFiSyncStatus.SUCCESS) {
          return true
        } else if (status === RootFiSyncStatus.FAILED) {
          return false
        }
        // sleep for 1 second and retry
        await new Promise((r) => setTimeout(r, 1000))

        // reset currentTime
        currentTime = new Date().getTime() / 1000
      }
    } catch (e) {
      if (e === SYNC_OPERATION_DENIED) {
        this.logger.debug(`error ${SYNC_OPERATION_DENIED}`, { organizationId, integrationName })
      } else {
        this.logger.error(`unexpected error occurred while calling syncCOA`, e, { organizationId, integrationName })
      }
      return false
    }
  }
}
