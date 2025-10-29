import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from '../../../shared/logger/logger.module'
import { TripleAService } from './triple-a.service'

@Module({
  imports: [LoggerModule, ConfigModule, HttpModule],
  providers: [TripleAService],
  exports: [TripleAService]
})
export class TripleAModule {}
