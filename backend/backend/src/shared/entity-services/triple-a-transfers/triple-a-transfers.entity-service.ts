import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository, UpdateResult } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { TripleATransfer } from './triple-a-transfer.entity'
import { TripleATransferResponse, TripleATransferStatus } from '../../../domain/integrations/triple-a/interfaces'

@Injectable()
export class TripleATransfersEntityService extends BaseEntityService<TripleATransfer> {
  constructor(
    @InjectRepository(TripleATransfer)
    private tripleATransfersRepository: Repository<TripleATransfer>
  ) {
    super(tripleATransfersRepository)
  }

  async createTripleATransfer(
    paymentId: string,
    quoteId: string,
    transfer: TripleATransferResponse
  ): Promise<TripleATransfer> {
    const tripleATransfer = this.tripleATransfersRepository.create({
      paymentId: paymentId,
      quoteId: quoteId,
      transferId: transfer.id,
      status: transfer.status,
      expiresAt: transfer.expires_at,
      transfer: transfer
    })
    return await this.tripleATransfersRepository.save(tripleATransfer)
  }

  async updateTripleATransfer(transfer: TripleATransferResponse): Promise<UpdateResult> {
    const tripleATransfer = await this.tripleATransfersRepository.findOne({
      where: {
        transferId: transfer.id
      }
    })
    return await this.tripleATransfersRepository.update(tripleATransfer.id, {
      status: transfer.status,
      transfer: transfer,
      error: null
    })
  }

  async findEffectiveTransfer(paymentId: string, quoteId: string): Promise<TripleATransfer> {
    const effectiveTransfer = await this.tripleATransfersRepository.findOne({
      where: {
        paymentId: paymentId,
        quoteId: quoteId,
        status: Not(TripleATransferStatus.CREATED)
      },
      order: { updatedAt: 'DESC' }
    })

    if (effectiveTransfer) return effectiveTransfer

    return await this.tripleATransfersRepository.findOne({
      where: {
        paymentId: paymentId,
        quoteId: quoteId
      },
      order: { updatedAt: 'DESC' }
    })
  }

  async saveError(id: string, error: { response: unknown; retryCount: number }): Promise<UpdateResult> {
    return await this.tripleATransfersRepository.update(id, {
      error: error
    })
  }
}
