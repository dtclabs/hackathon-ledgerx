import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import { AssetsModule } from '../assets/assets.module'
import { FinancialTransformationsModule } from '../domain/financial-transformations/financial-transformations.module'
import { PricesModule } from '../prices/prices.module'
import { AdditionalTransformationPerWalletGroupTasksEntityModule } from '../shared/entity-services/additional-transformation-per-wallet-group-tasks/additional-transformation-per-wallet-group-tasks.entity.module'
import { AdditionalTransformationPerWalletTasksEntityModule } from '../shared/entity-services/additional-transformation-per-wallet-tasks/additional-transformation-per-wallet-tasks.entity.module'
import { BlockchainsEntityModule } from '../shared/entity-services/blockchains/blockchains.entity.module'
import { ChainsEntityModule } from '../shared/entity-services/chains/chains.entity.module'
import { CoreTransformationTasksEntityModule } from '../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity.module'
import { FeatureFlagsEntityModule } from '../shared/entity-services/feature-flags/feature-flags.entity.module'
import { FinancialTransactionsEntityModule } from '../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { IngestionWorkflowsEntityModule } from '../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.module'
import { InvitationsEntityModule } from '../shared/entity-services/invitations/invitations.entity.module'
import { JournalEntryExportWorkflowsEntityModule } from '../shared/entity-services/journal-entry-export-workflows/journal-entry-exports.entity.module'
import { NftSyncsEntityModule } from '../shared/entity-services/nft-syncs/nft-syncs.entity.module'
import { OrganizationFullSyncRequestsEntityModule } from '../shared/entity-services/organization-full-sync-requests/organization-full-sync-requests.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { PreprocessRawTasksEntityModule } from '../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity.module'
import { SubscriptionsEntityModule } from '../shared/entity-services/subscriptions/subscriptions.entity.module'
import { WalletsEntityModule } from '../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'
import { WalletsModule } from '../wallets/wallets.module'
import { AlertScheduler } from './alert.scheduler'
import { JournalEntryExportScheduler } from './journal-entry-export.scheduler'
import { NftScheduler } from './nft.scheduler'
import { PriceScheduler } from './price.scheduler'
import { SubscriptionScheduler } from './subscription.scheduler'
import { TransformationScheduler } from './transformation.scheduler'
import { PaymentScheduler } from './payment.scheduler'
import { PaymentsEntityModule } from '../shared/entity-services/payments/payments.entity.module'
import { PaymentsModule } from '../payments/payments.module'
import { ChartOfAccountsEntityModule } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { OrganizationIntegrationsEntityModule } from '../shared/entity-services/organization-integrations/organization-integrations.entity.module'
import { ChartOfAccountsModule } from '../chart-of-accounts/chart-of-accounts.module'

@Module({
  imports: [
    HttpModule,
    ChainsEntityModule,
    LoggerModule,
    InvitationsEntityModule,
    IngestionWorkflowsEntityModule,
    PreprocessRawTasksEntityModule,
    CoreTransformationTasksEntityModule,
    AdditionalTransformationPerWalletTasksEntityModule,
    AdditionalTransformationPerWalletGroupTasksEntityModule,
    FeatureFlagsEntityModule,
    WalletsEntityModule,
    AssetsModule,
    BlockchainsEntityModule,
    FinancialTransformationsModule,
    OrganizationFullSyncRequestsEntityModule,
    OrganizationsEntityModule,
    JournalEntryExportWorkflowsEntityModule,
    FinancialTransactionsEntityModule,
    SubscriptionsEntityModule,
    NftSyncsEntityModule,
    PaymentsEntityModule,
    PaymentsModule,
    forwardRef(() => WalletsModule),
    forwardRef(() => PricesModule),
    ChartOfAccountsEntityModule,
    OrganizationIntegrationsEntityModule,
    ChartOfAccountsModule
  ],
  providers: [
    PriceScheduler,
    TransformationScheduler,
    AlertScheduler,
    JournalEntryExportScheduler,
    SubscriptionScheduler,
    NftScheduler,
    PaymentScheduler
  ],
  exports: []
})
export class SchedulesModule {}
