import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentLink } from './payment-link.entity'
import { PaymentLinkEntityService } from './payment-link.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLink])],
  providers: [PaymentLinkEntityService],
  exports: [TypeOrmModule, PaymentLinkEntityService]
})
export class PaymentLinkEntityModule {}
