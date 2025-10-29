import { Module } from '@nestjs/common'
import { TripleAModule as TripleAIntegrationModule } from '../domain/integrations/triple-a/triple-a.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { TripleAController } from './triple-a.controller'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'

@Module({
  imports: [TripleAIntegrationModule, SubscriptionsDomainModule, OrganizationsEntityModule, LoggerModule],
  controllers: [TripleAController],
  providers: [],
  exports: []
})
export class TripleAModule {}
