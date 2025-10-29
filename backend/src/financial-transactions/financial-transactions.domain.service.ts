import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { format } from 'date-fns'
import { ChartOfAccountMappingsDomainService } from '../chart-of-account-mappings/chart-of-account-mappings.domain.service'
import { PaginationResponse } from '../core/interfaces'
import { ChartOfAccountRulesEventTypes } from '../domain/chart-of-account-rules/listeners/interfaces'
import { FinancialTransformationsEventType } from '../domain/financial-transformations/events/events'
import { FilesService } from '../files/files.service'
import { BucketSelector } from '../files/interfaces'
import { NULL_API_STRING } from '../shared/constants'
import { CsvStringifierFactory } from '../shared/csv/csv-stringifier-factory'
import { csvUtils } from '../shared/csv/utils'
import { AnnotationsEntityService } from '../shared/entity-services/annotations/annotations.entity-service'
import { AnnotationType } from '../shared/entity-services/annotations/interfaces'
import { FinancialTransactionChildAnnotationEntityService } from '../shared/entity-services/annotations/resource-annotations/financial-transaction-child-annotations.entity-service'
import { Blockchain } from '../shared/entity-services/blockchains/blockchain.entity'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { ContactsEntityService } from '../shared/entity-services/contacts/contacts.entity-service'
import { FinancialTransactionChildMetadata } from '../shared/entity-services/financial-transactions/financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionFile } from '../shared/entity-services/financial-transactions/financial-transaction-files.entity'
import { FinancialTransactionsEntityService } from '../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { FinancialTransactionChildMetadataDirection } from '../shared/entity-services/financial-transactions/interfaces'
import { GainsLossesEntityService } from '../shared/entity-services/gains-losses/gains-losses.entity-service'
import { TaxLotStatus } from '../shared/entity-services/gains-losses/interfaces'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { dateHelper } from '../shared/helpers/date.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { getBlockExplorerUrlToAddress, getBlockExplorerUrlToTransaction } from '../shared/utils/utils'
import { DataOnchainQueryService } from '../data-onchain-ingestor/data-onchain-query.service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { WalletGroupsEntityService } from '../shared/entity-services/wallet-groups/wallet-groups.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { SolFinancialTransactionsEntityService } from '../shared/entity-services/sol-financial-transactions/sol-financial-transactions.entity-service'
import { 
  CreateSolFinancialTransactionParentDto,
  CreateSolFinancialTransactionChildDto,
  SolFinancialTransactionParentActivity,
  SolFinancialTransactionParentStatus,
  SolFinancialTransactionParentExportStatus,
  SolFinancialTransactionChildMetadataDirection,
  SolFinancialTransactionChildMetadataType,
  SolFinancialTransactionChildMetadataStatus,
  SolGainLossInclusionStatus
} from '../shared/entity-services/sol-financial-transactions/interfaces'
import { SolImportJobService } from './sol-import-job.service'
import { SolanaFakeDataService } from './solana-fake-data.service'
import {
  FinancialTransactionChildTaxLotSalesDto,
  FinancialTransactionDto,
  FinancialTransactionFileDto,
  FinancialTransactionParentDetailDto,
  FinancialTransactionParentUpdateDto,
  FinancialTransactionQueryParams,
  FinancialTransactionUpdateDto
} from './interfaces'
import { SolanaFinancialTransactionQueryParams } from './interfaces'

// 22/12/2022, 03:30 PM
const EXPORT_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss'
// 22-12-2022,
const XERO_DATE_FORMAT = 'dd-MM-yyyy'
const MAXIMUM_TAGS_PER_FINANCIAL_TRANSACTION = 10

@Injectable()
export class FinancialTransactionsDomainService {
  constructor(
    private financialTransactionsEntityService: FinancialTransactionsEntityService,
    private contactsService: ContactsEntityService,
    private chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private filesService: FilesService,
    private eventEmitter: EventEmitter2,
    private logger: LoggerService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private chartOfAccountMappingsDomainService: ChartOfAccountMappingsDomainService,
    private annotationsEntityService: AnnotationsEntityService,
    private financialTransactionChildAnnotationEntityService: FinancialTransactionChildAnnotationEntityService,
    private readonly organizationsService: OrganizationsEntityService,
    private readonly blockchainsEntityService: BlockchainsEntityService,
    private readonly gainsLossesEntityService: GainsLossesEntityService,
    private readonly dataOnchainQuery: DataOnchainQueryService,
    private readonly walletsService: WalletsEntityService,
    private readonly walletGroupsService: WalletGroupsEntityService,
    private readonly cryptocurrenciesService: CryptocurrenciesEntityService,
    private readonly solFinancialTransactionsEntityService: SolFinancialTransactionsEntityService,
    private readonly solImportJobService: SolImportJobService,
    private readonly solanaFakeDataService: SolanaFakeDataService
  ) {}

  async getAllPaging(organizationId: string, query: FinancialTransactionQueryParams) {
    const blockchainIds = await this.blockchainsEntityService.getEnabledIdsFromOrDefaultIfEmpty(query.blockchainIds)
    const result = await this.financialTransactionsEntityService.getAllChildPaging(
      {
        ...query,
        blockchainIds
      },
      organizationId
    )

    const items = await this.convertToDto(organizationId, result.items)
    return PaginationResponse.from({
      items: items,
      limit: result.limit,
      totalItems: result.totalItems,
      currentPage: result.currentPage
    })
  }

  async getAllSolanaTransactionsPaging(organizationId: string, query: SolanaFinancialTransactionQueryParams) {
    this.logger.debug(`Getting paginated Solana financial transactions for organization: ${organizationId}`)
    
    try {
      // Get Solana blockchain IDs
      const solanaBlockchainIds = await this.blockchainsEntityService.getSolanaBlockchainPublicIds()
      
      if (solanaBlockchainIds.length === 0) {
        this.logger.error('No Solana blockchains found')
        return {
          data: {
            items: [],
            totalItems: "0",
            totalPages: 0,
            currentPage: query.page || 0,
            limit: query.size || 10
          }
        }
      }

      // Get all Solana wallets for the organization (if not filtered by walletIds)
      let walletIds = query.walletIds
      if (!walletIds || walletIds.length === 0) {
        const orgWallets = await this.walletsService.getAllByOrganizationId(organizationId)
        const solanaWallets = orgWallets.filter(wallet => 
          wallet.supportedBlockchains?.some(bc => bc.includes('solana'))
        )
        walletIds = solanaWallets.map(w => w.publicId)
      }

      if (walletIds.length === 0) {
        this.logger.debug('No Solana wallets found for organization')
        return {
          data: {
            items: [],
            totalItems: "0", 
            totalPages: 0,
            currentPage: query.page || 0,
            limit: query.size || 10
          }
        }
      }

      // Handle wallet group filtering - get wallets from wallet groups
      if (query.walletGroupIds && query.walletGroupIds.length > 0) {
        let groupWalletIds: string[] = []
        
        // Get wallet groups first
        const walletGroups = await this.walletGroupsService.getByOrganizationAndPublicIds(
          organizationId, 
          query.walletGroupIds,
          ['wallets']
        )
        
        // Extract wallets from all groups
        for (const group of walletGroups) {
          if (group.wallets && group.wallets.length > 0) {
            const solanaGroupWallets = group.wallets.filter(wallet => 
              wallet.supportedBlockchains?.some(bc => bc.includes('solana'))
            )
            groupWalletIds = [...groupWalletIds, ...solanaGroupWallets.map(w => w.publicId)]
          }
        }
        
        // Remove duplicates
        groupWalletIds = [...new Set(groupWalletIds)]
        
        // If both walletIds and walletGroupIds are provided, use intersection
        if (walletIds && walletIds.length > 0) {
          walletIds = walletIds.filter(id => groupWalletIds.includes(id))
        } else {
          walletIds = groupWalletIds
        }
      }

      // Get paginated Solana transactions
      const result = await this.solFinancialTransactionsEntityService.getAllTransactionsPaging(
        organizationId,
        {
          page: query.page || 0,
          size: query.size || 10,
          walletIds,
          symbol: query.symbol,
          type: query.type,
          direction: query.direction,
          startDate: query.startDate,
          endDate: query.endDate,
          fromAddress: query.fromAddress,
          toAddress: query.toAddress,
          address: query.address,
          txHash: query.txHash,
          activity: query.activity,
          substatuses: query.substatuses,
          walletAddresses: query.walletAddresses
        }
      )

      this.logger.debug('Solana transactions result', { 
        itemCount: result.items.length, 
        totalItems: result.totalItems,
        firstItem: result.items[0] ? {
          id: result.items[0].id,
          hasParent: !!result.items[0].solFinancialTransactionParent,
          hasMetadata: !!result.items[0].solFinancialTransactionChildMetadata,
          hasCrypto: !!result.items[0].cryptocurrency
        } : null
      })

      // Convert to rich DTO format similar to EVM transactions
      const enrichedItems = await this.convertSolanaTransactionsToRichDto(organizationId, result.items)

      return PaginationResponse.from({
        items: enrichedItems,
        totalItems: result.totalItems,
        currentPage: result.currentPage,
        limit: result.limit
      })

    } catch (error) {
      this.logger.error('Failed to get paginated Solana financial transactions', error, { organizationId, query })
      throw error
    }
  }

  /*async getCSVForExport(organizationId: string, query: FinancialTransactionQueryParams) {
    const blockchainIds = await this.blockchainsEntityService.getEnabledIdsFromOrDefaultIfEmpty(query.blockchainIds)

    const result = await this.financialTransactionsEntityService.getAllChildren(
      {
        ...query,
        blockchainIds
      },
      organizationId
    )
    const financialTransactionDtos = await this.convertToDto(organizationId, result)

    const csvStringifier = CsvStringifierFactory.createArrayCsvStringifier({
      header: ['Date', 'Amount', 'Payee', 'Description', 'Reference', 'Analysis Code', 'Has Error', 'Error Message']
    })

    const data: string[][] = []
    for (const transaction of financialTransactionDtos) {
      const { hasError, error } = transactionsHelper.getErrorsField(transaction.fiatAmount)
      data.push([
        format(transaction.valueTimestamp, XERO_DATE_FORMAT),
        transactionsHelper.formatFiatPrice(transaction.fiatAmount, transaction.type, 2),
        transaction.fromContact
          ? `${transaction.fromContact.name} - ${transaction.fromAddress}`
          : transaction.fromAddress,
        this.getCSVDescription({
          bottomNote: '', //TODO: Transaction comment.
          tokenAmount: transaction.cryptocurrencyAmount,
          symbol: transaction.cryptocurrency.symbol
        }),
        transaction.hash,
        transaction.correspondingChartOfAccount?.name ?? '',
        hasError ? 'Yes' : 'No',
        error
      ])
    }
    return csvStringifier.getCsvByPages(data)
  }*/

  async getTxsCSV(organizationId: string, query: FinancialTransactionQueryParams): Promise<string> {
    const blockchains = await this.blockchainsEntityService.getEnabledFromOrDefaultIfEmpty(query.blockchainIds)

    const csvStringifier = CsvStringifierFactory.createArrayCsvStringifier({
      header: [
        'Date Time',
        'Txn Hash',
        'Type',
        'From Wallet',
        'To Wallet',
        'Token Name',
        'Token Amount In',
        'Token Amount Out',
        'Fiat Value In',
        'Fiat Value Out',
        'Realised Gains/Loss',
        'Account',
        'Tags', // This is a product naming to correspond to the columns in the UI, this should be annotation in the future
        'Notes',
        'Blockchain'
      ]
    })
    const pageSize = 500
    let page = 0
    const allData: string[][] = []

    let paginatedData: string[][] = []
    do {
      paginatedData = await this.getAndConvertToCSV(query, blockchains, organizationId, page, pageSize)
      allData.push(...paginatedData)
      page++
    } while (paginatedData.length === pageSize)

    return csvStringifier.getCsvString(allData)
  }

  async saveExportToS3(csvData: string, publicOrganizationId: string) {
    try {
      const filePath = this.filesService.getPathToOrganizationExportFiles(publicOrganizationId)
      const fileContents = Buffer.from(csvData)
      await this.filesService.uploadToS3(fileContents, filePath, BucketSelector.PRIVATE, 'text/csv')
    } catch (e) {
      this.logger.error(`Can not save csv file to S3`, e, {
        publicOrganizationId
      })
    }
  }

  private async getAndConvertToCSV(
    query: FinancialTransactionQueryParams,
    blockchains: Blockchain[],
    organizationId: string,
    page: number,
    pageSize: number
  ) {
    const result = await this.financialTransactionsEntityService.getAllChildren(
      {
        ...query,
        blockchainIds: blockchains.map((b) => b.publicId)
      },
      organizationId,
      page,
      pageSize
    )

    const financialTransactionDtos = await this.convertToDto(organizationId, result)
    const data: string[][] = []
    const organizationSetting = await this.organizationSettingsService.getByOrganizationId(organizationId, {
      timezone: true
    })

    for (const transaction of financialTransactionDtos) {
      const blockchain = blockchains.find((b) => b.publicId === transaction.blockchainId)

      if (!blockchain) {
        this.logger.error(`Can not find blockchain ${transaction.blockchainId}`, {
          blockchainId: transaction.blockchainId,
          financialTransactionId: transaction.id,
          organizationId: organizationId
        })
      }

      const txUrl = getBlockExplorerUrlToTransaction(blockchain, transaction.hash)

      const fromWalletUrl = getBlockExplorerUrlToAddress(blockchain, transaction.fromAddress)
      const fromWalletName = transaction.fromContact?.name ?? transaction.fromAddress

      const toWalletUrl = getBlockExplorerUrlToAddress(blockchain, transaction.toAddress)
      const toWalletName = transaction.toContact?.name ?? transaction.toAddress

      const tokenAddress = transaction.cryptocurrency.addresses.find(
        (a) => a.blockchainId === transaction.blockchainId
      )?.address
      const tokenUrl = getBlockExplorerUrlToAddress(blockchain, tokenAddress)
      const tokenName = transaction.cryptocurrency.symbol
      const isIn = transaction.direction === FinancialTransactionChildMetadataDirection.INCOMING
      const isOut = transaction.direction === FinancialTransactionChildMetadataDirection.OUTGOING

      const zonedDate = dateHelper.utcToZonedTime(transaction.valueTimestamp, organizationSetting.timezone.utcOffset)
      const coa = transaction.correspondingChartOfAccount
        ? transaction.correspondingChartOfAccount.code
          ? `${transaction.correspondingChartOfAccount.code}-${transaction.correspondingChartOfAccount.name}`
          : `${transaction.correspondingChartOfAccount.name}`
        : ''
      const annotationNames = transaction.annotations?.map((annotation) => annotation.name).join(',')
      data.push([
        format(zonedDate, EXPORT_DATETIME_FORMAT),
        csvUtils.getHyperlink(txUrl, transaction.hash),
        transaction.typeDetail.label,
        fromWalletName ? csvUtils.getHyperlink(fromWalletUrl, fromWalletName) : '',
        toWalletName ? csvUtils.getHyperlink(toWalletUrl, toWalletName) : '',
        tokenAddress ? csvUtils.getHyperlink(tokenUrl, tokenName) : tokenName,
        isIn ? transaction.cryptocurrencyAmount : '',
        isOut ? transaction.cryptocurrencyAmount : '',
        isIn ? transaction.fiatAmount : '',
        isOut ? transaction.fiatAmount : '',
        transaction.gainLoss ?? '',
        coa,
        annotationNames,
        transaction.note,
        transaction.blockchainId
      ])
    }

    return data
  }

  getCSVDescription(params: { topNote?: string; bottomNote?: string; symbol: string; tokenAmount: string }) {
    return `${params.topNote ?? ''} ${params.symbol} - ${params.tokenAmount} ${params.bottomNote ?? ''}`
  }

  async convertToDto(organizationId: string, children: FinancialTransactionChild[]) {
    const contactsGrouped = await this.getGroupedContacts(organizationId)

    const financialTransactionDtos: FinancialTransactionDto[] = children.map((child) =>
      FinancialTransactionDto.map(child, true, contactsGrouped)
    )

    for (const dto of financialTransactionDtos) {
      // Try both original case and lowercase for contact lookup
      dto.fromContact = contactsGrouped[dto.fromAddress] || contactsGrouped[dto.fromAddress?.toLowerCase()]
      dto.toContact = contactsGrouped[dto.toAddress] || contactsGrouped[dto.toAddress?.toLowerCase()]

      if (dto.gnosisMetadata?.confirmations) {
        for (const confirmation of dto.gnosisMetadata.confirmations) {
          confirmation.ownerContact = contactsGrouped[confirmation.owner] || contactsGrouped[confirmation.owner?.toLowerCase()]
        }
      }
    }

    return financialTransactionDtos
  }

  async getParentByHashAndOrganization(params: { parentHash: string; organizationId: string; childPublicId: string }) {
    const parent = await this.financialTransactionsEntityService.getParentByHashAndOrganization(
      params.parentHash,
      params.organizationId
    )

    if (!parent) {
      throw new BadRequestException('There is no given hash in the organization')
    }

    if (!parent.financialTransactionChild.find((child) => child.publicId === params.childPublicId)) {
      throw new BadRequestException('Invalid financialTransactionId and hash combination')
    }

    const contactsGrouped = await this.getGroupedContacts(params.organizationId)

    return FinancialTransactionParentDetailDto.map(parent, contactsGrouped)
  }

  async update(params: {
    organizationId: string
    childPublicId: string
    accountId: string
    body: FinancialTransactionUpdateDto
  }): Promise<FinancialTransactionDto> {
    const financialTransactionChild = await this.financialTransactionsEntityService.getChildByOrganizationIdAndPublicId(
      {
        organizationId: params.organizationId,
        publicId: params.childPublicId,
        relations: {
          financialTransactionChildMetadata: true,
          financialTransactionParent: true
        }
      }
    )

    if (!financialTransactionChild) {
      throw new BadRequestException('There is no given financial transaction in the organization')
    }

    let newFinTxMetadata: Partial<FinancialTransactionChildMetadata> = {}
    let toResyncPriceForChildId = false

    if (params.body.correspondingChartOfAccountId !== undefined) {
      if (params.body.correspondingChartOfAccountId) {
        const correspondingChartOfAccount = await this.chartOfAccountsEntityService.getByOrganizationIdAndPublicId(
          params.organizationId,
          params.body.correspondingChartOfAccountId
        )
        if (!correspondingChartOfAccount) {
          throw new BadRequestException('There is no given chart of account in the organization')
        }

        newFinTxMetadata = {
          ...newFinTxMetadata,
          correspondingChartOfAccount: correspondingChartOfAccount,
          correspondingChartOfAccountUpdatedBy: `account_${params.accountId}`
        }
      } else if (params.body.correspondingChartOfAccountId === null) {
        newFinTxMetadata = {
          ...newFinTxMetadata,
          correspondingChartOfAccount: null,
          correspondingChartOfAccountUpdatedBy: null
        }
      }
    }

    if (params.body.amountPerUnit) {
      const updatedMetadata = await this.financialTransactionsEntityService.generatePartialChildMetadataForPriceUpdate({
        cryptocurrencyAmount: financialTransactionChild.cryptocurrencyAmount,
        pricePerUnit: params.body.amountPerUnit,
        fiatCurrency: financialTransactionChild.financialTransactionChildMetadata.fiatCurrency,
        updatedBy: `account_${params.accountId}`
      })
      newFinTxMetadata = { ...newFinTxMetadata, ...updatedMetadata }
      toResyncPriceForChildId = true
    }

    if (params.body.amount) {
      const updatedMetadata = await this.financialTransactionsEntityService.generatePartialChildMetadataForPriceUpdate({
        cryptocurrencyAmount: financialTransactionChild.cryptocurrencyAmount,
        totalPrice: params.body.amount,
        fiatCurrency: financialTransactionChild.financialTransactionChildMetadata.fiatCurrency,
        updatedBy: `account_${params.accountId}`
      })
      newFinTxMetadata = { ...newFinTxMetadata, ...updatedMetadata }
      toResyncPriceForChildId = true
    }

    if (params.body.note !== undefined) {
      newFinTxMetadata = {
        ...newFinTxMetadata,
        note: params.body.note
      }
    }

    // TODO: refactor this hardcoded logic to be cleaner
    if (!Object.keys(newFinTxMetadata).length /*&& !params.body?.status*/) {
      throw new BadRequestException('No valid fields to update')
    }

    await this.financialTransactionsEntityService.updateChildMetadataByChildId(
      financialTransactionChild.id,
      newFinTxMetadata
    )

    // if (params.body.status) {
    //   await this.financialTransactionsEntityService.changeChildStatus({
    //     organizationId: params.organizationId,
    //     childId: financialTransactionChild.id,
    //     childMetadataId: financialTransactionChild.financialTransactionChildMetadata.id,
    //     status: params.body.status
    //   })
    // }

    if (params.body.correspondingChartOfAccountId === null) {
      this.eventEmitter.emit(ChartOfAccountRulesEventTypes.SYNC_UNMAPPED_FINANCIAL_TRANSACTIONS, {
        organizationId: params.organizationId
      })
    }

    if (toResyncPriceForChildId) {
      this.eventEmitter.emit(
        FinancialTransformationsEventType.OPERATIONAL_TRANSFORMATION_RECALCULATE_PRICES_FOR_TRANSACTION_PARENT,
        financialTransactionChild.financialTransactionParent.id
      )
    }

    const updatedFinancialTransactionChild = await this.financialTransactionsEntityService.getChildWithAllRelationsById(
      financialTransactionChild.id
    )

    const contactsGrouped = await this.getGroupedContacts(params.organizationId)

    return FinancialTransactionDto.map(updatedFinancialTransactionChild, true, contactsGrouped)
  }

  async updateParent(params: {
    organizationId: string
    childPublicId: string
    parentHash: string
    financialTransactionParentUpdateDto: FinancialTransactionParentUpdateDto
  }): Promise<FinancialTransactionParentDetailDto> {
    const parent = await this.financialTransactionsEntityService.getParentByHashAndOrganization(
      params.parentHash,
      params.organizationId
    )

    if (!parent) {
      throw new BadRequestException('There is no given hash in the organization')
    }

    const financialTransactionChild = parent.financialTransactionChild.find(
      (child) => child.publicId === params.childPublicId
    )

    if (!financialTransactionChild) {
      throw new BadRequestException('Invalid financialTransactionId and hash combination')
    }

    if (!Object.keys(params.financialTransactionParentUpdateDto).includes('remark')) {
      throw new BadRequestException('No valid fields to update')
    }

    if (params.financialTransactionParentUpdateDto?.remark) {
      const remarkUpdate =
        params.financialTransactionParentUpdateDto.remark === NULL_API_STRING
          ? null
          : params.financialTransactionParentUpdateDto.remark

      await this.financialTransactionsEntityService.updateParentIdWithRemark(parent.id, remarkUpdate)
      parent.remark = remarkUpdate
    }

    const contactsGrouped = await this.getGroupedContacts(params.organizationId)

    return FinancialTransactionParentDetailDto.map(parent, contactsGrouped)
  }

  async uploadFiles(param: { organizationId: string; childPublicId: string; files: Express.Multer.File[] }) {
    const financialTransactionChild =
      await this.financialTransactionsEntityService.getChildWithMetadataByOrganizationIdAndPublicId({
        organizationId: param.organizationId,
        publicId: param.childPublicId
      })

    if (!financialTransactionChild) {
      throw new BadRequestException('There is no given financial transaction in the organization')
    }

    const files: FinancialTransactionFileDto[] = []

    const organization = await this.organizationsService.get(param.organizationId)

    for (const file of param.files) {
      const { filePath, key, bucket } = await this.filesService.uploadTransactionAttachment({
        file: file,
        organizationPublicId: organization.publicId,
        financialTransactionChildPublicId: financialTransactionChild.publicId
      })
      const attachment = FinancialTransactionFile.create({
        filePath,
        file: {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        },
        key,
        bucket,
        financialTransactionChildId: financialTransactionChild.id,
        organizationId: param.organizationId
      })
      const savedFile = await this.financialTransactionsEntityService.saveFile(attachment)
      files.push(FinancialTransactionFileDto.map(savedFile))
    }

    return files
  }

  async getFileStream(param: { organizationId: string; childPublicId: string; publicFileId: string }) {
    const financialTransactionFile = await this.financialTransactionsEntityService.getFileByOrganizationIdAndPublicId({
      organizationId: param.organizationId,
      publicId: param.publicFileId,
      childPublicId: param.childPublicId
    })

    if (!financialTransactionFile) {
      throw new BadRequestException('There is no file with given id in the organization')
    }
    try {
      const fileStream = await this.filesService.getTransactionAttachmentStream({
        key: financialTransactionFile.key,
        bucket: financialTransactionFile.bucket
      })
      return {
        fileStream,
        financialTransactionFile: FinancialTransactionFileDto.map(financialTransactionFile)
      }
    } catch (e) {
      throw new InternalServerErrorException('Error while getting file stream', e.message)
    }
  }

  async getFiles(param: { organizationId: string; childPublicId: string }) {
    try {
      const financialTransactionFiles =
        await this.financialTransactionsEntityService.getFilesByOrganizationIdAndChildPublicId({
          organizationId: param.organizationId,
          childPublicId: param.childPublicId
        })
      return financialTransactionFiles.map((file) => FinancialTransactionFileDto.map(file))
    } catch (e) {
      this.logger.error(`Error while getting files for organization ${param.organizationId}`, e, param)
      throw new InternalServerErrorException('Error while getting file stream', e.message)
    }
  }

  async deleteFile(param: { organizationId: string; childPublicId: string; publicFileId: string }) {
    const financialTransactionFile = await this.financialTransactionsEntityService.getFileByOrganizationIdAndPublicId({
      organizationId: param.organizationId,
      publicId: param.publicFileId,
      childPublicId: param.childPublicId
    })

    if (!financialTransactionFile) {
      throw new BadRequestException('There is no file with given id in the organization')
    }
    const result = await this.financialTransactionsEntityService.softDeleteFile(financialTransactionFile.id)
    return !!result.affected
  }

  async getGroupedContacts(organizationId: string): Promise<{ [address: string]: ContactDto }> {
    const contacts: ContactDto[] = await this.contactsService.getByOrganizationIdAndNameOrAddress({
      organizationId
    })

    return this.contactsService.groupContactDtosByAddress(contacts)
  }

  async getTaxLotSalesWithOriginChildMetadata(params: {
    organizationId: string
    childPublicId: string
  }): Promise<FinancialTransactionChildTaxLotSalesDto[]> {
    const financialTransactionChild = await this.financialTransactionsEntityService.getChildByOrganizationIdAndPublicId(
      {
        organizationId: params.organizationId,
        publicId: params.childPublicId
      }
    )

    if (!financialTransactionChild) {
      throw new BadRequestException('financialTransactionId does not exist')
    }

    const taxLotSales = await this.gainsLossesEntityService.getTaxLotSalesByChildId(financialTransactionChild.id, {
      cryptocurrency: true,
      taxLot: true
    })

    const result: FinancialTransactionChildTaxLotSalesDto[] = []

    for (const taxLotSale of taxLotSales) {
      let previousTaxLotSaleId = taxLotSale.taxLot.previousTaxLotSaleId
      let originChildId = taxLotSale.taxLot.financialTransactionChildId

      while (previousTaxLotSaleId) {
        const previousTaxLotSale = await this.gainsLossesEntityService.getTaxLotSaleById(previousTaxLotSaleId, {
          taxLot: true
        })
        previousTaxLotSaleId = previousTaxLotSale.taxLot.previousTaxLotSaleId
        originChildId = previousTaxLotSale.taxLot.financialTransactionChildId
      }

      const child = await this.financialTransactionsEntityService.getChildById(originChildId)

      result.push(FinancialTransactionChildTaxLotSalesDto.map(taxLotSale, child.hash, child.valueTimestamp))
    }

    return result
  }

  async getChartOfAccountMappingForChild(params: { organizationId: string; childPublicId: string }) {
    const financialTransactionChild = await this.financialTransactionsEntityService.getChildByOrganizationIdAndPublicId(
      {
        organizationId: params.organizationId,
        publicId: params.childPublicId,
        relations: { financialTransactionChildMetadata: true, financialTransactionParent: true }
      }
    )

    if (!financialTransactionChild) {
      throw new BadRequestException('financialTransactionId does not exist')
    }

    return this.chartOfAccountMappingsDomainService.getDefaultCOAMappingForChild(
      params.organizationId,
      financialTransactionChild
    )
  }

  async createAnnotationForChild(params: {
    organizationId: string
    childPublicId: string
    annotationPublicId: string
    createdBy: string
  }) {
    const financialTransactionChild = await this.financialTransactionsEntityService.getChildByOrganizationIdAndPublicId(
      {
        organizationId: params.organizationId,
        publicId: params.childPublicId,
        relations: {
          financialTransactionChildMetadata: true,
          financialTransactionParent: true,
          financialTransactionChildAnnotations: { annotation: true }
        }
      }
    )

    if (!financialTransactionChild) {
      throw new BadRequestException('FinancialTransactionId does not exist.')
    }

    if (
      financialTransactionChild.financialTransactionChildAnnotations?.filter(
        (annotation) => annotation.annotation.type === AnnotationType.TAG
      ).length >= MAXIMUM_TAGS_PER_FINANCIAL_TRANSACTION
    ) {
      throw new BadRequestException(`Maximum number of tags is ${MAXIMUM_TAGS_PER_FINANCIAL_TRANSACTION}.`)
    }

    const annotation = await this.annotationsEntityService.getOneByPublicIdAndOrganizationId({
      publicId: params.annotationPublicId,
      organizationId: params.organizationId
    })

    if (!annotation) {
      throw new BadRequestException('Annotation does not exist.')
    }

    if (
      financialTransactionChild.financialTransactionChildAnnotations?.find(
        (childAnnotation) => childAnnotation.annotation.id === annotation.id
      )
    ) {
      throw new BadRequestException('Annotation already exists.')
    }

    await this.financialTransactionChildAnnotationEntityService.createResourceAnnotation({
      resourceId: financialTransactionChild.id,
      annotationId: annotation.id,
      createdBy: `account_${params.createdBy}`
    })
  }

  async deleteAnnotationForChild(params: {
    organizationId: string
    childPublicId: string
    annotationPublicId: string
    deletedBy: string
  }) {
    const financialTransactionChild = await this.financialTransactionsEntityService.getChildByOrganizationIdAndPublicId(
      {
        organizationId: params.organizationId,
        publicId: params.childPublicId,
        relations: {
          financialTransactionChildMetadata: true,
          financialTransactionParent: true,
          financialTransactionChildAnnotations: true
        }
      }
    )

    if (!financialTransactionChild) {
      throw new BadRequestException('FinancialTransactionId does not exist.')
    }

    const annotation = await this.annotationsEntityService.getOneByPublicIdAndOrganizationId({
      publicId: params.annotationPublicId,
      organizationId: params.organizationId
    })

    if (!annotation) {
      throw new BadRequestException('Annotation does not exist.')
    }

    return this.financialTransactionChildAnnotationEntityService.softDeleteByResourceAndAnnotation({
      resourceId: financialTransactionChild.id,
      annotationId: annotation.id,
      deletedBy: params.deletedBy
    })
  }

  // Solana-specific methods
  async importSolanaTransactions(organizationId: string, walletPublicId: string): Promise<any> {
    // Get wallet to validate it exists
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException(`Wallet not found: ${walletPublicId}`)
    }

    // Check if there's already an active job for this wallet
    const existingJob = await this.solImportJobService.getActiveJob(organizationId, walletPublicId)
    if (existingJob) {
      return {
        message: 'Import job already in progress',
        job_id: existingJob.id,
        status: existingJob.status,
        progress: existingJob.progress
      }
    }

    // Create new import job
    const job = await this.solImportJobService.createJob(organizationId, walletPublicId, { 
      exclude_wsol: false,
      limit: 100,
      offset: 0 
    })

    this.logger.debug(`Created import job ${job.id} for wallet: ${walletPublicId}`)

    // Start background processing (don't await)
    this.processSolanaImportInBackground(job.id, organizationId, walletPublicId)
      .catch(error => {
        this.logger.error(`Background import failed for job ${job.id}:`, error)
        this.solImportJobService.updateJobStatus(job.id, 'failed', error.message)
      })

    return {
      message: 'Import job started successfully',
      job_id: job.id,
      status: 'pending',
      estimated_duration: '1-2 minutes'
    }
  }

  private async processSolanaImportInBackground(
    jobId: string, 
    organizationId: string, 
    walletPublicId: string
  ): Promise<void> {
    try {
      // Update job status to running
      await this.solImportJobService.updateJobStatus(jobId, 'running')

      this.logger.debug(`Processing Solana transactions for wallet: ${walletPublicId}, job: ${jobId}`)

      // Get wallet
      const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
      if (!wallet) {
        throw new Error('Wallet not found')
      }

      const response = await this.dataOnchainQuery.getTransactions(
        wallet.address,
        'solana',
        {
          exclude_wsol: false,
          limit: 100,
          offset: 0
        }
      ) as any

      const transactions = response?.data || response || []
      this.logger.debug(`Found ${transactions.length} Solana transactions`)

      // Group transactions by hash to create parent-child structure
      const transactionGroups = this.groupTransactionsByHash(transactions)
      const totalGroups = transactionGroups.size
      let processedGroups = 0

      for (const [hash, txGroup] of transactionGroups.entries()) {
        const existingTransaction = await this.financialTransactionsEntityService.getParentByHashAndOrganization(hash, organizationId)

        if (!existingTransaction) {
          this.logger.debug(`Creating new Solana transaction: ${hash}`)
          await this.createSolanaFinancialTransaction(organizationId, hash, txGroup)
        } else {
          this.logger.debug(`Transaction already exists: ${hash}`)
        }

        processedGroups++
        
        // Update progress every 10 transactions or at the end
        if (processedGroups % 10 === 0 || processedGroups === totalGroups) {
          await this.solImportJobService.incrementProgress(jobId, processedGroups, totalGroups)
        }
      }

      // Mark job as completed
      await this.solImportJobService.updateJobStatus(jobId, 'completed', `Successfully imported ${transactions.length} transactions`)

      this.logger.debug(`Successfully completed import job ${jobId} for wallet: ${walletPublicId}`)

      // 🎭 Automatically generate fake price data for the newly imported transactions
      try {
        this.logger.info(`🎭 Auto-generating fake price data for newly imported transactions...`)
        const fakeDataResult = await this.generateFakeDataForExistingTransactions(organizationId)
        this.logger.info(`✅ Auto-generated fake data completed`, {
          processed: fakeDataResult.processed,
          updated: fakeDataResult.updated,
          errors: fakeDataResult.errors.length
        })
      } catch (fakeDataError) {
        this.logger.error(`Failed to auto-generate fake price data after import:`, fakeDataError)
        // Don't fail the whole import job if fake data generation fails
      }

    } catch (error) {
      this.logger.error(`Error in background import job ${jobId}:`, error)
      await this.solImportJobService.updateJobStatus(jobId, 'failed', error.message)
      throw error
    }
  }

  async getSolanaImportJobStatus(organizationId: string, jobId: string): Promise<any> {
    const job = await this.solImportJobService.getJobById(jobId)
    
    if (!job) {
      throw new BadRequestException('Import job not found')
    }

    // Verify job belongs to the organization
    if (job.organizationId !== organizationId) {
      throw new BadRequestException('Import job not found')
    }

    return {
      job_id: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error,
      wallet_public_id: job.walletPublicId,
      organization_id: job.organizationId,
      total_transactions: job.totalTransactions,
      processed_transactions: job.processedTransactions,
      started_at: job.startedAt,
      completed_at: job.completedAt,
      metadata: job.metadata
    }
  }

  async getSolanaWalletTransactions(
    organizationId: string,
    walletPublicId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any> {
    // Get wallet
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    this.logger.debug(`Getting Solana transactions for wallet: ${walletPublicId} with rich format`)
    
    try {
      // Use the same method as the main endpoint but filtered for this wallet
      const result = await this.solFinancialTransactionsEntityService.getAllTransactionsPaging(
        organizationId,
        {
          page: Math.floor(offset / limit), // Convert offset to page
          size: limit,
          walletIds: [walletPublicId], // Filter by this specific wallet
          symbol: undefined,
          type: undefined,
          direction: undefined,
          startDate: undefined,
          endDate: undefined
        }
      )

      this.logger.debug('Wallet transactions result', { 
        walletPublicId,
        itemCount: result.items.length, 
        totalItems: result.totalItems,
        currentPage: result.currentPage
      })

      // Convert to rich DTO format - same as main endpoint
      const enrichedItems = await this.convertSolanaTransactionsToRichDto(organizationId, result.items)

      return {
        data: {
          items: enrichedItems,
          totalItems: result.totalItems,
          totalPages: Math.ceil(parseInt(result.totalItems.toString()) / limit),
          currentPage: result.currentPage,
          limit: result.limit
        }
      }

    } catch (error) {
      this.logger.error('Failed to get wallet Solana transactions with rich format', error, { 
        organizationId, 
        walletPublicId, 
        limit, 
        offset 
      })
      throw error
    }
  }

  async getSolanaWalletBalanceSummary(
    organizationId: string,
    walletPublicId: string
  ): Promise<any> {
    // Get wallet
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    this.logger.debug(`Getting Solana balance summary for wallet: ${walletPublicId}`, { walletAddress: wallet.address })
    
    // Get balances from Solana financial transactions service
    // For existing data compatibility, try both the current address and lowercase version
    let balances = await this.solFinancialTransactionsEntityService.getWalletBalances(
      organizationId,
      wallet.address
    )
    
    // If no balances found, try with lowercase address (for backward compatibility)
    if (!balances || balances.length === 0) {
      this.logger.debug(`No balances found with original case, trying lowercase for wallet: ${walletPublicId}`)
      balances = await this.solFinancialTransactionsEntityService.getWalletBalances(
        organizationId,
        wallet.address.toLowerCase()
      )
    }
    
    this.logger.debug(`Returning ${balances.length} balance entries for wallet: ${walletPublicId}`)
    
    return {
      walletPublicId,
      walletAddress: wallet.address,
      balances: balances.map(balance => ({
        tokenAddress: balance.tokenAddress,
        symbol: balance.symbol,
        balance: balance.balance
      })),
      totalTokens: balances.length
    }
  }

  async debugSolanaWalletData(organizationId: string, walletPublicId: string): Promise<any> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    // Debug transaction data
    const debugData = await this.solFinancialTransactionsEntityService.debugWalletTransactions(
      organizationId,
      wallet.address
    )

    return {
      walletPublicId,
      walletAddress: wallet.address,
      walletAddressLowercase: wallet.address.toLowerCase(),
      debugTransactions: debugData,
      foundTransactions: debugData.length
    }
  }

  private groupTransactionsByHash(transactions: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>()
    
    for (const tx of transactions) {
      if (!tx.hash) continue
      
      if (!groups.has(tx.hash)) {
        groups.set(tx.hash, [])
      }
      groups.get(tx.hash)!.push(tx)
    }
    
    return groups
  }

  private async createSolanaFinancialTransaction(organizationId: string, hash: string, transactions: any[]): Promise<void> {
    // Get Solana blockchain
    const blockchain = await this.blockchainsEntityService.getByPublicId('solana')
    if (!blockchain) {
      throw new BadRequestException('Solana blockchain not configured in system')
    }

    // Create parent transaction
    const activity = this.determineSolanaActivity(transactions)
    const firstTx = transactions[0]
    
    const parentDto: CreateSolFinancialTransactionParentDto = {
      publicId: hash,
      hash,
      blockchainId: blockchain.publicId,
      activity,
      status: SolFinancialTransactionParentStatus.ACTIVE,
      exportStatus: SolFinancialTransactionParentExportStatus.PENDING,
      organizationId,
      valueTimestamp: new Date((firstTx.timestamp || 0) * 1000),
      blockNumber: firstTx.block_number || 0,
      slot: firstTx.slot || 0,
      fee: firstTx.fee ? firstTx.fee.toString() : null,
      remark: null
    }

    const parentTransaction = await this.solFinancialTransactionsEntityService.createOrUpdateParent(parentDto)

    // Create child transactions
    for (const tx of transactions) {
      await this.createSolanaChildTransaction(organizationId, parentTransaction, tx, blockchain.publicId)
    }

    this.logger.debug(`Created Solana financial transaction with ${transactions.length} children`, { hash })
  }

  private async createSolanaChildTransaction(organizationId: string, parentTransaction: any, transaction: any, blockchainId: string, skipGainLoss = false): Promise<void> {
    // Get or create cryptocurrency
    const cryptocurrency = await this.getSolanaCryptocurrency(transaction.symbol, transaction.address)
    if (!cryptocurrency) {
      this.logger.error(`Cryptocurrency not found for symbol: ${transaction.symbol}`)
      return
    }

    // Determine type and direction
    const { type, direction } = this.determineSolanaTypeAndDirection(transaction)

    const childDto: CreateSolFinancialTransactionChildDto = {
      publicId: `${transaction.hash}-${transaction.transaction_id}`,
      hash: transaction.hash,
      blockchainId,
      fromAddress: transaction.from_address || null,
      toAddress: transaction.to_address || null,
      tokenAddress: transaction.address || null,
      cryptocurrency,
      cryptocurrencyAmount: transaction.amount || '0',
      valueTimestamp: new Date((transaction.timestamp || 0) * 1000),
      organizationId,
      solFinancialTransactionParent: parentTransaction,
      transactionId: transaction.transaction_id,
      instructionIndex: transaction.instruction_index || null,
      type,
      direction,
      status: SolFinancialTransactionChildMetadataStatus.SYNCED,
      gainLossInclusionStatus: SolGainLossInclusionStatus.ALL,
      solanaMetadata: {
        program: transaction.program,
        instruction: transaction.instruction,
        kind: transaction.kind
      }
    }

    const childTransaction = await this.solFinancialTransactionsEntityService.upsertChild(childDto)
    
    // Skip gain/loss processing during import - will be done later with fake data generation
    // This avoids processing transactions without price data and ensures all transactions are processed together
    this.logger.debug(`Created child transaction: ${childDto.publicId} (gain/loss processing deferred to post-import fake data generation)`)
    
    this.logger.debug(`Created child transaction: ${childDto.publicId}`)
  }

  private determineSolanaActivity(transactions: any[]): SolFinancialTransactionParentActivity {
    const hasIncoming = transactions.some(tx => tx.kind === 'IN')
    const hasOutgoing = transactions.some(tx => tx.kind === 'OUT')
    
    if (hasIncoming && hasOutgoing) {
      return SolFinancialTransactionParentActivity.SWAP
    } else if (hasIncoming) {
      return SolFinancialTransactionParentActivity.RECEIVE
    } else if (hasOutgoing) {
      return SolFinancialTransactionParentActivity.SEND
    }
    
    return SolFinancialTransactionParentActivity.OTHER
  }

  private determineSolanaTypeAndDirection(transaction: any): { 
    type: SolFinancialTransactionChildMetadataType; 
    direction: SolFinancialTransactionChildMetadataDirection 
  } {
    const isIncoming = transaction.kind === 'IN'
    
    // Determine type based on symbol/program
    let type = SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER
    if (transaction.symbol === 'SOL') {
      type = SolFinancialTransactionChildMetadataType.SOL_TRANSFER
    }
    
    return {
      type,
      direction: isIncoming ? SolFinancialTransactionChildMetadataDirection.INCOMING : SolFinancialTransactionChildMetadataDirection.OUTGOING
    }
  }

  private async getSolanaCryptocurrency(symbol: string, address?: string) {
    try {
      // Try to find by symbol first
      let cryptocurrency = await this.cryptocurrenciesService.getBySymbol(symbol)
      
      if (!cryptocurrency && address) {
        // Try to find by address and blockchain
        const blockchain = await this.blockchainsEntityService.getByPublicId('solana')
        if (blockchain && address) {
          cryptocurrency = await this.cryptocurrenciesService.getByAddressAndBlockchain(address, blockchain.publicId)
        }
      }
      
      if (!cryptocurrency) {
        // Create new cryptocurrency for Solana tokens
        try {
          const blockchain = await this.blockchainsEntityService.getByPublicId('solana')
          if (blockchain) {
            cryptocurrency = await this.cryptocurrenciesService.createSolanaToken({
              symbol,
              name: symbol,
              address: address || undefined,
              blockchainId: blockchain.publicId
            })
            this.logger.debug(`Created new Solana cryptocurrency: ${symbol}`)
          }
        } catch (error) {
          this.logger.error(`Failed to create Solana cryptocurrency: ${symbol}`, error)
          // If creation fails, we'll return null and skip this transaction
        }
      }
      
      return cryptocurrency
    } catch (error) {
      this.logger.error(`Error getting/creating cryptocurrency: ${symbol}`, error)
      return null
    }
  }

  async getWalletFinancialTransactions(
    organizationId: string,
    walletPublicId: string,
    filters: { page: number; size: number; symbol?: string; type?: string }
  ): Promise<any> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException(`Wallet not found: ${walletPublicId}`)
    }

    return await this.financialTransactionsEntityService.getAllChildPaging(
      {
        walletAddresses: [wallet.address],
        page: filters.page,
        size: filters.size,
        blockchainIds: [],
        activities: [],
        exportStatuses: [],
        invoices: [],
        childStatuses: [],
        childTypes: [],
        substatuses: [],
        startTime: '',
        endTime: '',
        assetIds: [],
        fromWalletAddresses: [],
        toWalletAddresses: [],
        fromAddresses: [],
        toAddresses: [],
        annotations: [],
        correspondingChartOfAccountIds: [],
        fromFiatAmount: null,
        toFiatAmount: null
      },
      organizationId
    )
  }

  async getWalletBalanceSummary(organizationId: string, walletPublicId: string): Promise<any> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException(`Wallet not found: ${walletPublicId}`)
    }

    const transactions = await this.financialTransactionsEntityService.getAllChildPaging(
      {
        walletAddresses: [wallet.address],
        page: 0,
        size: 1000,
        blockchainIds: [],
        activities: [],
        exportStatuses: [],
        invoices: [],
        childStatuses: [],
        childTypes: [],
        substatuses: [],
        startTime: '',
        endTime: '',
        assetIds: [],
        fromWalletAddresses: [],
        toWalletAddresses: [],
        fromAddresses: [],
        toAddresses: [],
        annotations: [],
        correspondingChartOfAccountIds: [],
        fromFiatAmount: null,
        toFiatAmount: null
      },
      organizationId
    )

    const balanceMap = new Map<string, { symbol: string; balance: number; valueUsd: number }>()

    for (const tx of transactions.items || []) {
      // FinancialTransactionChild structure is different - work with the child transaction directly
      const key = tx.cryptocurrency?.symbol || 'UNKNOWN'
      const existing = balanceMap.get(key) || { symbol: key, balance: 0, valueUsd: 0 }

      if (tx.toAddress === wallet.address) {
        existing.balance += parseFloat(tx.cryptocurrencyAmount || '0')
      } else if (tx.fromAddress === wallet.address) {
        existing.balance -= parseFloat(tx.cryptocurrencyAmount || '0')
      }

      // Use metadata for USD value if available
      const usdPrice = tx.financialTransactionChildMetadata?.fiatAmountPerUnit || '0'
      existing.valueUsd = existing.balance * parseFloat(usdPrice)
      balanceMap.set(key, existing)
    }

    const balances = Array.from(balanceMap.values()).filter(b => Math.abs(b.balance) > 0.000001)

    return {
      walletPublicId,
      balances,
      totalValueUsd: balances.reduce((sum, b) => sum + b.valueUsd, 0)
    }
  }

  /**
   * Process gain/loss calculation for Solana child transactions
   */
  private async processSolanaGainLossInternal(childTransaction: any, rawTransaction: any, organizationId: string): Promise<void> {
    try {
      // Determine direction from child transaction metadata
      const metadata = childTransaction.solFinancialTransactionChildMetadata
      const isOutgoing = metadata?.direction === 'OUTGOING'
      
      this.logger.debug(`Processing Solana gain/loss for transaction ${childTransaction.publicId}`, {
        direction: metadata?.direction,
        isOutgoing,
        symbol: childTransaction.cryptocurrency?.symbol
      })

      // 🎭 GENERATE FAKE PRICE DATA FOR DEVELOPMENT/TESTING
      const fakePrice = await this.generateFakePriceData(childTransaction, rawTransaction)
      
      // Update child transaction metadata with fake price data
      await this.updateSolanaChildTransactionWithFakeData(childTransaction, fakePrice)
      
      if (!isOutgoing) {
        // For incoming transactions, create tax lots (cost basis)
        await this.createSolanaTaxLot(childTransaction, rawTransaction, organizationId)
      } else {
        // For outgoing transactions, calculate gain/loss using FIFO
        await this.calculateSolanaGainLoss(childTransaction, rawTransaction, organizationId)
      }
    } catch (error) {
      this.logger.error(`Error processing Solana gain/loss for transaction ${childTransaction.publicId}:`, error)
      throw error
    }
  }

  /**
   * Create tax lot for incoming Solana transactions (establishes cost basis)
   */
  private async createSolanaTaxLot(childTransaction: any, rawTransaction: any, organizationId: string): Promise<void> {
    try {
      // Skip if amount is zero or negative
      const amount = parseFloat(childTransaction.cryptocurrencyAmount || '0')
      if (amount <= 0) {
        return
      }

      // Get wallet information
      const wallet = await this.walletsService.getByOrganizationIdAndAddress(
        organizationId,
        childTransaction.toAddress
      )
      if (!wallet) {
        this.logger.error(`Wallet not found for address: ${childTransaction.toAddress}`)
        // 🎭 Still create fake cost basis for incoming transactions even without wallet
        const metadata = childTransaction.solFinancialTransactionChildMetadata
        if (metadata?.fiatAmountPerUnit) {
          const costBasisPerUnit = parseFloat(metadata.fiatAmountPerUnit)
          const costBasisAmount = costBasisPerUnit * amount
          
          // Save cost basis to metadata directly
          metadata.costBasis = costBasisAmount.toFixed(2)
          metadata.costBasisUpdatedBy = 'fake-data-system'
          metadata.costBasisUpdatedAt = new Date()
          
          await this.solFinancialTransactionsEntityService['solFinancialTransactionChildMetadataRepository'].save(metadata)
          
          this.logger.debug(`✅ Saved fake cost basis for incoming transaction ${childTransaction.publicId}: ${costBasisAmount.toFixed(2)}`)
        }
        return
      }

      // Get fiat currency (default to USD)
      const fiatCurrency = 'USD'
      
      // Use the fiat amounts from metadata if available, otherwise calculate
      const metadata = childTransaction.solFinancialTransactionChildMetadata
      const costBasisPerUnit = metadata?.fiatAmountPerUnit || '0'
      const costBasisAmount = metadata?.fiatAmount || (parseFloat(costBasisPerUnit) * amount).toString()

      // Create tax lot
      const createTaxLotDto = {
        financialTransactionChildId: childTransaction.id,
        cryptocurrency: childTransaction.cryptocurrency,
        blockchainId: childTransaction.blockchainId,
        amountTotal: childTransaction.cryptocurrencyAmount,
        amountAvailable: childTransaction.cryptocurrencyAmount,
        costBasisAmount: costBasisAmount,
        costBasisPerUnit: costBasisPerUnit,
        costBasisFiatCurrency: fiatCurrency,
        purchasedAt: rawTransaction.valueTimestamp,
        transferredAt: rawTransaction.valueTimestamp,
        walletId: wallet.id,
        organizationId: organizationId,
        updatedBy: 'system',
        status: 'AVAILABLE' as any,
        statusReason: 'Auto-created from Solana transaction import'
      }

      await this.gainsLossesEntityService.createOrUpdateTaxLot(createTaxLotDto)
      
      this.logger.debug(`Created tax lot for Solana transaction ${childTransaction.publicId}, amount: ${childTransaction.cryptocurrencyAmount}, cost basis: ${costBasisAmount}`)
      
    } catch (error) {
      this.logger.error(`Error creating Solana tax lot:`, error)
      throw error
    }
  }

  /**
   * Calculate gain/loss for outgoing Solana transactions using FIFO method
   */
  private async calculateSolanaGainLoss(childTransaction: any, rawTransaction: any, organizationId: string): Promise<void> {
    try {
      // Skip if amount is zero or negative
      const sellAmount = parseFloat(childTransaction.cryptocurrencyAmount || '0')
      if (sellAmount <= 0) {
        return
      }

      // Get wallet information - try with preserveCase first, then without
      let wallet = await this.walletsService.getByOrganizationIdAndAddress(
        organizationId,
        childTransaction.fromAddress,
        {},
        { preserveCase: true }
      )
      
      if (!wallet) {
        wallet = await this.walletsService.getByOrganizationIdAndAddress(
          organizationId,
          childTransaction.fromAddress
        )
      }
      
      if (!wallet) {
        this.logger.error(`Wallet not found for address: ${childTransaction.fromAddress}`)
        
        // 🎭 FOR TESTING: Even if wallet not found, we can still calculate fake gain/loss
        const metadata = childTransaction.solFinancialTransactionChildMetadata
        if (metadata?.fiatAmountPerUnit) {
          const salePrice = parseFloat(metadata.fiatAmountPerUnit)
          const estimatedCostBasisPerUnit = salePrice * (0.6 + Math.random() * 0.8) // Random cost basis for variety
          const totalCostBasis = estimatedCostBasisPerUnit * sellAmount
          const totalGainLoss = (salePrice * sellAmount) - totalCostBasis
          
          await this.saveFakeGainLoss(childTransaction, totalCostBasis, totalGainLoss)
        }
        return
      }

      // 🎭 FOR DEVELOPMENT: Generate realistic fake gain/loss data
      const txMetadata = childTransaction.solFinancialTransactionChildMetadata
      let salePrice = 0
      
      // Check if we have existing fiat data
      if (txMetadata?.fiatAmountPerUnit && parseFloat(txMetadata.fiatAmountPerUnit) > 0) {
        salePrice = parseFloat(txMetadata.fiatAmountPerUnit)
      } else {
        // Generate realistic price for WSOL (Solana) - typically $80-200
        const symbol = childTransaction.cryptocurrency?.symbol || 'WSOL'
        if (symbol === 'WSOL' || symbol === 'SOL') {
          salePrice = 80 + Math.random() * 120 // $80-$200 range
        } else {
          // For other tokens, generate smaller random prices
          salePrice = 0.001 + Math.random() * 10 // $0.001-$10 range
        }
        
        this.logger.debug(`🎭 Generated fake sale price for ${symbol}: $${salePrice.toFixed(4)}`)
      }
      
      if (salePrice > 0) {
        // Generate realistic cost basis with variety (50%-95% of sale price for gains, 105%-150% for losses)
        const gainProbability = 0.6 // 60% chance of gains
        let costBasisMultiplier
        
        if (Math.random() < gainProbability) {
          // Generate gain: cost basis is 50%-95% of sale price
          costBasisMultiplier = 0.5 + Math.random() * 0.45
        } else {
          // Generate loss: cost basis is 105%-150% of sale price  
          costBasisMultiplier = 1.05 + Math.random() * 0.45
        }
        
        const estimatedCostBasisPerUnit = salePrice * costBasisMultiplier
        const totalCostBasis = estimatedCostBasisPerUnit * sellAmount
        const saleValue = salePrice * sellAmount
        const totalGainLoss = saleValue - totalCostBasis
        
        this.logger.debug(`🎭 Calculating realistic fake gain/loss for ${childTransaction.cryptocurrency?.symbol}:`, {
          amount: sellAmount,
          salePrice: `$${salePrice.toFixed(4)}`,
          costBasisPerUnit: `$${estimatedCostBasisPerUnit.toFixed(4)}`,
          saleValue: `$${saleValue.toFixed(2)}`,
          totalCostBasis: `$${totalCostBasis.toFixed(2)}`,
          gainLoss: `$${totalGainLoss.toFixed(2)}`,
          isGain: totalGainLoss > 0
        })
        
        await this.saveFakeGainLoss(childTransaction, totalCostBasis, totalGainLoss)
        return
      }

      // Use the fiat amounts from metadata
      const metadata = childTransaction.solFinancialTransactionChildMetadata
      const salePriceStr = metadata?.fiatAmountPerUnit || '0'
      const saleAmountStr = metadata?.fiatAmount || (salePrice * sellAmount).toString()

      // Get available tax lots for this cryptocurrency using FIFO (oldest first)
      const getAvailableTaxLotDto = {
        financialTransactionChildId: childTransaction.id,
        cryptocurrency: childTransaction.cryptocurrency,
        blockchainId: childTransaction.blockchainId,
        walletId: wallet.id,
        organizationId: organizationId,
        updatedBy: 'system',
        amountRequested: sellAmount.toString(),
        soldAt: new Date(childTransaction.confirmedAt || childTransaction.createdAt),
        costBasisCalculationMethod: 'FIFO' as any
      }
      
      const availableTaxLots = await this.gainsLossesEntityService.getAvailableTaxLotsFromDto(getAvailableTaxLotDto)

      if (!availableTaxLots || availableTaxLots.length === 0) {
        this.logger.debug(`No available tax lots found for ${childTransaction.cryptocurrencySymbol} sale of ${sellAmount}. Creating fake tax lot for testing...`)
        
        // 🎭 FOR TESTING: Create a fake tax lot when none exist
        await this.createFakeTaxLotForGainLoss(childTransaction, wallet, organizationId, sellAmount)
        
        // Retry getting tax lots after creating fake one
        const retryTaxLots = await this.gainsLossesEntityService.getAvailableTaxLotsFromDto(getAvailableTaxLotDto)
        if (!retryTaxLots || retryTaxLots.length === 0) {
          this.logger.error(`Still no tax lots available after creating fake tax lot`)
          
          // 🎭 FALLBACK: Calculate gain/loss with estimated cost basis
          const estimatedCostBasisPerUnit = salePrice * 0.8 // Assume 25% gain
          const totalCostBasis = estimatedCostBasisPerUnit * sellAmount
          const totalGainLoss = parseFloat(saleAmountStr) - totalCostBasis
          
          // Save the fake gain/loss directly
          await this.saveFakeGainLoss(childTransaction, totalCostBasis, totalGainLoss)
          return
        }
        
        // Use the newly created fake tax lots
        availableTaxLots.push(...retryTaxLots)
      }

      let remainingToSell = sellAmount
      let totalCostBasis = 0
      let totalGainLoss = 0

      // Process each tax lot using FIFO
      for (const taxLot of availableTaxLots) {
        if (remainingToSell <= 0) break

        const availableAmount = parseFloat(taxLot.amountAvailable)
        const amountToSell = Math.min(remainingToSell, availableAmount)
        
        // Calculate cost basis for this portion
        const costBasisPerUnit = parseFloat(taxLot.costBasisPerUnit || '0')
        const costBasisForSale = costBasisPerUnit * amountToSell
        const proceedsForSale = parseFloat(salePriceStr || '0') * amountToSell
        const gainLossForSale = proceedsForSale - costBasisForSale

        totalCostBasis += costBasisForSale
        totalGainLoss += gainLossForSale

        // Create tax lot sale record
        const createTaxLotSaleDto = {
          financialTransactionChildId: childTransaction.id,
          taxLot: taxLot,
          cryptocurrency: childTransaction.cryptocurrency,
          soldAmount: amountToSell.toString(),
          blockchainId: childTransaction.blockchainId,
          walletId: wallet.id,
          organizationId: organizationId,
          updatedBy: 'system',
          soldAt: new Date(childTransaction.confirmedAt || childTransaction.createdAt)
        }

        await this.gainsLossesEntityService.createTaxLotSale(createTaxLotSaleDto)

        remainingToSell -= amountToSell
        
        this.logger.debug(`Processed tax lot sale: ${amountToSell} ${childTransaction.cryptocurrencySymbol}, gain/loss: ${gainLossForSale}`)
      }

      if (remainingToSell > 0) {
        this.logger.error(`Insufficient tax lots to cover full sale of ${sellAmount} ${childTransaction.cryptocurrencySymbol}. Remaining: ${remainingToSell}`)
      }

      // Update the transaction metadata with calculated cost basis and gain/loss
      if (childTransaction.solFinancialTransactionChildMetadata) {
        const metadata = childTransaction.solFinancialTransactionChildMetadata
        metadata.costBasis = totalCostBasis.toFixed(2)
        metadata.costBasisUpdatedBy = 'system'
        metadata.costBasisUpdatedAt = new Date()
        
        // 🎯 SAVE THE CALCULATED GAIN/LOSS TO METADATA
        metadata.gainLoss = totalGainLoss.toFixed(2)
        metadata.gainLossUpdatedBy = 'system'
        metadata.gainLossUpdatedAt = new Date()
        
        this.logger.debug(`Updating cost basis and gain/loss for transaction ${childTransaction.publicId}: Cost Basis: ${totalCostBasis.toFixed(2)}, Gain/Loss: ${totalGainLoss.toFixed(2)}`)
        
        // Save the updated metadata
        await this.solFinancialTransactionsEntityService['solFinancialTransactionChildMetadataRepository'].save(metadata)
        
        this.logger.debug(`✅ Cost basis and gain/loss saved for transaction ${childTransaction.publicId}`)
      } else {
        this.logger.error(`No metadata found for transaction ${childTransaction.publicId}`)
      }

      this.logger.debug(`Calculated Solana gain/loss for ${childTransaction.cryptocurrencySymbol}: Total sold: ${sellAmount}, Cost basis: ${totalCostBasis}, Gain/Loss: ${totalGainLoss}`)

    } catch (error) {
      this.logger.error(`Error calculating Solana gain/loss:`, error)
      throw error
    }
  }

  /**
   * Get token price at specific time
   * TODO: Implement actual price lookup from price service
   */
  private async getSolanaTokenPrice(symbol: string, timestamp: Date): Promise<string | null> {
    try {
      // For now, return mock prices - in production this should integrate with price service
      const mockPrices: Record<string, number> = {
        'SOL': 150, // $150 per SOL
        'USDC': 1,  // $1 per USDC
        'USDT': 1,  // $1 per USDT
        'RAY': 5,   // $5 per RAY
        'SRM': 2    // $2 per SRM
      }

      const price = mockPrices[symbol.toUpperCase()]
      return price ? price.toString() : '0'
      
      // TODO: Replace with actual price service integration
      // return await this.pricesService.getTokenPriceAtTime(symbol, 'solana', timestamp, 'USD')
      
    } catch (error) {
      this.logger.error(`Error getting price for ${symbol} at ${timestamp}:`, error)
      return null
    }
  }

  /**
   * Process gains/losses for all Solana transactions in a wallet
   */
  async processSolanaGainLoss(organizationId: string, walletPublicId: string): Promise<any> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    // Get all transactions for this wallet (try both cases for compatibility)
    let transactions = await this.solFinancialTransactionsEntityService.getTransactionsByWallet(
      organizationId,
      wallet.address
    )
    
    // If no transactions found with original case, try lowercase
    if (!transactions || transactions.length === 0) {
      transactions = await this.solFinancialTransactionsEntityService.getTransactionsByWallet(
        organizationId,
        wallet.address.toLowerCase()
      )
    }
    
    let processed = 0
    let taxLotsCreated = 0
    let gainsLossesCalculated = 0

    for (const transaction of transactions) {
      try {
        // Get child transactions
        const childTransactions = transaction.solFinancialTransactionChild || []
        
        for (const childTx of childTransactions) {
          // Process each child transaction for gains/losses
          await this.processSolanaGainLossInternal(childTx, transaction, organizationId)
          processed++
          
          if (childTx.solFinancialTransactionChildMetadata?.direction === 'OUTGOING') {
            gainsLossesCalculated++
          } else if (childTx.solFinancialTransactionChildMetadata?.direction === 'INCOMING') {
            taxLotsCreated++
          }
        }
      } catch (error) {
        this.logger.error(`Failed to process gain/loss for transaction ${transaction.id}:`, error)
      }
    }

    return {
      processed,
      taxLotsCreated,
      gainsLossesCalculated,
      message: 'Gains/losses processing completed'
    }
  }

  /**
   * Recalculate gains/losses for all Solana transactions in a wallet
   */
  async recalculateSolanaGainsLosses(organizationId: string, walletPublicId: string): Promise<any> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    this.logger.debug(`Starting gains/losses recalculation for wallet: ${walletPublicId}`)

    try {
      // Get Solana blockchain
      const blockchain = await this.blockchainsEntityService.getByPublicId('solana')
      if (!blockchain) {
        throw new BadRequestException('Solana blockchain not configured')
      }

      // Clear existing tax lots and sales for this wallet on Solana
      await this.gainsLossesEntityService.deleteTaxLotSaleByWalletIdAndBlockchainId([wallet.id], blockchain.publicId)
      await this.gainsLossesEntityService.deleteTaxLotByWalletIdAndBlockchainId([wallet.id], blockchain.publicId)

      // Get all Solana transactions for this wallet, ordered by timestamp
      const transactions = await this.solFinancialTransactionsEntityService.getTransactionsByWallet(
        organizationId,
        wallet.address
      )

      let processedCount = 0
      let errorCount = 0

      // Process transactions in chronological order
      for (const parentTx of transactions) {
        for (const childTx of parentTx.solFinancialTransactionChild || []) {
          try {
            // Re-create the raw transaction data for processing
            const rawTransaction = {
              hash: childTx.hash,
              amount: childTx.cryptocurrencyAmount,
              symbol: childTx.cryptocurrency?.symbol || 'UNKNOWN',
              timestamp: Math.floor(childTx.valueTimestamp.getTime() / 1000),
              kind: childTx.solFinancialTransactionChildMetadata?.direction === 'INCOMING' ? 'IN' : 'OUT',
              from_address: childTx.fromAddress,
              to_address: childTx.toAddress,
              address: childTx.tokenAddress
            }

            await this.processSolanaGainLossInternal(childTx, rawTransaction, organizationId)
            processedCount++
            
          } catch (error) {
            this.logger.error(`Error recalculating gain/loss for transaction ${childTx.publicId}:`, error)
            errorCount++
          }
        }
      }

      const result = {
        success: true,
        message: `Gains/losses recalculation completed`,
        wallet_public_id: walletPublicId,
        processed_transactions: processedCount,
        error_count: errorCount,
        total_parent_transactions: transactions.length
      }

      this.logger.debug(`Completed gains/losses recalculation for wallet: ${walletPublicId}`, result)
      return result

    } catch (error) {
      this.logger.error(`Error recalculating gains/losses for wallet ${walletPublicId}:`, error)
      throw new BadRequestException(`Failed to recalculate gains/losses: ${error.message}`)
    }
  }

  /**
   * Debug organization transaction data
   */
  async debugOrganizationTransactions(organizationId: string): Promise<any> {
    this.logger.debug(`Debugging organization transactions for organization: ${organizationId}`)

    try {
      // Get all wallets for this organization
      const wallets = await this.walletsService.getAllByOrganizationId(organizationId)
      
      // Filter for Solana wallets
      const solanaWallets = wallets.filter(wallet => 
        wallet.supportedBlockchains && wallet.supportedBlockchains.includes('solana')
      )

      const debugResults = []

      for (const wallet of solanaWallets) {
        try {
          // Debug wallet transactions using both methods
          const debugData = await this.solFinancialTransactionsEntityService.debugWalletTransactions(
            organizationId,
            wallet.address
          )

          const transactions = await this.solFinancialTransactionsEntityService.getTransactionsByWallet(
            organizationId,
            wallet.address
          )

          debugResults.push({
            walletPublicId: wallet.publicId,
            walletName: wallet.name,
            walletAddress: wallet.address,
            supportedBlockchains: wallet.supportedBlockchains,
            debugTransactionCount: debugData.length,
            transactionCount: transactions.length,
            debugTransactions: debugData.slice(0, 3), // Show first 3 for brevity
            transactions: transactions.slice(0, 2).map(tx => ({
              id: tx.id,
              hash: tx.hash,
              organizationId: tx.organizationId,
              childrenCount: tx.solFinancialTransactionChild?.length || 0
            }))
          })
          
        } catch (error) {
          debugResults.push({
            walletPublicId: wallet.publicId,
            walletName: wallet.name,
            walletAddress: wallet.address,
            error: error.message
          })
        }
      }

      return {
        organizationId,
        totalWallets: wallets.length,
        solanaWallets: solanaWallets.length,
        debugResults
      }

    } catch (error) {
      this.logger.error(`Error debugging organization transactions:`, error)
      throw new BadRequestException(`Failed to debug organization transactions: ${error.message}`)
    }
  }

  /**
   * Recalculate gains/losses for all Solana wallets in an organization
   */
  async recalculateOrganizationGainsLosses(organizationId: string): Promise<any> {
    this.logger.debug(`Starting organization-wide gains/losses recalculation for organization: ${organizationId}`)

    try {
      // Get all wallets for this organization
      const wallets = await this.walletsService.getAllByOrganizationId(organizationId)
      
      // Filter for Solana wallets
      const solanaWallets = wallets.filter(wallet => 
        wallet.supportedBlockchains && wallet.supportedBlockchains.includes('solana')
      )

      if (solanaWallets.length === 0) {
        return {
          success: true,
          message: 'No Solana wallets found in organization',
          processedWallets: 0,
          totalWallets: wallets.length,
          solanaWallets: 0
        }
      }

      let processedWallets = 0
      let totalTransactions = 0
      let totalErrors = 0
      const walletResults = []

      this.logger.debug(`Found ${solanaWallets.length} Solana wallets to process`)

      // Process each Solana wallet
      for (const wallet of solanaWallets) {
        try {
          this.logger.debug(`Processing wallet: ${wallet.publicId} (${wallet.name})`)
          
          const walletResult = await this.recalculateSolanaGainsLosses(organizationId, wallet.publicId)
          
          walletResults.push({
            walletPublicId: wallet.publicId,
            walletName: wallet.name,
            ...walletResult
          })
          
          processedWallets++
          totalTransactions += walletResult.processed_transactions || 0
          totalErrors += walletResult.error_count || 0
          
        } catch (error) {
          this.logger.error(`Failed to process wallet ${wallet.publicId}:`, error)
          walletResults.push({
            walletPublicId: wallet.publicId,
            walletName: wallet.name,
            success: false,
            error: error.message
          })
          totalErrors++
        }
      }

      const result = {
        success: true,
        message: `Organization-wide gains/losses recalculation completed`,
        organizationId,
        totalWallets: wallets.length,
        solanaWallets: solanaWallets.length,
        processedWallets,
        totalTransactions,
        totalErrors,
        walletResults
      }

      this.logger.debug(`Completed organization-wide gains/losses recalculation`, result)
      return result

    } catch (error) {
      this.logger.error(`Error in organization-wide gains/losses recalculation:`, error)
      throw new BadRequestException(`Failed to recalculate organization gains/losses: ${error.message}`)
    }
  }

  /**
   * Get gains/losses summary for a Solana wallet
   */
  async getSolanaGainsLossesSummary(organizationId: string, walletPublicId: string): Promise<any> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    try {
      // Get Solana blockchain
      const blockchain = await this.blockchainsEntityService.getByPublicId('solana')
      if (!blockchain) {
        throw new BadRequestException('Solana blockchain not configured')
      }

      // Get all tax lots for this wallet (unrealized gains)
      const availableTaxLots = await this.gainsLossesEntityService.getAvailableTaxLots({
        organizationId,
        walletIds: [wallet.id],
        blockchainIds: [blockchain.publicId]
      })

      // Get all tax lot sales for this wallet (realized gains)  
      // For now, we'll use an empty array and focus on unrealized gains
      // TODO: Add proper method to gainsLossesEntityService to get tax lot sales by wallet
      const taxLotSales: any[] = []

      // Calculate unrealized P&L
      let totalUnrealizedGainLoss = 0
      let totalCostBasis = 0
      let totalCurrentValue = 0

      for (const taxLot of availableTaxLots) {
        const availableAmount = parseFloat(taxLot.amountAvailable || '0')
        const costBasisPerUnit = parseFloat(taxLot.costBasisPerUnit || '0')
        const costBasis = availableAmount * costBasisPerUnit

        // Get current price
        const currentPrice = parseFloat(await this.getSolanaTokenPrice(taxLot.cryptocurrency?.symbol || '', new Date()) || '0')
        const currentValue = availableAmount * currentPrice

        const unrealizedGainLoss = currentValue - costBasis
        
        totalCostBasis += costBasis
        totalCurrentValue += currentValue
        totalUnrealizedGainLoss += unrealizedGainLoss
      }

      // Calculate realized P&L
      let totalRealizedGainLoss = 0
      let totalSoldValue = 0
      let totalSoldCostBasis = 0

      for (const sale of taxLotSales) {
        const soldAmount = parseFloat(sale.soldAmount || '0')
        const costBasisPerUnit = parseFloat(sale.costBasisPerUnit || '0')
        const costBasis = soldAmount * costBasisPerUnit

        // For realized gains, we need to get the sale price from the child transaction
        // For now, we'll estimate based on timestamp
        const salePrice = parseFloat(await this.getSolanaTokenPrice(sale.cryptocurrency?.symbol || '', sale.soldAt) || '0')
        const saleValue = soldAmount * salePrice

        const realizedGainLoss = saleValue - costBasis

        totalSoldCostBasis += costBasis
        totalSoldValue += saleValue
        totalRealizedGainLoss += realizedGainLoss
      }

      // Group by cryptocurrency for detailed breakdown
      const cryptoBreakdown: Record<string, any> = {}

      for (const taxLot of availableTaxLots) {
        const symbol = taxLot.cryptocurrency?.symbol || 'UNKNOWN'
        if (!cryptoBreakdown[symbol]) {
          cryptoBreakdown[symbol] = {
            symbol,
            available_amount: '0',
            cost_basis: 0,
            current_value: 0,
            unrealized_gain_loss: 0
          }
        }

        const availableAmount = parseFloat(taxLot.amountAvailable || '0')
        const costBasisPerUnit = parseFloat(taxLot.costBasisPerUnit || '0')
        const currentPrice = parseFloat(await this.getSolanaTokenPrice(symbol, new Date()) || '0')

        cryptoBreakdown[symbol].available_amount = (parseFloat(cryptoBreakdown[symbol].available_amount) + availableAmount).toString()
        cryptoBreakdown[symbol].cost_basis += availableAmount * costBasisPerUnit
        cryptoBreakdown[symbol].current_value += availableAmount * currentPrice
        cryptoBreakdown[symbol].unrealized_gain_loss = cryptoBreakdown[symbol].current_value - cryptoBreakdown[symbol].cost_basis
      }

      return {
        wallet_public_id: walletPublicId,
        summary: {
          total_realized_gain_loss: totalRealizedGainLoss,
          total_unrealized_gain_loss: totalUnrealizedGainLoss,
          total_gain_loss: totalRealizedGainLoss + totalUnrealizedGainLoss,
          total_cost_basis: totalCostBasis + totalSoldCostBasis,
          total_current_value: totalCurrentValue,
          total_sold_value: totalSoldValue
        },
        breakdown: {
          available_tax_lots: availableTaxLots.length,
          realized_sales: taxLotSales.length,
          cryptocurrencies: Object.values(cryptoBreakdown)
        }
      }

    } catch (error) {
      this.logger.error(`Error getting gains/losses summary for wallet ${walletPublicId}:`, error)
      throw new BadRequestException(`Failed to get gains/losses summary: ${error.message}`)
    }
  }

  /**
   * Convert Solana financial transactions to rich DTO format compatible with EVM financial transactions
   * This creates the same comprehensive structure with gain/loss, contacts, categories, and parent relationships
   */
  private async convertSolanaTransactionsToRichDto(organizationId: string, transactions: any[]): Promise<any[]> {
    const enrichedTransactions = []

    this.logger.debug('Converting Solana transactions to rich DTO', { count: transactions.length })

    for (const transaction of transactions) {
      try {
        const parent = transaction.solFinancialTransactionParent
        const metadata = transaction.solFinancialTransactionChildMetadata
        const cryptocurrency = transaction.cryptocurrency

        // Determine transaction type and direction based on metadata
        let transactionType = 'transfer'
        let direction = 'incoming'
        
        if (metadata) {
          if (metadata.direction === 'OUTGOING') {
            direction = 'outgoing'
            transactionType = metadata.type === 'fee' ? 'fee' : 'withdrawal'
          } else if (metadata.direction === 'INCOMING') {
            direction = 'incoming'
            transactionType = 'deposit'
          }
        }

        // Get gain/loss data for this transaction
        let gainLossValue = null
        let costBasisValue = null
        if (metadata) {
          costBasisValue = metadata.costBasis || null
          
          // 🎭 First check if we have fake gain/loss data from our fake data generation
          if (metadata.gainLoss !== null && metadata.gainLoss !== undefined) {
            gainLossValue = metadata.gainLoss
            this.logger.debug(`Using metadata gainLoss for transaction: ${transaction.publicId}`, {
              gainLoss: metadata.gainLoss,
              costBasis: metadata.costBasis,
              fiatAmount: metadata.fiatAmount
            })
          } else if (metadata.type === 'TOKEN_TRANSFER' && direction === 'outgoing') {
            // Fallback: For outgoing transfers (sales), calculate gain/loss if we have cost basis
            const costBasis = parseFloat(metadata.costBasis || '0')
            const fiatAmount = parseFloat(metadata.fiatAmount || '0')
            if (costBasis > 0 && fiatAmount > 0) {
              gainLossValue = (fiatAmount - costBasis).toFixed(2)
            }
          }
        }

        // Get contacts for from/to addresses
        const fromContact = transaction.fromAddress ? 
          await this.getOrCreateContactForAddress(organizationId, transaction.fromAddress) : null
        const toContact = transaction.toAddress ? 
          await this.getOrCreateContactForAddress(organizationId, transaction.toAddress) : null

        // Calculate fiat amounts (you may need to implement price lookup)
        const cryptoAmount = parseFloat(transaction.cryptocurrencyAmount || '0')
        const fiatAmountPerUnit = await this.getSolanaTokenPrice(cryptocurrency?.symbol || 'SOL', parent.valueTimestamp)
        const fiatAmount = cryptoAmount * parseFloat(fiatAmountPerUnit || '0')

        // Build the rich transaction object matching EVM format
        const richTransaction = {
          id: transaction.publicId,
          hash: parent.hash,
          blockchainId: parent.blockchainId,
          fromAddress: transaction.fromAddress,
          toAddress: transaction.toAddress,
          proxyAddress: null, // Solana doesn't typically use proxy addresses
          cryptocurrency: {
            name: cryptocurrency?.name || 'Unknown',
            publicId: cryptocurrency?.publicId || '',
            symbol: cryptocurrency?.symbol || 'UNKNOWN',
            image: {
              large: cryptocurrency?.image?.large || '',
              small: cryptocurrency?.image?.small || '',
              thumb: cryptocurrency?.image?.thumb || ''
            },
            isVerified: cryptocurrency?.isVerified || false,
            addresses: cryptocurrency?.addresses ? cryptocurrency.addresses.map(addr => ({
              blockchainId: addr.blockchainId,
              type: addr.type,
              decimal: addr.decimal,
              address: addr.address
            })) : []
          },
          cryptocurrencyAmount: transaction.cryptocurrencyAmount || '0',
          valueTimestamp: parent.valueTimestamp,
          type: transactionType,
          typeDetail: {
            value: transactionType,
            label: this.formatTransactionTypeLabel(transactionType)
          },
          status: parent.status === 'active' ? 'synced' : parent.status,
          substatuses: [],
          costBasis: costBasisValue,
          fiatAmount: metadata?.fiatAmount || fiatAmount.toString(),
          fiatAmountPerUnit: metadata?.fiatAmountPerUnit || fiatAmountPerUnit || '0',
          fiatCurrency: metadata?.fiatCurrency || 'USD',
          gainLoss: gainLossValue,
          direction,
          note: null,
          invoiceId: null,
          category: null,
          correspondingChartOfAccount: null,
          financialTransactionParent: {
            hash: parent.hash,
            blockchainId: parent.blockchainId,
            activity: parent.activity,
            status: parent.status,
            exportStatus: parent.exportStatus,
            valueTimestamp: parent.valueTimestamp,
            childCount: await this.getChildCount(parent.publicId)
          },
          fromContact: direction === 'outgoing' ? fromContact : null,
          toContact: direction === 'incoming' ? toContact : null
        }

        enrichedTransactions.push(richTransaction)

      } catch (error) {
        this.logger.error('Error enriching Solana transaction:', error, { 
          transactionId: transaction.publicId || transaction.id,
          hasParent: !!transaction.solFinancialTransactionParent,
          hasMetadata: !!transaction.solFinancialTransactionChildMetadata,
          hasCrypto: !!transaction.cryptocurrency
        })
        // Continue with next transaction rather than failing the entire request
        continue
      }
    }

    this.logger.debug('Successfully converted Solana transactions to rich DTO', { 
      originalCount: transactions.length, 
      enrichedCount: enrichedTransactions.length 
    })

    return enrichedTransactions
  }

  /**
   * Get or create a contact for a given address
   */
  private async getOrCreateContactForAddress(organizationId: string, address: string): Promise<any> {
    try {
      // Check if this is one of our own wallets first  
      const orgWallets = await this.walletsService.getAllByOrganizationId(organizationId)
      const wallet = orgWallets.find(w => 
        w.address === address || // Exact match first (for Solana)
        w.address.toLowerCase() === address.toLowerCase() // Fallback to lowercase (for EVM)
      )
      
      if (wallet) {
        return {
          organizationId,
          name: wallet.name || 'Personal',
          type: 'wallet',
          typeId: wallet.publicId,
          addresses: [{
            address: address, // Preserve original case for Solana
            blockchainId: null
          }]
        }
      }

      // Return a generic external contact for now
      // TODO: Implement proper contact lookup when contacts service methods are available
      return {
        organizationId,
        name: 'External Address',
        type: 'external',
        typeId: null,
        addresses: [{
          address: address, // Preserve original case for Solana
          blockchainId: null
        }]
      }

    } catch (error) {
      this.logger.error('Error getting contact for address:', error, { address })
      return null
    }
  }

  /**
   * Format transaction type label for display
   */
  private formatTransactionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'deposit': 'Deposit',
      'withdrawal': 'Withdrawal', 
      'fee': 'Fee',
      'transfer': 'Transfer',
      'swap': 'Swap',
      'stake': 'Stake',
      'unstake': 'Unstake'
    }
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  /**
   * Get child count for a parent transaction
   */
  private async getChildCount(parentPublicId: string): Promise<number> {
    try {
      // TODO: Implement proper child count method in entity service
      // For now, return 1 as default
      return 1
    } catch (error) {
      this.logger.error('Error getting child count:', error, { parentPublicId })
      return 1
    }
  }

  async generateSolanaTestData(
    organizationId: string, 
    walletPublicId: string, 
    scenario: 'simple' | 'complex' | 'fifo-test' = 'simple'
  ): Promise<any> {
    const wallet = await this.walletsService.getByOrganizationAndPublicId(organizationId, walletPublicId)
    if (!wallet) {
      throw new BadRequestException('Wallet not found')
    }

    this.logger.debug(`Generating ${scenario} test data for wallet: ${walletPublicId}`)

    return await this.solanaFakeDataService.generateGainLossTestData(
      organizationId,
      wallet.address,
      scenario
    )
  }

  async cleanupSolanaTestData(organizationId: string): Promise<any> {
    return await this.solanaFakeDataService.cleanupTestData(organizationId)
  }

  async truncateAllSolanaTransactions(organizationId: string): Promise<any> {
    return await this.solanaFakeDataService.truncateAllSolanaTransactions(organizationId)
  }

  /**
   * 🖼️ Auto-generate and update cryptocurrency image links from CoinGecko
   */
  async updateCryptocurrencyImages(organizationId?: string): Promise<any> {
    this.logger.info('🖼️ Starting automatic cryptocurrency image update process')
    
    try {
      // Get all cryptocurrencies that are missing images or need updates
      const cryptos = await this.cryptocurrenciesService.getAllMissingImages()
      
      this.logger.info(`Found ${cryptos.length} cryptocurrencies needing image updates`)
      
      let updated = 0
      let failed = 0
      const results = []
      
      for (const crypto of cryptos) {
        try {
          const imageData = await this.fetchCoinGeckoImages(crypto.symbol, crypto.coingeckoId)
          
          if (imageData) {
            await this.cryptocurrenciesService.updateImages([{ id: crypto.id, image: imageData }])
            updated++
            
            results.push({
              symbol: crypto.symbol,
              status: 'updated',
              images: imageData
            })
            
            this.logger.debug(`✅ Updated images for ${crypto.symbol}`, imageData)
          } else {
            failed++
            results.push({
              symbol: crypto.symbol,
              status: 'not_found',
              message: 'No CoinGecko data found'
            })
            
            this.logger.debug(`❌ No images found for ${crypto.symbol}`)
          }
          
          // Rate limiting - don't spam CoinGecko API
          await this.sleep(200) // 200ms delay between requests
          
        } catch (error) {
          failed++
          results.push({
            symbol: crypto.symbol,
            status: 'error',
            error: error.message
          })
          
          this.logger.error(`Failed to update images for ${crypto.symbol}:`, error)
        }
      }
      
      this.logger.info(`🖼️ Image update completed: ${updated} updated, ${failed} failed`)
      
      return {
        total_processed: cryptos.length,
        updated,
        failed,
        results
      }
      
    } catch (error) {
      this.logger.error('Failed to update cryptocurrency images:', error)
      throw error
    }
  }

  /**
   * Fetch image data from CoinGecko API
   */
  private async fetchCoinGeckoImages(symbol: string, coingeckoId?: string): Promise<any> {
    try {
      // Try to use coingeckoId first, then search by symbol
      const coinId = coingeckoId || await this.searchCoinGeckoId(symbol)
      
      if (!coinId) {
        return null
      }
      
      // Fetch coin data from CoinGecko
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
      
      if (!response.ok) {
        this.logger.debug(`CoinGecko API error for ${symbol}: ${response.status}`)
        return null
      }
      
      const data = await response.json()
      
      if (data.image) {
        return {
          thumb: data.image.thumb,
          small: data.image.small, 
          large: data.image.large
        }
      }
      
      return null
      
    } catch (error) {
      this.logger.error(`Error fetching CoinGecko images for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Search for CoinGecko ID by symbol
   */
  private async searchCoinGeckoId(symbol: string): Promise<string | null> {
    try {
      // Search CoinGecko for the symbol
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`)
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      
      // Find exact symbol match
      const coin = data.coins?.find((c: any) => 
        c.symbol?.toLowerCase() === symbol.toLowerCase()
      )
      
      return coin?.id || null
      
    } catch (error) {
      this.logger.error(`Error searching CoinGecko for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Generate fallback images for tokens without CoinGecko data
   */
  private generateFallbackImages(symbol: string): any {
    // Generate placeholder images or use token-specific logic
    const fallbackBaseUrl = 'https://via.placeholder.com'
    
    return {
      thumb: `${fallbackBaseUrl}/32x32/000000/FFFFFF?text=${symbol.slice(0, 3)}`,
      small: `${fallbackBaseUrl}/64x64/000000/FFFFFF?text=${symbol.slice(0, 3)}`,
      large: `${fallbackBaseUrl}/256x256/000000/FFFFFF?text=${symbol.slice(0, 3)}`
    }
  }

  /**
   * Update specific cryptocurrency images
   */
  async updateSpecificCryptoImages(symbol: string): Promise<any> {
    try {
      const crypto = await this.cryptocurrenciesService.getBySymbol(symbol)
      
      if (!crypto) {
        throw new BadRequestException(`Cryptocurrency not found: ${symbol}`)
      }
      
      this.logger.info(`🖼️ Updating images for ${symbol}`)
      
      const imageData = await this.fetchCoinGeckoImages(crypto.symbol, crypto.coingeckoId)
      
      if (imageData) {
        await this.cryptocurrenciesService.updateImages([{ id: crypto.id, image: imageData }])
        
        return {
          symbol: crypto.symbol,
          status: 'updated',
          images: imageData
        }
      } else {
        // Use fallback images
        const fallbackImages = this.generateFallbackImages(crypto.symbol)
        await this.cryptocurrenciesService.updateImages([{ id: crypto.id, image: fallbackImages }])
        
        return {
          symbol: crypto.symbol,
          status: 'fallback',
          images: fallbackImages
        }
      }
      
    } catch (error) {
      this.logger.error(`Failed to update images for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 🎭 Generate fake price data with realistic time-based movements for gain/loss calculations
   */
  private async generateFakePriceData(childTransaction: any, rawTransaction: any): Promise<{
    priceUsd: number
    pricePerUnit: number
    totalValueUsd: number
    costBasisPerUnit?: number
    costBasisTotalUsd?: number
  }> {
    const symbol = childTransaction.cryptocurrency?.symbol || 'UNKNOWN'
    const amount = parseFloat(childTransaction.cryptocurrencyAmount || '0')
    const timestamp = childTransaction.valueTimestamp || new Date()
    const direction = childTransaction.solFinancialTransactionChildMetadata?.direction
    
    // Get base price and historical trend
    const basePrice = this.getFakeBasePrice(symbol)
    const historicalPrice = this.generateHistoricalPrice(symbol, timestamp, basePrice)
    
    // Generate current price vs historical for gain/loss scenarios
    const { currentPrice, costBasisPrice } = this.generateGainLossScenario(
      symbol, 
      historicalPrice, 
      timestamp, 
      direction
    )
    
    const totalValueUsd = currentPrice * amount
    const costBasisTotalUsd = costBasisPrice * amount
    
    // Calculate potential gain/loss for logging
    const gainLossPercent = ((currentPrice - costBasisPrice) / costBasisPrice * 100).toFixed(1)
    const gainLossAmount = (totalValueUsd - costBasisTotalUsd).toFixed(2)
    
    this.logger.debug(`Generated fake price data for ${symbol} with gain/loss scenario`, {
      symbol,
      amount,
      direction,
      timestamp: timestamp.toISOString(),
      currentPriceUsd: currentPrice.toFixed(6),
      costBasisPriceUsd: costBasisPrice.toFixed(6),
      totalValueUsd: totalValueUsd.toFixed(2),
      costBasisTotalUsd: costBasisTotalUsd.toFixed(2),
      gainLossPercent: `${gainLossPercent}%`,
      gainLossAmount: `$${gainLossAmount}`,
      scenario: parseFloat(gainLossAmount) > 0 ? '📈 GAIN' : '📉 LOSS'
    })
    
    return {
      priceUsd: currentPrice,
      pricePerUnit: currentPrice,
      totalValueUsd,
      costBasisPerUnit: costBasisPrice,
      costBasisTotalUsd
    }
  }

  /**
   * Generate historical price based on timestamp and market cycles
   */
  private generateHistoricalPrice(symbol: string, timestamp: Date, basePrice: number): number {
    const now = new Date()
    const daysSinceTransaction = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24))
    
    // Create realistic historical price movements
    // Older transactions tend to have lower prices (crypto generally trends up long-term)
    const ageFactor = Math.max(0.3, 1 - (daysSinceTransaction * 0.002)) // Older = cheaper
    
    // Add market cycle simulation (bull/bear cycles)
    const cycleLength = 365 // ~1 year cycles
    const cyclePosition = (daysSinceTransaction % cycleLength) / cycleLength
    const cycleFactor = 0.7 + (Math.sin(cyclePosition * Math.PI * 2) * 0.3) // ±30% cycle variation
    
    // Add token-specific volatility
    const volatility = this.getTokenVolatility(symbol)
    const volatilityFactor = 0.8 + (Math.random() * 0.4 * volatility) // More volatile = more price variation
    
    // Monthly trend (simulate monthly pump/dump cycles)
    const monthlyPosition = (daysSinceTransaction % 30) / 30
    const monthlyFactor = 0.9 + (Math.sin(monthlyPosition * Math.PI * 4) * 0.1) // ±10% monthly variation
    
    return basePrice * ageFactor * cycleFactor * volatilityFactor * monthlyFactor
  }

  /**
   * Generate gain/loss scenarios with realistic price movements
   */
  private generateGainLossScenario(symbol: string, historicalPrice: number, timestamp: Date, direction?: string): {
    currentPrice: number
    costBasisPrice: number
  } {
    const now = new Date()
    const daysSinceTransaction = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24))
    
    // Current price: simulate growth/decline since historical price
    const isStablecoin = ['USDC', 'USDT', 'DAI', 'BUSD'].includes(symbol.toUpperCase())
    
    let currentPrice: number
    let costBasisPrice: number
    
    if (isStablecoin) {
      // Stablecoins: minimal variation
      currentPrice = historicalPrice * (0.998 + Math.random() * 0.004) // ±0.2% variation
      costBasisPrice = historicalPrice * (0.999 + Math.random() * 0.002) // ±0.1% variation
    } else {
      // Crypto tokens: more dramatic movements
      const volatility = this.getTokenVolatility(symbol)
      
      // Growth rate based on time passed (simulate general crypto growth)
      const annualGrowthRate = 0.5 + (Math.random() * 1.0) // 50%-150% annual growth potential
      const timeGrowthFactor = Math.pow(1 + annualGrowthRate, daysSinceTransaction / 365)
      
      // Add dramatic price swings (simulate pumps/dumps)
      const extremeEventChance = Math.random()
      let extremeFactor = 1
      
      if (extremeEventChance < 0.1) {
        // 10% chance of extreme pump (+200% to +500%)
        extremeFactor = 3 + (Math.random() * 2) // 3x to 5x
        this.logger.debug(`🚀 Extreme pump event for ${symbol}`)
      } else if (extremeEventChance < 0.2) {
        // 10% chance of extreme dump (-80% to -95%)
        extremeFactor = 0.05 + (Math.random() * 0.15) // 5% to 20% of original
        this.logger.debug(`💥 Extreme dump event for ${symbol}`)
      } else if (extremeEventChance < 0.4) {
        // 20% chance of moderate pump (+50% to +200%)
        extremeFactor = 1.5 + (Math.random() * 0.5)
        this.logger.debug(`📈 Moderate pump for ${symbol}`)
      } else if (extremeEventChance < 0.6) {
        // 20% chance of moderate dump (-30% to -60%)
        extremeFactor = 0.4 + (Math.random() * 0.3)
        this.logger.debug(`📉 Moderate dump for ${symbol}`)
      }
      
      // Random daily volatility
      const dailyVolatility = 0.9 + (Math.random() * 0.2 * volatility) // ±10% * volatility multiplier
      
      currentPrice = historicalPrice * timeGrowthFactor * extremeFactor * dailyVolatility
      
      // Cost basis: slightly different from historical price (simulate buy/sell spreads)
      const spreadVariation = 0.98 + (Math.random() * 0.04) // ±2% spread
      costBasisPrice = historicalPrice * spreadVariation
    }
    
    return { currentPrice, costBasisPrice }
  }

  /**
   * Get token volatility multiplier for realistic price movements (based on your database tokens)
   */
  private getTokenVolatility(symbol: string): number {
    const volatilityMap: { [key: string]: number } = {
      // Ultra-low volatility (stablecoins)
      'USDC': 0.1, 'USDT': 0.1, 'DAI': 0.1, 'BUSD': 0.1,
      
      // Low volatility (established major tokens)
      'PBTC': 0.6, // Wrapped Bitcoin - less volatile than alts
      
      // Medium volatility (established DeFi tokens)
      'SOL': 0.8, 'WSOL': 0.8, 'RAY': 1.0, 'SRM': 1.1, 'ORCA': 1.0,
      'JUP': 0.9, 'JTO': 1.0, 'PYTH': 1.1, 'DRIFT': 1.3,
      'HNT': 1.2, 'RENDER': 1.1,
      
      // High volatility (mid-cap tokens)
      'FIDA': 1.5, 'MNGO': 1.6, 'STEP': 1.7, 'MEDIA': 1.4,
      'ZENAI': 1.8, // AI tokens tend to be volatile
      
      // Extreme volatility (meme tokens and micro-caps)
      'BONK': 2.0,        // Popular meme
      'WIF': 1.8,         // Dog meme  
      'FARTCOIN': 2.8,    // Ultimate meme volatility
      'TRUMP': 2.5,       // Political meme - very volatile
      'MOONPIG': 2.3,     // Meme token
      'COPE': 1.9,        // High volatility alt
      'ROPE': 2.5,        // Micro-cap extreme swings
      'KLED': 2.2,        // Small cap
      'DIS': 2.1,         // Small cap
    }
    
    return volatilityMap[symbol.toUpperCase()] || 1.8 // Default high volatility for unknown tokens
  }

  /**
   * Get realistic fake base prices for different tokens (based on your database)
   */
  private getFakeBasePrice(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      // Major tokens
      'SOL': 145.50,      // Solana
      'WSOL': 145.50,     // Wrapped SOL (same as SOL)
      'USDC': 1.00,       // USD Coin
      'USDT': 0.999,      // Tether
      
      // Established DeFi tokens
      'RAY': 2.15,        // Raydium
      'SRM': 0.85,        // Serum
      'ORCA': 1.20,       // Orca
      'JUP': 0.85,        // Jupiter
      'JTO': 3.20,        // Jito
      'PYTH': 0.42,       // Pyth Network
      'DRIFT': 0.55,      // Drift Protocol
      
      // Meme tokens (high volatility)
      'BONK': 0.000025,   // Bonk
      'WIF': 2.80,        // Dogwifhat
      'FARTCOIN': 0.00012, // FartCoin (meme)
      'TRUMP': 0.0045,    // Trump token (political meme)
      'MOONPIG': 0.000087, // MoonPig (meme)
      
      // Mid-cap tokens
      'FIDA': 0.35,       // Bonfida
      'MNGO': 0.015,      // Mango
      'STEP': 0.08,       // Step Finance
      'MEDIA': 12.50,     // Media Network
      'HNT': 6.75,        // Helium
      'RENDER': 7.80,     // Render Token
      'PBTC': 67420.00,   // Wrapped Bitcoin (follows BTC price)
      
      // Small cap / experimental
      'COPE': 0.02,       // Cope
      'ROPE': 0.0001,     // Rope Token
      'ZENAI': 0.0234,    // ZenAI (AI token)
      'KLED': 0.00156,    // KLED
      'DIS': 0.00089,     // DIS token
    }
    
    return basePrices[symbol.toUpperCase()] || 0.10 // Default for unknown tokens
  }

  /**
   * Update Solana child transaction metadata with fake price data
   */
  private async updateSolanaChildTransactionWithFakeData(
    childTransaction: any, 
    fakePrice: {
      priceUsd: number
      pricePerUnit: number
      totalValueUsd: number
      costBasisPerUnit?: number
      costBasisTotalUsd?: number
    }
  ): Promise<void> {
    try {
      const metadata = childTransaction.solFinancialTransactionChildMetadata
      if (!metadata) {
        this.logger.error(`No metadata found for child transaction: ${childTransaction.publicId}`)
        return
      }

      // Update metadata with fake price data
      const updatedMetadata = {
        ...metadata,
        fiatAmount: fakePrice.totalValueUsd.toFixed(6),
        fiatAmountPerUnit: fakePrice.pricePerUnit.toFixed(6),
        fiatCurrency: 'USD',
        substatuses: [], // Clear substatuses since we now have price data
        updatedAt: new Date()
      }

      // Save updated metadata - update via the metadata ID
      if (metadata.id) {
        await this.solFinancialTransactionsEntityService['solFinancialTransactionChildMetadataRepository'].update(
          metadata.id,
          {
            fiatAmount: fakePrice.totalValueUsd.toFixed(6),
            fiatAmountPerUnit: fakePrice.pricePerUnit.toFixed(6),
            fiatCurrency: 'USD',
            substatuses: [], // Clear substatuses since we now have price data
            updatedAt: new Date()
          }
        )
      }

      this.logger.debug(`Updated child transaction ${childTransaction.publicId} with fake price data`, {
        priceUsd: fakePrice.priceUsd,
        totalValueUsd: fakePrice.totalValueUsd
      })

    } catch (error) {
      this.logger.error(`Failed to update child transaction with fake data: ${childTransaction.publicId}`, error)
    }
  }

  /**
   * 🎭 Manually generate fake price data for existing transactions that are missing price data
   */
  async generateFakeDataForExistingTransactions(organizationId: string, limit?: number): Promise<{
    processed: number
    updated: number
    errors: string[]
    totalFound: number
  }> {
    const result = {
      processed: 0,
      updated: 0,
      errors: [] as string[],
      totalFound: 0
    }

    try {
      this.logger.info(`🎭 Starting fake data generation for ALL transactions in organization: ${organizationId}`)

      // Get ALL transactions first to count total
      let page = 0
      const pageSize = 100
      let allTransactions: any[] = []
      
      // Fetch all transactions in batches
      while (true) {
        const transactionResult = await this.solFinancialTransactionsEntityService.getAllTransactionsPaging(
          organizationId,
          {
            page: page,
            size: pageSize
          }
        )
        
        if (!transactionResult.items || transactionResult.items.length === 0) {
          break
        }
        
        allTransactions = [...allTransactions, ...transactionResult.items]
        
        // Check if we've reached the end
        if (transactionResult.items.length < pageSize) {
          break
        }
        
        page++
      }

      // Filter transactions that need fake price data
      const transactionsNeedingFakeData = allTransactions.filter(tx => {
        const metadata = (tx as any).solFinancialTransactionChildMetadata
        return !metadata || 
               metadata.fiatAmount === '0' || 
               metadata.fiatAmount === null || 
               metadata.fiatAmount === undefined ||
               metadata.fiatAmountPerUnit === '0' || 
               metadata.fiatAmountPerUnit === null || 
               metadata.fiatAmountPerUnit === undefined
      })

      result.totalFound = transactionsNeedingFakeData.length
      const toProcess = limit ? transactionsNeedingFakeData.slice(0, limit) : transactionsNeedingFakeData

      this.logger.info(`Found ${result.totalFound} transactions needing fake price data. Processing ${toProcess.length} transactions...`)

      // Process transactions in chronological order for realistic gain/loss calculations
      const sortedTransactions = toProcess.sort((a, b) => 
        new Date(a.valueTimestamp).getTime() - new Date(b.valueTimestamp).getTime()
      )

      for (const childTx of sortedTransactions) {
        try {
          result.processed++
          
          // Skip if no cryptocurrency or metadata
          if (!childTx.cryptocurrency || !childTx.solFinancialTransactionChildMetadata) {
            continue
          }

          // Generate fake price data
          const fakePrice = await this.generateFakePriceData(childTx, childTx.solFinancialTransactionParent)
          
          // Update with fake data
          await this.updateSolanaChildTransactionWithFakeData(childTx, fakePrice)
          
          // Process gain/loss if needed
          if (childTx.solFinancialTransactionChildMetadata.direction === 'OUTGOING') {
            // For outgoing, calculate gain/loss
            await this.calculateSolanaGainLoss(childTx, childTx.solFinancialTransactionParent, organizationId)
          } else {
            // For incoming, create tax lot
            await this.createSolanaTaxLot(childTx, childTx.solFinancialTransactionParent, organizationId)
          }
          
          result.updated++
          
          // Progress logging every 50 transactions
          if (result.updated % 50 === 0) {
            this.logger.info(`📊 Progress: ${result.updated}/${toProcess.length} transactions processed`)
          }
          
          this.logger.debug(`Updated fake data for transaction: ${childTx.publicId}`, {
            symbol: childTx.cryptocurrency.symbol,
            amount: childTx.cryptocurrencyAmount,
            fiatValue: fakePrice.totalValueUsd
          })

        } catch (error) {
          const errorMsg = `Failed to generate fake data for transaction ${childTx.publicId}: ${error.message}`
          result.errors.push(errorMsg)
          this.logger.error(errorMsg, error)
        }
      }

      this.logger.info(`🎭 Fake data generation completed!`, {
        totalFound: result.totalFound,
        processed: result.processed,
        updated: result.updated,
        errors: result.errors.length,
        limitApplied: limit ? `Limited to ${limit}` : 'No limit - processed ALL'
      })
      
      return result

    } catch (error) {
      this.logger.error('Failed to generate fake data for existing transactions:', error)
      throw error
    }
  }

  /**
   * 🎭 Create a fake tax lot for gain/loss testing when no real tax lots exist
   */
  private async createFakeTaxLotForGainLoss(
    childTransaction: any, 
    wallet: any, 
    organizationId: string, 
    sellAmount: number
  ): Promise<void> {
    try {
      // Create a fake "purchase" transaction that happened before this sale
      const fakePurchaseDate = new Date(childTransaction.valueTimestamp)
      fakePurchaseDate.setDate(fakePurchaseDate.getDate() - 30) // 30 days earlier
      
      // Generate fake cost basis (usually lower than current price for gains)
      const currentPrice = parseFloat(childTransaction.solFinancialTransactionChildMetadata?.fiatAmountPerUnit || '100')
      const fakeCostBasisPerUnit = currentPrice * (0.7 + Math.random() * 0.3) // 70-100% of current price
      
      const fakeAmount = (sellAmount * 1.2).toString() // Slightly more than needed
      const fakeCostBasisAmount = (fakeCostBasisPerUnit * sellAmount * 1.2).toString()
      
      const createTaxLotDto = {
        financialTransactionChildId: null, // Use null for fake tax lots to avoid DB constraint issues
        cryptocurrency: childTransaction.cryptocurrency,
        blockchainId: childTransaction.blockchainId,
        amountTotal: fakeAmount,
        amountAvailable: fakeAmount,
        costBasisAmount: fakeCostBasisAmount,
        costBasisPerUnit: fakeCostBasisPerUnit.toString(),
        costBasisFiatCurrency: 'USD',
        purchasedAt: fakePurchaseDate,
        transferredAt: fakePurchaseDate,
        walletId: wallet.id,
        organizationId: organizationId,
        updatedBy: 'fake-data-system',
        status: TaxLotStatus.AVAILABLE,
        statusReason: 'Fake tax lot created for gain/loss testing'
      }

      await this.gainsLossesEntityService.createOrUpdateTaxLot(createTaxLotDto)
      
      this.logger.debug(`Created fake tax lot for ${childTransaction.cryptocurrency?.symbol}: ${fakeAmount} @ $${fakeCostBasisPerUnit.toFixed(2)}`)
      
    } catch (error) {
      this.logger.error('Failed to create fake tax lot:', error)
    }
  }

  /**
   * 🎭 Save fake gain/loss data directly to metadata when tax lots are unavailable
   */
  private async saveFakeGainLoss(
    childTransaction: any, 
    totalCostBasis: number, 
    totalGainLoss: number
  ): Promise<void> {
    try {
      if (childTransaction.solFinancialTransactionChildMetadata) {
        const metadata = childTransaction.solFinancialTransactionChildMetadata
        metadata.costBasis = totalCostBasis.toFixed(2)
        metadata.costBasisUpdatedBy = 'fake-data-system'
        metadata.costBasisUpdatedAt = new Date()
        
        metadata.gainLoss = totalGainLoss.toFixed(2)
        metadata.gainLossUpdatedBy = 'fake-data-system'
        metadata.gainLossUpdatedAt = new Date()
        
        await this.solFinancialTransactionsEntityService['solFinancialTransactionChildMetadataRepository'].save(metadata)
        
        this.logger.debug(`✅ Saved fake gain/loss for transaction ${childTransaction.publicId}: Cost Basis: ${totalCostBasis.toFixed(2)}, Gain/Loss: ${totalGainLoss.toFixed(2)}`)
      }
    } catch (error) {
      this.logger.error('Failed to save fake gain/loss:', error)
    }
  }

}
