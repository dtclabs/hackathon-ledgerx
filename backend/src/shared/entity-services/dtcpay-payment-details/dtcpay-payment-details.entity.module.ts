import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DtcpayPaymentDetail } from './dtcpay-payment-detail.entity'
import { DtcpayPaymentDetailsEntityService } from './dtcpay-payment-details.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([DtcpayPaymentDetail])],
  providers: [DtcpayPaymentDetailsEntityService],
  exports: [DtcpayPaymentDetailsEntityService]
})
export class DtcpayPaymentDetailsEntityModule {}
