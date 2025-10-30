import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from '../../../shared/logger/logger.module'
import { DtcpayService } from './dtcpay.service'

@Module({
  imports: [LoggerModule, ConfigModule, HttpModule],
  providers: [DtcpayService],
  exports: [DtcpayService]
})
export class DtcpayModule {}
