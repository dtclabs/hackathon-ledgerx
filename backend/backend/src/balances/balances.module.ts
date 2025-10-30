import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '../auth/auth.module'
import { TaxLotsModule } from '../domain/tax-lots/tax-lots.module'
import { PricesModule } from '../prices/prices.module'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { OrganizationSettingsEntityModule } from '../shared/entity-services/organization-settings/organization-settings.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { BalancesController } from './balances.controller'
import { BalancesDomainService } from './balances.domain.service'

@Module({
  imports: [
    LoggerModule,
    AuthModule,
    ConfigModule,
    TaxLotsModule,
    WalletsEntityModule,
    PricesModule,
    PortfolioModule,
    BlockchainsEntityModule,
    OrganizationSettingsEntityModule
  ],
  controllers: [BalancesController],
  providers: [BalancesDomainService],
  exports: []
})
export class BalancesModule {}
