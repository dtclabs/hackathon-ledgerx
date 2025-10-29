import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoggerService } from '../shared/logger/logger.service'
import { SolImportJob } from './sol-import-job.entity'

@Injectable()
export class SolImportJobService {
  constructor(
    @InjectRepository(SolImportJob)
    private readonly jobRepository: Repository<SolImportJob>,
    private readonly logger: LoggerService
  ) {}

  async createJob(organizationId: string, walletPublicId: string, metadata?: any): Promise<SolImportJob> {
    const job = this.jobRepository.create({
      walletPublicId,
      organizationId,
      status: 'pending',
      startedAt: new Date(),
      totalTransactions: 0,
      processedTransactions: 0,
      metadata
    })

    return this.jobRepository.save(job)
  }

  async getActiveJob(organizationId: string, walletPublicId: string): Promise<SolImportJob | null> {
    return this.jobRepository.findOne({
      where: [
        {
          organizationId,
          walletPublicId,
          status: 'pending'
        },
        {
          organizationId,
          walletPublicId,
          status: 'running'
        }
      ],
      order: { startedAt: 'DESC' }
    })
  }

  async getJobById(jobId: string): Promise<SolImportJob | null> {
    return this.jobRepository.findOne({
      where: { id: jobId } as any
    })
  }

  async updateJobStatus(
    jobId: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    message?: string
  ): Promise<void> {
    const updateData: any = { status }
    
    if (message) {
      if (status === 'failed') {
        updateData.error = message
      }
    }

    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date()
    }

    await this.jobRepository.update(jobId, updateData)
    
    this.logger.debug('Updated import job status', {
      jobId,
      status,
      message
    })
  }

  async incrementProgress(jobId: string, processed: number, total: number): Promise<void> {
    await this.jobRepository.update(jobId, {
      processedTransactions: processed,
      totalTransactions: total
    })
  }

  async getJobsByWallet(
    walletPublicId: string,
    limit: number = 10
  ): Promise<SolImportJob[]> {
    return this.jobRepository.find({
      where: { walletPublicId },
      order: { startedAt: 'DESC' },
      take: limit
    })
  }

  async getRecentJobs(
    organizationId: string,
    limit: number = 20
  ): Promise<SolImportJob[]> {
    return this.jobRepository.find({
      where: { organizationId },
      order: { startedAt: 'DESC' },
      take: limit
    })
  }
}