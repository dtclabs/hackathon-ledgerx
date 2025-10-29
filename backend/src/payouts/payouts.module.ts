import { Module } from '@nestjs/common'
import { PayoutsEntityModule } from '../shared/entity-services/payouts/payouts.entity.module'
import { PayoutsController } from './payouts.controller'
import { PayoutsDomainService } from './payouts.domain.service'
import { BlockExplorerModule } from '../domain/block-explorers/block-explorer.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { FilesModule } from '../files/files.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'

@Module({
  imports: [
    PayoutsEntityModule,
    WalletsEntityModule,
    BlockExplorerModule,
    FinancialTransactionsEntityModule,
    ChartOfAccountsEntityModule,
    FilesModule,
    LoggerModule
  ],
  controllers: [PayoutsController],
  providers: [PayoutsDomainService],
  exports: [PayoutsDomainService]
})
export class PayoutsModule {}
