import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from '../logger/logger.module'
import { TemporalService } from './temporal.service'

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [TemporalService],
  exports: [TemporalService]
})
export class TemporalModule {}