import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { TaskStatusEnum } from '../../core/events/event-types'
import { FilesService } from '../../files/files.service'
import { FinancialTransactionChildAnnotation } from '../../shared/entity-services/annotations/resource-annotations/financial-transaction-child-annotations.entity'
import { FinancialTransactionChildAnnotationEntityService } from '../../shared/entity-services/annotations/resource-annotations/financial-transaction-child-annotations.entity-service'
import { ChartOfAccount } from '../../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { CoreTransformationTask } from '../../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity'
import { CoreTransformationTasksEntityService } from '../../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity-service'
import { CryptoWrappedMapping } from '../../shared/entity-services/crypto-wrapped-mappings/crypto-wrapped-mapping.entity'
import { CryptoWrappedMappingsEntityService } from '../../shared/entity-services/crypto-wrapped-mappings/crypto-wrapped-mappings.entity.service'
import { FinancialTransactionChildMetadata } from '../../shared/entity-services/financial-transactions/financial-transaction-child-metadata.entity'
import { FinancialTransactionChild } from '../../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { FinancialTransactionFile } from '../../shared/entity-services/financial-transactions/financial-transaction-files.entity'
import { FinancialTransactionPreprocess } from '../../shared/entity-services/financial-transactions/financial-transaction-preprocess.entity'
import { FinancialTransactionsEntityService } from '../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import {
  CreateFinancialTransactionChildDto,
  CreateFinancialTransactionParentDto,
  FinancialTransactionChildMetadataStatus,
  FinancialTransactionChildMetadataType,
  FinancialTransactionParentStatus,
  FinancialTransactionPreprocessSpecialAccount,
  FinancialTransactionPreprocessStatus,
  GainLossInclusionStatus
} from '../../shared/entity-services/financial-transactions/interfaces'
import { OrganizationsEntityService } from '../../shared/entity-services/organizations/organizations.entity-service'
import { PreprocessRawTasksEntityService } from '../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { Wallet } from '../../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../../shared/logger/logger.service'
import { GainLossInternalActivitiesGroup } from './interface'

@Injectable()
export class CoreTransformationsDomainService {
  readonly BATCH_SIZE: number = 500
  readonly MAX_LIST_SIZE: number = this.BATCH_SIZE * 4

  constructor(
    private coreTransformationTasksService: CoreTransformationTasksEntityService,
    private preprocessRawTasksService: PreprocessRawTasksEntityService,
    private financialTransactionsService: FinancialTransactionsEntityService,
    private filesService: FilesService,
    private walletsService: WalletsEntityService,
    private organizationsService: OrganizationsEntityService,
    private cryptoWrappedMappingsEntityService: CryptoWrappedMappingsEntityService,
    private financialTransactionChildAnnotationEntityService: FinancialTransactionChildAnnotationEntityService,
    private logger: LoggerService
  ) {}

  async executeWorkflow(task: CoreTransformationTask) {
    const preprocessRawTask = task.metadata.preprocessRawTaskId
      ? await this.preprocessRawTasksService.get(task.metadata.preprocessRawTaskId)
      : null

    if (!preprocessRawTask || preprocessRawTask.status === TaskStatusEnum.COMPLETED) {
      await this.coreTransformationTasksService.updateFirstExecutedAt(task)

      let skip = 0
      let preprocessList: FinancialTransactionPreprocess[] = []
      const startingId = task.metadata.lastCompletedFinancialTransactionPreprocessId
      let lastCompletedFinancialTransactionPreprocessId =
        task.metadata.lastCompletedFinancialTransactionPreprocessId ?? '0'

      do {
        preprocessList = await this.getPreprocessEntities({
          task,
          startingId,
          skip
        })

        if (preprocessList?.length > 0) {
          const distinctHashes: Set<string> = new Set<string>()
          for (const preprocess of preprocessList) {
            distinctHashes.add(preprocess.hash)
            if (new Decimal(preprocess.id).greaterThan(lastCompletedFinancialTransactionPreprocessId)) {
              lastCompletedFinancialTransactionPreprocessId = preprocess.id
            }
          }

          const currentWallet = await this.walletsService.getByOrganizationIdAndAddress(
            task.organizationId,
            task.address,
            {
              walletGroup: true
            }
          )
          const organizationWalletsMap = await this.walletsService.getAllByOrganizationIdGroupedByAddress(
            task.organizationId,
            {
              walletGroup: true
            }
          )
          organizationWalletsMap?.delete(currentWallet.address)

          const cryptoWrappedMapping = await this.cryptoWrappedMappingsEntityService.getAll()

          for (const hash of distinctHashes) {
            const preprocessTransactions = await this.financialTransactionsService.getPreprocessTransactionsByHash(
              hash,
              FinancialTransactionPreprocessStatus.COMPLETED
            )

            const childTransactionDtos = await this.createFinancialTransactionDtos(
              preprocessTransactions,
              task.address,
              task.organizationId,
              currentWallet,
              organizationWalletsMap,
              cryptoWrappedMapping
            )

            await this.createOrMigrateFinancialTransaction(
              childTransactionDtos,
              hash,
              task.address,
              task.organizationId,
              task.blockchainId
            )

            await this.coreTransformationTasksService.updateLastExecutedAt(task.id)
          }

          skip += preprocessList.length
        }
      } while (preprocessList.length)

      await this.coreTransformationTasksService.updateMetadata(task.id, {
        ...task.metadata,
        lastCompletedFinancialTransactionPreprocessId: lastCompletedFinancialTransactionPreprocessId
      })

      await this.coreTransformationTasksService.changeStatus(task.id, TaskStatusEnum.COMPLETED)
    }
  }

  private async getPreprocessEntities(params: { task: CoreTransformationTask; startingId: string; skip: number }) {
    const preprocessList = await this.financialTransactionsService.getPreprocessHashesByAddressAndChainAndStatus({
      address: params.task.address,
      blockchainId: params.task.blockchainId,
      status: FinancialTransactionPreprocessStatus.COMPLETED,
      startingId: params.startingId,
      skip: params.skip,
      take: this.BATCH_SIZE
    })

    let finalResult: FinancialTransactionPreprocess[] = [...preprocessList]
    if (finalResult.length >= this.BATCH_SIZE) {
      // If the last hash is the same as the first hash, then there are more to be fetched
      const firstHash = finalResult[0].hash
      let nextBatchSkip = this.BATCH_SIZE
      while (finalResult[finalResult.length - 1].hash === firstHash) {
        if (finalResult.length >= this.MAX_LIST_SIZE) {
          // Less likely to happen, but just in case
          throw new Error('Too many transactions to process')
        }
        const nextBatch = await this.financialTransactionsService.getPreprocessHashesByAddressAndChainAndStatus({
          address: params.task.address,
          blockchainId: params.task.blockchainId,
          status: FinancialTransactionPreprocessStatus.COMPLETED,
          startingId: params.startingId,
          skip: params.skip + nextBatchSkip,
          take: this.BATCH_SIZE
        })
        nextBatchSkip += this.BATCH_SIZE
        finalResult = [...finalResult, ...nextBatch]
      }
    }

    if (finalResult.length >= this.BATCH_SIZE) {
      //trim the last hash because there might be more in the next page and they all need to be processed together
      const lastPreprocess = finalResult.pop()
      while (finalResult.at(-1).hash === lastPreprocess.hash) {
        finalResult.pop()
      }
    }

    return finalResult
  }

  async createFinancialTransactionDtos(
    financialTransactionPreprocessList: FinancialTransactionPreprocess[],
    address: string,
    organizationId: string,
    currentWallet: Wallet,
    organizationWalletsMap: Map<string, Wallet>,
    cryptoWrappedMapping: CryptoWrappedMapping[]
  ) {
    let childTransactionDtos: CreateFinancialTransactionChildDto[] = []

    // Split into the different cryptocurrency
    const cryptocurrencyMap: { [cryptocurrencyId: string]: FinancialTransactionPreprocess[] } = {}

    for (const preprocess of financialTransactionPreprocessList) {
      if (!cryptocurrencyMap[preprocess.cryptocurrency.id]) {
        cryptocurrencyMap[preprocess.cryptocurrency.id] = []
      }

      cryptocurrencyMap[preprocess.cryptocurrency.id].push(preprocess)
    }

    const preprocessSpecialAccount: string[] = Object.values(FinancialTransactionPreprocessSpecialAccount)

    for (const [cryptocurrencyId, preprocessGroupByCryptocurrencyList] of Object.entries(cryptocurrencyMap)) {
      const tempResults: CreateFinancialTransactionChildDto[] = []
      const opposingResults: CreateFinancialTransactionChildDto[] = []

      for (const preprocessGroupedByCryptocurrency of preprocessGroupByCryptocurrencyList) {
        try {
          let from = preprocessGroupedByCryptocurrency.fromAddress
          const to = preprocessGroupedByCryptocurrency.toAddress
          let proxy = null
          let type = null
          const amount = preprocessGroupedByCryptocurrency.cryptocurrencyAmount
          let gainLossInclusionStatus = null

          // For edge case where the from and to are the same address. https://etherscan.io/tx/0x3adf80e9b174cbe229b3a3ecc796dbe588b7388a2fc83a97d86ff9b51529fc00
          if (from === to) {
            type = FinancialTransactionChildMetadataType.DEPOSIT
            gainLossInclusionStatus = GainLossInclusionStatus.INTERNAL

            const opposingResult: CreateFinancialTransactionChildDto = {
              publicId: preprocessGroupedByCryptocurrency.uniqueId,
              hash: preprocessGroupedByCryptocurrency.hash,
              blockchainId: preprocessGroupedByCryptocurrency.blockchainId,
              type: FinancialTransactionChildMetadataType.WITHDRAWAL,
              direction: null,
              fromAddress: from,
              toAddress: to,
              proxyAddress: proxy,
              cryptocurrency: preprocessGroupedByCryptocurrency.cryptocurrency,
              cryptocurrencyAmount: amount.toString(),
              valueTimestamp: preprocessGroupedByCryptocurrency.valueTimestamp,
              status: FinancialTransactionChildMetadataStatus.SYNCING,
              organizationId: organizationId,
              financialTransactionParent: null,
              gainLossInclusionStatus: gainLossInclusionStatus
            }

            opposingResults.push(opposingResult)
          } else if (!preprocessSpecialAccount.includes(to)) {
            let indexToRemove = -1

            for (let i = 0; i < tempResults.length; i++) {
              const previousResult = tempResults[i]

              if (previousResult.toAddress === from) {
                const leftover = Decimal.sub(previousResult.cryptocurrencyAmount, amount)
                if (leftover.greaterThanOrEqualTo(0)) {
                  proxy = previousResult.toAddress
                  from = previousResult.fromAddress

                  // For edge case where the money is returned back to the user. https://etherscan.io/tx/0x7b2543c88e1305e3968f6da36147619bf2e6f410fdda316fa15ebdc4bbbdca4c
                  if (previousResult.toAddress === previousResult.fromAddress) {
                    continue
                  }

                  if (from === to) {
                    type = FinancialTransactionChildMetadataType.DEPOSIT
                    gainLossInclusionStatus = GainLossInclusionStatus.INTERNAL

                    // Need to be different than the original one. w is not is hexadecimal range. the last character will be overwritten later
                    const modifiedUniqueId = preprocessGroupedByCryptocurrency.uniqueId.slice(0, 30).concat('ww')

                    const opposingIndex = opposingResults.findIndex(
                      (temp) =>
                        temp.publicId === modifiedUniqueId &&
                        temp.type === FinancialTransactionChildMetadataType.WITHDRAWAL
                    )

                    const hackExist = opposingIndex !== -1 ? opposingResults.splice(opposingIndex, 1) : null

                    if (hackExist?.at(0)) {
                      hackExist.at(0).cryptocurrencyAmount = Decimal.add(
                        hackExist.at(0).cryptocurrencyAmount,
                        amount
                      ).toString()

                      opposingResults.push(hackExist[0])
                    } else {
                      const opposingResult: CreateFinancialTransactionChildDto = { ...previousResult }
                      opposingResult.type = FinancialTransactionChildMetadataType.WITHDRAWAL
                      opposingResult.publicId = modifiedUniqueId
                      opposingResult.fromAddress = from
                      opposingResult.toAddress = to
                      opposingResult.proxyAddress = proxy
                      opposingResult.cryptocurrencyAmount = amount.toString()
                      opposingResult.gainLossInclusionStatus = gainLossInclusionStatus

                      opposingResults.push(opposingResult)
                    }
                  }

                  previousResult.cryptocurrencyAmount = leftover.toString()

                  if (leftover.equals(0)) {
                    indexToRemove = i
                  }

                  break
                }
              }
            }

            if (indexToRemove > -1) {
              tempResults.splice(indexToRemove, 1)
            }
          }

          const dto: CreateFinancialTransactionChildDto = {
            publicId: preprocessGroupedByCryptocurrency.uniqueId,
            hash: preprocessGroupedByCryptocurrency.hash,
            blockchainId: preprocessGroupedByCryptocurrency.blockchainId,
            type: type ?? null,
            direction: null,
            fromAddress: from,
            toAddress: to,
            proxyAddress: proxy,
            cryptocurrency: preprocessGroupedByCryptocurrency.cryptocurrency,
            cryptocurrencyAmount: amount.toString(),
            valueTimestamp: preprocessGroupedByCryptocurrency.valueTimestamp,
            status: FinancialTransactionChildMetadataStatus.SYNCING,
            organizationId: organizationId,
            financialTransactionParent: null,
            gainLossInclusionStatus: gainLossInclusionStatus ?? GainLossInclusionStatus.ALL
          }

          tempResults.push(dto)
        } catch (e) {
          this.logger.error('createFinancialTransaction fail for', preprocessGroupedByCryptocurrency, e)
        }
      }

      childTransactionDtos = childTransactionDtos.concat(opposingResults).concat(tempResults)
    }

    childTransactionDtos = childTransactionDtos
      .filter((e) => e)
      .filter((dto) => dto.fromAddress === address || dto.toAddress === address)

    let fromDtoList: CreateFinancialTransactionChildDto[] = []
    let toDtoList: CreateFinancialTransactionChildDto[] = []

    for (const dto of childTransactionDtos) {
      if (dto.type === FinancialTransactionChildMetadataType.DEPOSIT) {
        toDtoList.push(dto)
      } else if (dto.type === FinancialTransactionChildMetadataType.WITHDRAWAL) {
        fromDtoList.push(dto)
      } else {
        if (dto.fromAddress === dto.toAddress) {
          // Withdrawal leg is created above
          dto.type = FinancialTransactionChildMetadataType.DEPOSIT
        } else if (address === dto.toAddress) {
          dto.type = FinancialTransactionChildMetadataType.DEPOSIT
          if (
            dto.fromAddress === FinancialTransactionPreprocessSpecialAccount.BLOCK_REWARD_ACCOUNT ||
            dto.fromAddress === FinancialTransactionPreprocessSpecialAccount.CORRECTING_BALANCE_ACCOUNT
          ) {
            dto.fromAddress = null
          }
          toDtoList.push(dto)
        } else {
          dto.type = FinancialTransactionChildMetadataType.WITHDRAWAL
          if (dto.toAddress === FinancialTransactionPreprocessSpecialAccount.GAS_FEE_ACCOUNT) {
            dto.type = FinancialTransactionChildMetadataType.FEE
            dto.toAddress = null
          } else if (dto.toAddress === FinancialTransactionPreprocessSpecialAccount.CORRECTING_BALANCE_ACCOUNT) {
            dto.toAddress = null
          } else if (dto.toAddress === FinancialTransactionPreprocessSpecialAccount.EMPTY_TO_ACCOUNT) {
            dto.toAddress = null
          }

          fromDtoList.push(dto)
        }
      }
    }

    const parent = await this.createParent(
      organizationId,
      financialTransactionPreprocessList[0],
      fromDtoList,
      toDtoList,
      cryptoWrappedMapping
    )

    // For UI layout purpose, fee should be shown last. At this point, there is only 1 fee per transaction
    const feeIndex = childTransactionDtos.findIndex(
      (element) => element.type === FinancialTransactionChildMetadataType.FEE
    )
    if (feeIndex != -1) {
      childTransactionDtos.push(childTransactionDtos.splice(feeIndex, 1)[0])
    }

    for (const dto of childTransactionDtos) {
      dto.financialTransactionParent = parent
      CreateFinancialTransactionChildDto.updatePublicIdAndDirectionBasedOnType(dto)

      if (
        GainLossInternalActivitiesGroup.includes(parent.activity) &&
        dto.type !== FinancialTransactionChildMetadataType.FEE
      ) {
        dto.gainLossInclusionStatus = GainLossInclusionStatus.INTERNAL
        continue
      }

      if (
        (currentWallet.address === dto.fromAddress && organizationWalletsMap?.get(dto.toAddress)) ||
        (currentWallet.address === dto.toAddress && organizationWalletsMap?.get(dto.fromAddress)) ||
        dto.fromAddress === dto.toAddress
      ) {
        const counterpartyWallet =
          organizationWalletsMap?.get(dto.toAddress) || organizationWalletsMap?.get(dto.fromAddress) || currentWallet
        if (counterpartyWallet && counterpartyWallet.supportedBlockchains.includes(dto.blockchainId)) {
          if (currentWallet.walletGroup.id === counterpartyWallet.walletGroup.id) {
            if (dto.type === FinancialTransactionChildMetadataType.DEPOSIT) {
              dto.type = FinancialTransactionChildMetadataType.DEPOSIT_INTERNAL
            } else if (dto.type === FinancialTransactionChildMetadataType.WITHDRAWAL) {
              dto.type = FinancialTransactionChildMetadataType.WITHDRAWAL_INTERNAL
            }
            dto.gainLossInclusionStatus = GainLossInclusionStatus.INTERNAL
          } else if (currentWallet.walletGroup.id !== counterpartyWallet.walletGroup.id) {
            if (dto.type === FinancialTransactionChildMetadataType.DEPOSIT) {
              dto.type = FinancialTransactionChildMetadataType.DEPOSIT_GROUP
            } else if (dto.type === FinancialTransactionChildMetadataType.WITHDRAWAL) {
              dto.type = FinancialTransactionChildMetadataType.WITHDRAWAL_GROUP
            }
            dto.gainLossInclusionStatus = GainLossInclusionStatus.ALL
          }
        }
      }
    }

    return childTransactionDtos
  }

  async createParent(
    organizationId: string,
    financialTransactionPreprocessSample: FinancialTransactionPreprocess,
    fromDtoList: CreateFinancialTransactionChildDto[],
    toDtoList: CreateFinancialTransactionChildDto[],
    cryptoWrappedMapping: CryptoWrappedMapping[]
  ) {
    const activity = this.financialTransactionsService.getParentActivity({
      fromDtoList,
      toDtoList,
      cryptoWrappedMapping
    })

    const createFinancialTransactionParentDto: CreateFinancialTransactionParentDto = {
      hash: financialTransactionPreprocessSample.hash,
      blockchainId: financialTransactionPreprocessSample.blockchainId,
      activity: activity,
      status: FinancialTransactionParentStatus.ACTIVE,
      organizationId: organizationId,
      valueTimestamp: financialTransactionPreprocessSample.valueTimestamp
    }

    return this.financialTransactionsService.createOrUpdateParent(createFinancialTransactionParentDto)
  }

  async createOrMigrateFinancialTransaction(
    childTransactionDtos: CreateFinancialTransactionChildDto[],
    hash: string,
    address: string,
    organizationId: string,
    blockchainId: string
  ) {
    if (childTransactionDtos.length) {
      // Check if the result of financial transaction is exactly the same as before or not.
      // If not then migrate the user inputted data before deleting.
      // Then, soft delete all the previous entries and create new ones.
      let migrationReferenceGroupedByPublicId: {
        [publicId: string]: {
          note?: string
          correspondingChartOfAccount?: ChartOfAccount
          correspondingChartOfAccountUpdatedBy?: string
          financialTransactionChildAnnotations?: FinancialTransactionChildAnnotation[]
          fiatAmount?: string
          fiatAmountUpdatedBy?: string
          fiatAmountUpdatedAt?: Date
          fiatAmountPerUnit?: string
          fiatAmountPerUnitUpdatedBy?: string
          fiatAmountPerUnitUpdatedAt?: Date
          fiatCurrency?: string
          files?: FinancialTransactionFile[]
        }
      } = {}

      const existingChildTransactions = await this.financialTransactionsService.getChildrenByHashAndOrganizationId({
        hash,
        address,
        organizationId,
        blockchainId
      })

      const childTransactionsGroupedByCryptocurrencyId: {
        [cryptocurrencyId: string]: FinancialTransactionChild[]
      } = {}
      for (const txn of existingChildTransactions) {
        if (!childTransactionsGroupedByCryptocurrencyId[txn.cryptocurrency.id]) {
          childTransactionsGroupedByCryptocurrencyId[txn.cryptocurrency.id] = []
        }
        childTransactionsGroupedByCryptocurrencyId[txn.cryptocurrency.id].push(txn)
      }

      const childTransactionDtosGroupedByCryptocurrencyId: {
        [cryptocurrencyId: string]: CreateFinancialTransactionChildDto[]
      } = {}
      for (const dto of childTransactionDtos) {
        if (!childTransactionDtosGroupedByCryptocurrencyId[dto.cryptocurrency.id]) {
          childTransactionDtosGroupedByCryptocurrencyId[dto.cryptocurrency.id] = []
        }
        childTransactionDtosGroupedByCryptocurrencyId[dto.cryptocurrency.id].push(dto)
      }

      // If dtos has all the previous existing transactions and only result in increase of entries, do not need to delete the previous entries.
      // The increase of entries should maintain the initial ordering as well. If the ordering is off then recreate.
      for (const [cryptocurrencyId, childTransactionsPerCryptocurrencyId] of Object.entries(
        childTransactionsGroupedByCryptocurrencyId
      )) {
        let isDifferentFromBefore = false
        const preprocessDtosPerCryptocurrencyId = childTransactionDtosGroupedByCryptocurrencyId[cryptocurrencyId]

        for (const [index, childTransaction] of childTransactionsPerCryptocurrencyId.entries()) {
          if (!preprocessDtosPerCryptocurrencyId?.at(index)) {
            isDifferentFromBefore = true
            break
          }

          const dto = preprocessDtosPerCryptocurrencyId.at(index)

          const hasExistingWithCorrectOrder =
            childTransaction.cryptocurrency.id === dto.cryptocurrency.id &&
            childTransaction.cryptocurrencyAmount === dto.cryptocurrencyAmount &&
            childTransaction.publicId === dto.publicId &&
            childTransaction.fromAddress === dto.fromAddress &&
            childTransaction.toAddress === dto.toAddress

          if (!hasExistingWithCorrectOrder) {
            isDifferentFromBefore = true
            break
          }
        }

        if (isDifferentFromBefore) {
          for (const childTransaction of childTransactionsPerCryptocurrencyId) {
            const { publicId, financialTransactionChildMetadata } = childTransaction
            migrationReferenceGroupedByPublicId[publicId] = {}

            if (financialTransactionChildMetadata.note) {
              migrationReferenceGroupedByPublicId[publicId].note = financialTransactionChildMetadata.note
            }

            if (financialTransactionChildMetadata.correspondingChartOfAccount) {
              migrationReferenceGroupedByPublicId[publicId].correspondingChartOfAccount =
                financialTransactionChildMetadata.correspondingChartOfAccount
            }

            if (financialTransactionChildMetadata.correspondingChartOfAccountUpdatedBy) {
              migrationReferenceGroupedByPublicId[publicId].correspondingChartOfAccountUpdatedBy =
                financialTransactionChildMetadata.correspondingChartOfAccountUpdatedBy
            }

            if (childTransaction.financialTransactionChildAnnotations?.length) {
              migrationReferenceGroupedByPublicId[publicId].financialTransactionChildAnnotations =
                childTransaction.financialTransactionChildAnnotations
            }

            if (
              financialTransactionChildMetadata.fiatAmountUpdatedBy?.startsWith('account_') ||
              financialTransactionChildMetadata.fiatAmountPerUnitUpdatedBy?.startsWith('account_')
            ) {
              migrationReferenceGroupedByPublicId[publicId].fiatAmount = financialTransactionChildMetadata.fiatAmount
              migrationReferenceGroupedByPublicId[publicId].fiatAmountUpdatedBy =
                financialTransactionChildMetadata.fiatAmountUpdatedBy
              migrationReferenceGroupedByPublicId[publicId].fiatAmountUpdatedAt =
                financialTransactionChildMetadata.fiatAmountUpdatedAt
              migrationReferenceGroupedByPublicId[publicId].fiatAmountPerUnit =
                financialTransactionChildMetadata.fiatAmountPerUnit
              migrationReferenceGroupedByPublicId[publicId].fiatAmountPerUnitUpdatedBy =
                financialTransactionChildMetadata.fiatAmountPerUnitUpdatedBy
              migrationReferenceGroupedByPublicId[publicId].fiatAmountPerUnitUpdatedAt =
                financialTransactionChildMetadata.fiatAmountPerUnitUpdatedAt
              migrationReferenceGroupedByPublicId[publicId].fiatCurrency =
                financialTransactionChildMetadata.fiatCurrency
            }

            const files = await this.financialTransactionsService.getFilesByOrganizationIdAndChildPublicId({
              organizationId,
              childPublicId: childTransaction.publicId
            })

            if (files.length) {
              migrationReferenceGroupedByPublicId[publicId].files = files
            }

            await this.financialTransactionChildAnnotationEntityService.softDeleteByResourceIds({
              resourceIds: existingChildTransactions.map((child) => child.id),
              deletedBy: 'system_create_or_migrate_financial_transaction'
            })
            await this.financialTransactionsService.softDeleteFinancialTransactionChildren(existingChildTransactions)
          }
        }
      }

      const newChildren: FinancialTransactionChild[] = []

      for (const dto of childTransactionDtos) {
        newChildren.push(await this.financialTransactionsService.upsertChild(dto))
      }

      if (Object.keys(migrationReferenceGroupedByPublicId).length) {
        const organization = await this.organizationsService.get(organizationId)
        for (const newChild of newChildren) {
          const reference = migrationReferenceGroupedByPublicId[newChild.publicId]
          if (reference) {
            const partialMetadata: Partial<FinancialTransactionChildMetadata> = {}

            partialMetadata.note = reference.note
            partialMetadata.correspondingChartOfAccount = reference.correspondingChartOfAccount
            partialMetadata.correspondingChartOfAccountUpdatedBy = reference.correspondingChartOfAccountUpdatedBy
            partialMetadata.fiatAmount = reference.fiatAmount
            partialMetadata.fiatAmountUpdatedBy = reference.fiatAmountUpdatedBy
            partialMetadata.fiatAmountUpdatedAt = reference.fiatAmountUpdatedAt
            partialMetadata.fiatAmountPerUnit = reference.fiatAmountPerUnit
            partialMetadata.fiatAmountPerUnitUpdatedBy = reference.fiatAmountPerUnitUpdatedBy
            partialMetadata.fiatAmountPerUnitUpdatedAt = reference.fiatAmountPerUnitUpdatedAt
            partialMetadata.fiatCurrency = reference.fiatCurrency

            await this.financialTransactionsService.updateChildMetadata(
              newChild.financialTransactionChildMetadata.id,
              partialMetadata
            )

            for (const financialTransactionChildAnnotation of reference?.financialTransactionChildAnnotations ?? []) {
              await this.financialTransactionChildAnnotationEntityService.upsertResourceAnnotation({
                resourceId: newChild.id,
                annotationId: financialTransactionChildAnnotation.id,
                createdBy: financialTransactionChildAnnotation.createdBy
              })
            }

            for (const file of reference?.files ?? []) {
              const { filePath, key, bucket, contentType, contentLength } =
                await this.filesService.copyToTransactionAttachment({
                  fromBucket: file.bucket,
                  fromKey: file.key,
                  publicOrganizationId: organization.publicId,
                  financialTransactionChildPublicId: newChild.publicId
                })
              const attachment = FinancialTransactionFile.create({
                filePath,
                file: {
                  originalname: file.name,
                  mimetype: contentType,
                  size: contentLength
                },
                key,
                bucket,
                financialTransactionChildId: newChild.id,
                organizationId: organizationId
              })
              await this.financialTransactionsService.saveFile(attachment)
            }
          }
        }
      }
    }
  }
}
