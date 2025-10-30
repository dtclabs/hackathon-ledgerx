import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerService } from './logger.service'
import { ClsModule } from 'nestjs-cls'
import { OrganizationsEntityModule } from '../entity-services/organizations/organizations.entity.module'
import { SubscriptionsDomainModule } from '../../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [ConfigModule, ClsModule, OrganizationsEntityModule, SubscriptionsDomainModule],
  controllers: [],
  providers: [LoggerService],
  exports: [LoggerService]
})
export class LoggerModule {}
