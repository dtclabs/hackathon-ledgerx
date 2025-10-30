import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { CryptocurrenciesEntityModule } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { PaymentLinkEntityModule } from '../shared/entity-services/payment-links/payment-link.entity.module'
import { PaymentLinkDomainService } from './payment-link.domain.service'
import { PaymentLinksController } from './payment-links.controller'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { SubscriptionsDomainModule } from '../domain/subscriptions/subscriptions.domain.module'

@Module({
  imports: [
    PaymentLinkEntityModule,
    OrganizationsEntityModule,
    LoggerModule,
    AuthModule,
    CryptocurrenciesEntityModule,
    MembersEntityModule,
    FeatureFlagsEntityModule,
    SubscriptionsDomainModule
  ],
  controllers: [PaymentLinksController],
  providers: [PaymentLinkDomainService],
  exports: []
})
export class PaymentLinksModule {}
