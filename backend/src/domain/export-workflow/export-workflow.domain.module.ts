import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ExportWorkflowListener } from './listeners/export-workflow.listener'
import { ExportWorkflowsEntityModule } from '../../shared/entity-services/export-workflows/export-workflows.entity.module'
import { SpotBalanceExportWorkflowCommand } from './commands/spot-balance/spot-balance-export-workflow.command'
import { OrganizationsEntityModule } from '../../shared/entity-services/organizations/organizations.entity.module'
import { ExportWorkflowsCommandFactory } from './commands/export-workflows.command.factory'
import { LoggerModule } from '../../shared/logger/logger.module'
import { FilesModule } from '../../files/files.module'
import { GainsLossesEntityModule } from '../../shared/entity-services/gains-losses/gains-losses.entity.module'
import { WalletsEntityModule } from '../../shared/entity-services/wallets/wallets.entity.module'
import { CryptocurrenciesEntityModule } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { PricesModule } from '../../prices/prices.module'
import { BlockchainsEntityModule } from '../../shared/entity-services/blockchains/blockchains.entity.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    ExportWorkflowsEntityModule,
    OrganizationsEntityModule,
    LoggerModule,
    FilesModule,
    GainsLossesEntityModule,
    WalletsEntityModule,
    CryptocurrenciesEntityModule,
    PricesModule,
    BlockchainsEntityModule
  ],
  controllers: [],
  providers: [ExportWorkflowListener, SpotBalanceExportWorkflowCommand, ExportWorkflowsCommandFactory],
  exports: []
})
export class ExportWorkflowDomainModule {}
