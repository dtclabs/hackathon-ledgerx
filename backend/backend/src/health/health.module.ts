import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './health.controller'
import { LoggerModule } from '../shared/logger/logger.module'

@Module({
  imports: [TerminusModule, ConfigModule, LoggerModule, HttpModule],
  controllers: [HealthController]
})
export class HealthModule { }
