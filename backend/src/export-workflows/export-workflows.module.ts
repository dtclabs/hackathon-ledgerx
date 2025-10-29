import { Module } from '@nestjs/common'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { ExportWorkflowsController } from './export-workflows.controller'
import { ExportWorkflowsDomainService } from './export-workflows.domain.service'
import { LoggerModule } from '../shared/logger/logger.module'
import { FilesModule } from '../files/files.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { ExportWorkflowsEntityModule } from '../shared/entity-services/export-workflows/export-workflows.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    OrganizationIntegrationsEntityModule,
    LoggerModule,
    FilesModule,
    WalletsEntityModule,
    BlockchainsEntityModule,
    CryptocurrenciesEntityModule,
    ExportWorkflowsEntityModule,
    MembersEntityModule,
    SubscriptionsDomainModule
  ],
  controllers: [ExportWorkflowsController],
  providers: [ExportWorkflowsDomainService],
  exports: []
})
export class ExportWorkflowsModule {}
