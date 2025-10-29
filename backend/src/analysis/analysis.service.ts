import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaginationResponse } from '../core/interfaces'
import { BaseEntityService } from '../shared/entity-services/base.entity-service'
import { AnalysisCreateTransaction } from './analysis-create-transaction.entity'
import { AnalysisEventTracker } from './analysis-event-tracker.entity'
import { Analysis } from './analysis.entity'
import {
  AnalysisQuery,
  CreateAnalysisCreatePayoutDto,
  CreateAnalysisCreateTransactionDto,
  CreateAnalysisEventTrackerDto
} from './interface'
import { AnalysisCreatePayout } from './analysis-create-payout.entity'

@Injectable()
export class AnalysisService extends BaseEntityService<Analysis> {
  constructor(
    @InjectRepository(Analysis)
    private analysisRepository: Repository<Analysis>,
    @InjectRepository(AnalysisEventTracker)
    private analysisEventTrackerRepository: Repository<AnalysisEventTracker>,
    @InjectRepository(AnalysisCreateTransaction)
    private analysisCreateTransactionRepository: Repository<AnalysisCreateTransaction>,
    @InjectRepository(AnalysisCreatePayout)
    private analysisCreatePayoutsRepository: Repository<AnalysisCreatePayout>
  ) {
    super(analysisRepository)
  }

  async getAllAnalysis(options: AnalysisQuery): Promise<PaginationResponse<Analysis>> {
    let query = ''
    const page = options.page || 0
    const size = options.size || 10
    const ip = (options.ip || '').trim()
    const order = options.order || 'updatedAt'
    const event = (options.event || '').trim()
    const referrer = (options.referrer || '').trim()
    const direction = (options.direction || 'DESC') as 'DESC' | 'ASC'

    if (ip) {
      query = `${query ? 'AND' : ''} analysis.source_ip ILIKE :ip`
    }

    if (referrer) {
      query = `${query ? 'AND' : ''} analysis.referrer ILIKE :referrer`
    }

    if (event) {
      query = `${query ? 'AND' : ''} analysis.event ILIKE :event`
    }

    const [items, total] = await this.analysisRepository
      .createQueryBuilder('analysis')
      .where(query, {
        ip: `%${ip}%`,
        event: `%${event}%`,
        referrer: `%${referrer}%`
      })
      .orderBy(`analysis.${order}`, direction)
      .skip(size * page)
      .take(size)
      .getManyAndCount()

    return {
      totalItems: total,
      totalPages: Math.ceil(total / size),
      currentPage: page,
      items,
      limit: size
    }
  }

  createAnalysisEventTracker(dto: CreateAnalysisEventTrackerDto) {
    return this.analysisEventTrackerRepository.save(AnalysisEventTracker.map(dto))
  }

  createAnalysisCreateTransaction(dto: CreateAnalysisCreateTransactionDto) {
    return this.analysisCreateTransactionRepository.save(AnalysisCreateTransaction.map(dto))
  }

  async createAnalysisCreatePayout(createAnalysisCreatePayoutDto: CreateAnalysisCreatePayoutDto) {
    return await this.analysisCreatePayoutsRepository.save({
      blockchainId: createAnalysisCreatePayoutDto.blockchainId,
      organizationId: createAnalysisCreatePayoutDto.organizationId,
      applicationName: createAnalysisCreatePayoutDto.applicationName,
      type: createAnalysisCreatePayoutDto.type,
      sourceType: createAnalysisCreatePayoutDto.sourceType,
      sourceAddress: createAnalysisCreatePayoutDto.sourceAddress,
      sourceWalletId: createAnalysisCreatePayoutDto.sourceWalletId,
      hash: createAnalysisCreatePayoutDto.hash,
      notes: createAnalysisCreatePayoutDto.notes,
      totalLineItems: createAnalysisCreatePayoutDto.totalLineItems,
      lineItems: createAnalysisCreatePayoutDto.lineItems,
      totalAmount: createAnalysisCreatePayoutDto.totalAmount,
      valueAt: createAnalysisCreatePayoutDto.valueAt
    })
  }
}
