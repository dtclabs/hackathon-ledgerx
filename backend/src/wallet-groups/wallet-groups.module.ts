import { Module } from '@nestjs/common'
import { LoggerModule } from '../shared/logger/logger.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { WalletGroupEntityModule } from '../shared/entity-services/wallet-groups/wallet-group.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { WalletGroupsController } from './wallet-groups.controller'
import { WalletGroupsDomainService } from './wallet-groups.domain.service'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    WalletGroupEntityModule,
    WalletsEntityModule,
    MembersEntityModule,
    LoggerModule,
    FeatureFlagsEntityModule,
    OrganizationsEntityModule,
    SubscriptionsDomainModule
  ],
  controllers: [WalletGroupsController],
  providers: [WalletGroupsDomainService],
  exports: []
})
export class WalletGroupsModule {}
