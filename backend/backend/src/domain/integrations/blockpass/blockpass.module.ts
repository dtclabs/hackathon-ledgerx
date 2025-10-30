import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from '../../../shared/logger/logger.module'
import { BlockpassService } from './blockpass.service'

@Module({
  imports: [LoggerModule, ConfigModule, HttpModule],
  providers: [BlockpassService],
  exports: [BlockpassService]
})
export class BlockpassModule {}
