import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from '../../../shared/logger/logger.module'
import { Auth0Service } from './auth0.service'

@Module({
  imports: [LoggerModule, ConfigModule, HttpModule],
  providers: [Auth0Service],
  exports: [Auth0Service]
})
export class Auth0Module {}
