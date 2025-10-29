import { BadRequestException, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { FilesService } from '../files/files.service'
import { BucketSelector } from '../files/interfaces'
import { BankFeedExportWorkflow } from '../shared/entity-services/bank-feed-export-workflows/bank-feed-export-workflows.entity'
import { BankFeedExportWorkflowEntityService } from '../shared/entity-services/bank-feed-export-workflows/bank-feed-export-workflows.entity-service'
import {
  BankFeedExportFileType,
  BankFeedExportStatus
} from '../shared/entity-services/bank-feed-export-workflows/interface'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { IntegrationName } from '../shared/entity-services/integration/integration.entity'
import { OrganizationIntegrationStatus } from '../shared/entity-services/organization-integrations/interfaces'
import { OrganizationIntegrationsEntityService } from '../shared/entity-services/organization-integrations/organization-integrations.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { BankFeedExportDto, BankFeedExportEventType, MAX_BANK_FEED_EXPORT_WORKFLOWS_TO_DISPLAY } from './interface'

@Injectable()
export class BankFeedExportsDomainService {
  constructor(
    private logger: LoggerService,
    private filesService: FilesService,
    private readonly eventEmitter: EventEmitter2,
    private walletsService: WalletsEntityService,
    private blockchainsService: BlockchainsEntityService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private bankFeedExportWorkflowEntityService: BankFeedExportWorkflowEntityService,
    private organizationIntegrationsEntityService: OrganizationIntegrationsEntityService
  ) {}

  async getBankFeedExportsForOrganization(organizationId: string): Promise<BankFeedExportDto[]> {
    const bankFeedExports = await this.bankFeedExportWorkflowEntityService.getBankFeedExportWorkflowsByOrganization({
      organizationId
    })

    if (bankFeedExports?.length) {
      const filteredExports: BankFeedExportWorkflow[] = []

      for (const bankFeedExport of bankFeedExports) {
        if (filteredExports.length >= MAX_BANK_FEED_EXPORT_WORKFLOWS_TO_DISPLAY) {
          break
        }
        const cryptocurrency = await this.cryptocurrenciesService.getById(bankFeedExport.metadata.cryptocurrencyId)
        // store Id but need to return publicId for FE to display cryptocurrencyId
        bankFeedExport.metadata.cryptocurrencyId = cryptocurrency.publicId
        filteredExports.push(bankFeedExport)
      }

      return filteredExports.map((bankFeedExport) => BankFeedExportDto.map(bankFeedExport))
    }
  }

  async createBankFeedExports(params: {
    organizationId: string
    integrationName: IntegrationName
    requestedBy: string
    fileType: BankFeedExportFileType
    walletId: string
    cryptocurrencyIds: string[]
    blockchainId: string
    startTime: Date
    endTime: Date
  }): Promise<BankFeedExportDto[]> {
    const organizationIntegration =
      await this.organizationIntegrationsEntityService.getByIntegrationNameAndOrganizationIdAndStatus({
        integrationName: params.integrationName,
        organizationId: params.organizationId,
        statuses: [OrganizationIntegrationStatus.COMPLETED]
      })
    if (!organizationIntegration) {
      throw new BadRequestException('Organization is not authorized to perform this action')
    }

    const wallet = await this.walletsService.getByOrganizationAndPublicId(params.organizationId, params.walletId)
    if (!wallet) {
      throw new BadRequestException('Invalid wallet for bank feed export')
    }

    const cryptocurrencies = await this.cryptocurrenciesService.getAllByPublicIds(params.cryptocurrencyIds)
    if (params.cryptocurrencyIds?.length !== cryptocurrencies?.length) {
      throw new BadRequestException('Invalid cryptocurrencies for bank feed export')
    }

    const runningWorfklows = await this.bankFeedExportWorkflowEntityService.getRunningWorkflowsByOrganization(
      params.organizationId
    )
    if (runningWorfklows?.length) {
      throw new BadRequestException('Unable to start a new bank feed export while another workflow is running')
    }

    const blockchain = await this.blockchainsService.getByPublicId(params.blockchainId)

    const workflows: BankFeedExportWorkflow[] = []

    const dateString = `${dateHelper.getShortDateFormat(new Date(params.startTime))} - ${dateHelper.getShortDateFormat(
      new Date(params.endTime)
    )}`

    for (const cryptocurrencyId of params.cryptocurrencyIds) {
      const cryptocurrency = cryptocurrencies.find((c) => c.publicId === cryptocurrencyId)

      const workflow = await this.bankFeedExportWorkflowEntityService.createWorkflow({
        organizationId: params.organizationId,
        name: `${dateString} - ${wallet.name} - ${cryptocurrency.symbol} - ${blockchain.name}`,
        integrationName: params.integrationName,
        requestedBy: params.requestedBy,
        blockchainId: params.blockchainId,
        cryptocurrencyId: cryptocurrency.id,
        walletId: params.walletId,
        fileType: params.fileType,
        startTime: params.startTime,
        endTime: params.endTime
      })

      workflows.push(workflow)

      this.eventEmitter.emit(BankFeedExportEventType.GENERATE_FROM_FINANCIAL_TRANSACTION, workflow.id)
    }

    return workflows.map((workflow) => BankFeedExportDto.map(workflow))
  }

  async getBankFeedExportFile(params: { bankFeedWorkflowPublicId: string; organizationId: string }) {
    const workflow = await this.bankFeedExportWorkflowEntityService.findOne({
      where: {
        publicId: params.bankFeedWorkflowPublicId,
        organizationId: params.organizationId
      }
    })

    if (!workflow) {
      throw new BadRequestException('Invalid bank feed export workflow id')
    }
    if (workflow.status === BankFeedExportStatus.GENERATING) {
      throw new BadRequestException('Bank feed export workflow is generating')
    }
    if (!workflow.s3FilePath || workflow.status !== BankFeedExportStatus.COMPLETED) {
      throw new BadRequestException('Can not download failed bank feed export')
    }

    const { fileStream, mimeType } = await this.filesService.getExportFileStream(
      BucketSelector.PRIVATE,
      workflow.s3FilePath
    )

    return { filename: workflow?.filename, mimeType, fileStream }
  }

  async saveBankFeedExportToS3(params: {
    data: string
    publicOrganizationId: string
    workflowId: string
    fileType: BankFeedExportFileType
  }) {
    try {
      const path = `organizations/files/${params.publicOrganizationId}/bank-feed-exports/${params.workflowId}`

      const fileContents = Buffer.from(params.data)

      const { key } = await this.filesService.uploadToS3(
        fileContents,
        path,
        BucketSelector.PRIVATE,
        params.fileType ?? BankFeedExportFileType.CSV
      )

      return key
    } catch (e) {
      this.logger.error(`Can not save bank feed export file to S3`, e, {
        publicOrganizationId: params.publicOrganizationId
      })
    }
  }
}
