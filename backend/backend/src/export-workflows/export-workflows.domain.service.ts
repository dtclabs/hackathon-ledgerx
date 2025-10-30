import { BadRequestException, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FilesService } from '../files/files.service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { ExportWorkflowDto, GetExportWorkflowsQueryParams } from './interface'
import { ExportWorkflowsEntityService } from '../shared/entity-services/export-workflows/export-workflows.entity.service'
import {
  ExportWorkflowFileType,
  ExportWorkflowStatus,
  SpotBalanceInterval,
  spotBalanceIntervalName
} from '../shared/entity-services/export-workflows/interface'
import { ExportWorkflowEvent, ExportWorkflowEventType } from '../domain/export-workflow/interface'
import { BucketSelector } from '../files/interfaces'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { SubscriptionsDomainService } from '../domain/subscriptions/subscriptions.domain.service'
import { SubscriptionPlanName } from '../shared/entity-services/subscriptions/interface'

const DEFAULT_EXPORT_WORKFLOWS_TO_DISPLAY = 10

const SPOT_BALANCE_VIEWING_PERIOD = 3

@Injectable()
export class ExportWorkflowsDomainService {
  constructor(
    private logger: LoggerService,
    private filesService: FilesService,
    private readonly eventEmitter: EventEmitter2,
    private walletsService: WalletsEntityService,
    private blockchainsService: BlockchainsEntityService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private exportWorkflowsEntityService: ExportWorkflowsEntityService,
    private subscriptionsDomainService: SubscriptionsDomainService
  ) {}

  async getForOrganization(organizationId: string, query: GetExportWorkflowsQueryParams): Promise<ExportWorkflowDto[]> {
    const exportWorkflows = await this.exportWorkflowsEntityService.getByOrganization({
      organizationId,
      types: query.types,
      limit: query.size ?? DEFAULT_EXPORT_WORKFLOWS_TO_DISPLAY
    })

    return exportWorkflows.map((exportWorkflow) => ExportWorkflowDto.map(exportWorkflow))
  }

  async createExportWorkflowForSpotBalance(params: {
    organizationId: string
    interval: SpotBalanceInterval
    requestedBy: string
    fileType: ExportWorkflowFileType
    walletIds: string[]
    cryptocurrencyIds: string[]
    blockchainIds: string[]
    startDate: string
    endDate: string
  }): Promise<ExportWorkflowDto> {
    if (new Date(params.startDate) > new Date()) {
      throw new BadRequestException('Start date must be earlier than today')
    }

    if (new Date(params.endDate) > new Date()) {
      throw new BadRequestException('End date must be earlier than today')
    }

    let wallets: Wallet[] = []
    if (params.walletIds?.length) {
      wallets = await this.walletsService.getByOrganizationAndPublicIds(params.organizationId, params.walletIds)
      if (wallets.length !== params.walletIds.length) {
        throw new BadRequestException('Invalid wallet(s) for spot balance export')
      }
    }

    let cryptocurrencies: Cryptocurrency[] = []
    if (params.cryptocurrencyIds?.length) {
      cryptocurrencies = await this.cryptocurrenciesService.getAllByPublicIds(params.cryptocurrencyIds)
      if (cryptocurrencies.length !== params.cryptocurrencyIds.length) {
        throw new BadRequestException('Invalid cryptocurrency(ies) for spot balance export')
      }
    }

    let blockchains: string[] = []
    if (params.blockchainIds?.length) {
      blockchains = await this.blockchainsService.getEnabledBlockchainPublicIds()
      const nonActiveBlockchain = params.blockchainIds.find((blockchainId) => !blockchains.includes(blockchainId))
      if (nonActiveBlockchain) {
        throw new BadRequestException('Invalid blockchain(s) for spot balance export')
      }
    }

    // Non Paid users can only export up to 3 months of data
    const isPaid = await this.subscriptionsDomainService.hasActive(params.organizationId, [
      SubscriptionPlanName.BUSINESS,
      SubscriptionPlanName.STARTER
    ])
    if (!isPaid) {
      const monthsDiff = dateHelper.getMonthsDiff(new Date(params.startDate), dateHelper.getUTCTimestamp())
      if (monthsDiff > SPOT_BALANCE_VIEWING_PERIOD) {
        throw new BadRequestException(
          `Non Paid users can only export up to ${SPOT_BALANCE_VIEWING_PERIOD} months of data`
        )
      }
    }

    const workflow = await this.exportWorkflowsEntityService.createSpotBalanceWorkflow({
      organizationId: params.organizationId,
      name: this.getSpotBalanceWorkflowName({
        interval: params.interval,
        startDate: params.startDate,
        endDate: params.endDate
      }),
      requestedBy: params.requestedBy,
      publicMetadata: {
        query: {
          cryptocurrencyIds: params.cryptocurrencyIds ?? [],
          startDate: params.startDate,
          endDate: params.endDate,
          blockchainIds: params.blockchainIds ?? [],
          walletIds: params.walletIds ?? [],
          interval: params.interval
        }
      },
      privateMetadata: {
        query: {
          cryptocurrencyIds: cryptocurrencies.map((cryptocurrency) => cryptocurrency.id),
          blockchainIds: params.blockchainIds ?? [],
          endDate: params.endDate,
          startDate: params.startDate,
          walletIds: wallets.map((wallet) => wallet.id),
          interval: params.interval
        }
      },
      fileType: params.fileType
    })

    this.eventEmitter.emit(
      ExportWorkflowEventType.EXPORT_WORKFLOW_GENERATE,
      new ExportWorkflowEvent(workflow.id, params.organizationId)
    )

    return ExportWorkflowDto.map(workflow)
  }

  async getExportFile(params: { exportWorkflowPublicId: string; organizationId: string }) {
    const workflow = await this.exportWorkflowsEntityService.findOne({
      where: {
        publicId: params.exportWorkflowPublicId,
        organizationId: params.organizationId
      }
    })

    if (!workflow) {
      throw new BadRequestException('Invalid Export workflow id')
    }

    if (workflow.status !== ExportWorkflowStatus.COMPLETED) {
      throw new BadRequestException(`Unable to download report for ${workflow.status} workflow`)
    }

    const { fileStream, mimeType } = await this.filesService.getExportFileStream(
      BucketSelector.PRIVATE,
      workflow.s3FileName
    )

    return { filename: workflow.name, mimeType, fileStream }
  }

  private getSpotBalanceWorkflowName(params: { interval: SpotBalanceInterval; startDate: string; endDate: string }) {
    const partialName = `${spotBalanceIntervalName[params.interval]} Balance Report`

    const startDate = new Date(params.startDate)
    const endDate = new Date(params.endDate)

    switch (params.interval) {
      case SpotBalanceInterval.MONTHLY: {
        const formattedStartDate = dateHelper.getMonthYearFromTimestamp(startDate)
        const formattedEndDate = dateHelper.getMonthYearFromTimestamp(endDate)
        return `${partialName} (${formattedStartDate} to ${formattedEndDate})`
      }
      default: {
        const formattedStartDate = dateHelper.getDateComponentFromDateTimestamp(startDate)
        const formattedEndDate = dateHelper.getDateComponentFromDateTimestamp(endDate)
        return `${partialName} (${formattedStartDate} to ${formattedEndDate})`
      }
    }
  }
}
