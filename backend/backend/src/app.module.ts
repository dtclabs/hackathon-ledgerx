import { HttpModule } from '@nestjs/axios'
import { ExecutionContext, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RouterModule } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as Joi from 'joi'
import { ClsModule } from 'nestjs-cls'
import { AccountsModule } from './accounts/accounts.module'
import { AnalysisController } from './analysis/analysis.controller'
import { AnalysisModule } from './analysis/analysis.module'
import { AnalysisService } from './analysis/analysis.service'
import { AnnotationsModule } from './annotations/annotations.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AssetsModule } from './assets/assets.module'
import { AuthModule } from './auth/auth.module'
import { BalancesModule } from './balances/balances.module'
import { BankFeedExportsModule } from './bank-feed-exports/bank-feed-exports.module'
import { BillingHistoriesModule } from './billing-histories/billing-histories.module'
import { BlockchainsModule } from './blockchains/blockchains.module'
import { CategoriesModule } from './categories/categories.module'
import { ChainsModule } from './chains/chains.module'
import { ChartOfAccountMappingsModule } from './chart-of-account-mappings/chart-of-account-mappings.module'
import { ChartOfAccountsModule } from './chart-of-accounts/chart-of-accounts.module'
import { CoingeckoModule } from './coingecko/coingecko.module'
import { ContactsModule } from './contacts/contacts.module'
import { CoreModule } from './core/core.module'
import { PUBLIC_ORGANIZATION_ID_PARAM } from './core/interceptors/get-private-organization-id.interceptor'
import { CountriesModule } from './countries/countries.module'
import { CryptocurrenciesModule } from './cryptocurrencies/cryptocurrencies.module'
import { CryptocurrenciesPublicModule } from './cryptocurrencies/public/cryptocurrencies-public.module'
import { ExportWorkflowDomainModule } from './domain/export-workflow/export-workflow.domain.module'
import { NftsDomainModule } from './domain/nfts/nfts.domain.module'
import { ExportWorkflowsModule } from './export-workflows/export-workflows.module'
import { FeatureFlagsModule } from './feature-flags/feature-flags.module'
import { FeatureWaitlistRequestsModule } from './feature-waitlist-requests/feature-waitlist-requests.module'
import { FiatCurrenciesModule } from './fiat-currencies/fiat-currencies.module'
import { FilesModule } from './files/files.module'
import { FinancialTransactionExportsModule } from './financial-transaction-exports/financial-transaction-exports.module'
import { FinancialTransactionsModule } from './financial-transactions/financial-transactions.module'
import { GroupsModule } from './groups/groups.module'
import { HealthModule } from './health/health.module'
import { IntegrationSyncRequestsModule } from './integration-sync-requests/integration-sync-requests.module'
import { IntegrationWhitelistRequestsModule } from './integration-whitelist-requests/integration-whitelist-requests.module'
import { IntegrationsModule } from './integrations/integrations.module'
import { InvitationsModule } from './invitations/invitations.module'
import { InvitationsPublicModule } from './invitations/public/invitations-public.module'
import { InvoicesModule } from './invoices/invoices.module'
import { JournalEntryExportsModule } from './journal-entry-exports/journal-entry-exports.module'
import { MembersModule } from './members/members.module'
import { NftCollectionsModule } from './nft-collections/nft-collections.module'
import { NftSyncsModule } from './nft-syncs/nft-syncs.module'
import { NftsModule } from './nfts/nfts.module'
import { OrganizationIntegrationsInternalModule } from './organization-integrations/internal/organization-integrations-internal.module'
import { OrganizationIntegrationsModule } from './organization-integrations/organization-integrations.module'
import { OrganizationTrialsModule } from './organization-trials/organization-trials.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { PaymentLinkMetadataModule } from './payment-link-metadata/payment-link-metadata.module'
import { PaymentLinksModule } from './payment-links/payment-links.module'
import { PaymentsModule } from './payments/payments.module'
import { PayoutsModule } from './payouts/payouts.module'
import { PendingTransactionsModule } from './pending-transactions/pending-transactions.module'
import { PricesModule } from './prices/prices.module'
import { ProvidersModule } from './providers/providers.module'
import { RecipientBankAccountsModule } from './recipient-bank-accounts/recipient-bank-accounts.module'
import { RecipientsModule } from './recipients/recipients.module'
import { RolesModule } from './roles/roles.module'
import { SchedulesModule } from './schedules/schedules.module'
import { SettingsModule } from './setting/settings.module'
import { SubscriptionRelatedRequestsModule } from './subscription-related-requests/subscription-related-requests.module'
import { SubscriptionsModule } from './subscriptions/subscriptions.module'
import { TagsModule } from './tags/tags.module'
import { TimezonesModule } from './timezones/timezones.module'
import { TokensModule } from './tokens/tokens.module'
import { TripleAModule } from './triple-a/triple-a.module'
import { WalletGroupsModule } from './wallet-groups/wallet-groups.module'
import { WalletsModule } from './wallets/wallets.module'
import { SentryModule } from './shared/sentry/sentry.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { DataOnchainIngestorModule } from './data-onchain-ingestor/data-onchain-ingestor.module'
import { WebhooksModule } from './webhooks/webhooks.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.required(),
        DATABASE_LOGGING: Joi.required(),
        DATABASE_ENTITIES: Joi.required(),
        DATABASE_MIGRATIONS: Joi.required(),
        DATABASE_MIGRATIONS_TABLE_NAME: Joi.required(),
        COINGECKO_API_KEY: Joi.required(),
        ETHERSCAN_API_KEY: Joi.required(),
        ALCHEMY_INGESTION_API_KEY: Joi.required(),
        POLYGONSCAN_API_KEY: Joi.required(),
        BSCSCAN_API_KEY: Joi.required(),
        MERGE_ACCESS_TOKEN: Joi.required(),
        AWS_S3_BUCKET: Joi.required(),
        AWS_S3_KEY_SECRET: Joi.required(),
        AWS_S3_ACCESS_KEY: Joi.required(),
        AWS_S3_REGION: Joi.required(),
        S3_URL: Joi.required(),
      })
    }),
    ClsModule.forRoot({
      interceptor: {
        mount: true,
        setup: (cls, context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest()
          cls.set('organizationId', req.params.organizationId)
        }
      }
    }),
    HttpModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('THROTTLE_TTL') || 60,
        limit: configService.get('THROTTLE_LIMIT') || 10000
      })
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        logging: configService.get('DATABASE_LOGGING'),
        entities: [configService.get('DATABASE_ENTITIES')],
        migrations: [configService.get('DATABASE_MIGRATIONS')],
        migrationsTableName: configService.get('DATABASE_MIGRATIONS_TABLE_NAME'),
        applicationName: 'ledgerx-backend',
        //https://github.com/typeorm/typeorm/issues/3388
        extra: { max: 25 }
      })
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CoreModule,
    AccountsModule,
    OrganizationsModule,
    AuthModule,
    TokensModule,
    ChainsModule,
    RolesModule,
    FilesModule,
    HealthModule,
    GroupsModule,
    RecipientBankAccountsModule,
    RecipientsModule,
    InvitationsPublicModule,
    PricesModule,
    CoingeckoModule,
    SchedulesModule,
    CategoriesModule,
    InvitationsModule,
    ProvidersModule,
    MembersModule,
    PaymentLinksModule,
    ContactsModule,
    FinancialTransactionsModule,
    PaymentLinkMetadataModule,
    WalletGroupsModule,
    WalletsModule,
    AssetsModule,
    CryptocurrenciesModule,
    CryptocurrenciesPublicModule,
    SettingsModule,
    CountriesModule,
    TimezonesModule,
    FeatureFlagsModule,
    BlockchainsModule,
    BalancesModule,
    InvoicesModule,
    BillingHistoriesModule,
    SubscriptionsModule,
    SubscriptionRelatedRequestsModule,
    PayoutsModule,
    PendingTransactionsModule,
    PaymentsModule,
    ExportWorkflowsModule,
    ExportWorkflowDomainModule,
    TripleAModule,
    OnboardingModule,
    DataOnchainIngestorModule,
    WebhooksModule,
    RouterModule.register([
      {
        path: `:${PUBLIC_ORGANIZATION_ID_PARAM}`,
        children: [
          {
            path: '/groups',
            module: GroupsModule
          },
          {
            path: '/wallet-groups',
            module: WalletGroupsModule
          },
          {
            path: '/wallets',
            module: WalletsModule
          },
          {
            path: '/recipients/:recipientId/recipient-bank-accounts',
            module: RecipientBankAccountsModule
          },
          {
            path: '/recipients',
            module: RecipientsModule
          },
          {
            path: '/categories',
            module: CategoriesModule
          },
          {
            path: '/members',
            module: MembersModule
          },
          {
            path: '/invitations',
            module: InvitationsModule
          },
          {
            path: '/payment-links',
            module: PaymentLinksModule
          },
          {
            path: '/contacts',
            module: ContactsModule
          },
          {
            path: '/financial-transactions',
            module: FinancialTransactionsModule
          },
          {
            path: '/assets',
            module: AssetsModule
          },
          {
            path: '/cryptocurrencies',
            module: CryptocurrenciesModule
          },
          {
            path: '/setting',
            module: SettingsModule
          },
          {
            path: '/organization-integrations',
            module: OrganizationIntegrationsModule
          },
          {
            path: '/internal/organization-integrations',
            module: OrganizationIntegrationsInternalModule
          },
          {
            path: '/integration-whitelist-requests',
            module: IntegrationWhitelistRequestsModule
          },
          {
            path: '/chart-of-accounts',
            module: ChartOfAccountsModule
          },
          {
            path: '/chart-of-account-mappings',
            module: ChartOfAccountMappingsModule
          },
          {
            path: '/integration-sync-requests',
            module: IntegrationSyncRequestsModule
          },
          {
            path: '/journal-entry-exports',
            module: JournalEntryExportsModule
          },
          {
            path: '/organization-trials',
            module: OrganizationTrialsModule
          },
          {
            path: '/balances',
            module: BalancesModule
          },
          {
            path: '/invoices',
            module: InvoicesModule
          },
          {
            path: '/billing-histories',
            module: BillingHistoriesModule
          },
          {
            path: '/subscriptions',
            module: SubscriptionsModule
          },
          {
            path: '/subscription-related-requests',
            module: SubscriptionRelatedRequestsModule
          },
          {
            path: '/payouts',
            module: PayoutsModule
          },
          {
            path: '/payments',
            module: PaymentsModule
          },
          {
            path: '/financial-transaction-exports',
            module: FinancialTransactionExportsModule
          },
          {
            path: '/pending-transactions',
            module: PendingTransactionsModule
          },
          {
            path: '/bank-feed-exports',
            module: BankFeedExportsModule
          },
          {
            path: '/export-workflows',
            module: ExportWorkflowsModule
          },
          {
            path: '/nfts',
            module: NftsModule
          },
          {
            path: '/nft-collections',
            module: NftCollectionsModule
          },
          {
            path: '/nft-syncs',
            module: NftSyncsModule
          },
          {
            path: '/annotations',
            module: AnnotationsModule
          },
          {
            path: '/tags',
            module: TagsModule
          },
          {
            path: '/triple-a',
            module: TripleAModule
          },
          {
            path: '/feature-flags',
            module: FeatureFlagsModule
          },
          {
            path: '/feature-waitlist-requests',
            module: FeatureWaitlistRequestsModule
          },
          {
            path: '/onboardings',
            module: OnboardingModule
          }
        ]
      },
      {
        path: '',
        children: [
          {
            path: '/fiat-currencies',
            module: FiatCurrenciesModule
          },
          {
            path: '/countries',
            module: CountriesModule
          },
          {
            path: '/timezones',
            module: TimezonesModule
          },
          {
            path: '/blockchains',
            module: BlockchainsModule
          },
          {
            path: '/integrations',
            module: IntegrationsModule
          }
        ]
      }
    ]),
    AnalysisModule,
    FiatCurrenciesModule,
    OrganizationIntegrationsModule,
    OrganizationIntegrationsInternalModule,
    IntegrationWhitelistRequestsModule,
    ChartOfAccountsModule,
    IntegrationsModule,
    ChartOfAccountMappingsModule,
    IntegrationSyncRequestsModule,
    JournalEntryExportsModule,
    OrganizationTrialsModule,
    FinancialTransactionExportsModule,
    BankFeedExportsModule,
    NftsModule,
    NftCollectionsModule,
    NftSyncsModule,
    NftsDomainModule,
    AnnotationsModule,
    TagsModule,
    FeatureWaitlistRequestsModule,
    SentryModule
  ],
  controllers: [AppController, AnalysisController],
  providers: [AppService, AnalysisService]
})
export class AppModule {}
