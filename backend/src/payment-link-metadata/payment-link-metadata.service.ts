import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaymentLinkMetadata } from './payment-link-metadata.entity'
import { BaseEntityService } from '../shared/entity-services/base.entity-service'

@Injectable()
export class PaymentLinkMetadataService extends BaseEntityService<PaymentLinkMetadata> {
  constructor(
    @InjectRepository(PaymentLinkMetadata)
    private paymentLinkMetadataRepository: Repository<PaymentLinkMetadata>
  ) {
    super(paymentLinkMetadataRepository)
  }
}
