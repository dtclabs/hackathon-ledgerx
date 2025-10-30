import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FilesModule } from '../../files/files.module'
import { PaymentsModule } from '../../payments/payments.module'
import { PayoutsModule } from '../../payouts/payouts.module'
import { PricesModule } from '../../prices/prices.module'
import { AdditionalTransformationPerWalletGroupTasksEntityModule } from '../../shared/entity-services/additional-transformation-per-wallet-group-tasks/additional-transformation-per-wallet-group-tasks.entity.module'
import { AdditionalTransformationPerWalletTasksEntityModule } from '../../shared/entity-services/additional-transformation-per-wallet-tasks/additional-transformation-per-wallet-tasks.entity.module'
import { ResourceAnnotationsEntityModule } from '../../shared/entity-services/annotations/resource-annotations/resource-annotations.entity.module'
import { BlockchainsEntityModule } from '../../shared/entity-services/blockchains/blockchains.entity.module'
import { ChainsEntityModule } from '../../shared/entity-services/chains/chains.entity.module'
import { ChartOfAccountsEntityModule } from '../../shared/entity-services/chart-of-accounts/chart-of-accounts.entity.module'
import { ContractConfigurationsEntityModule } from '../../shared/entity-services/contract-configurations/contract-configurations.entity.module'
import { CoreTransformationTasksEntityModule } from '../../shared/entity-services/core-transformation-tasks/core-transformation-tasks.entity.module'
import { CryptoWrappedMappingsEntityModule } from '../../shared/entity-services/crypto-wrapped-mappings/crypto-wrapped-mappings.entity.module'
import { CryptocurrenciesEntityModule } from '../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity.module'
import { EvmLogsEntityModule } from '../../shared/entity-services/evm-logs/evm-logs.entity.module'
import { FeatureFlagsEntityModule } from '../../shared/entity-services/feature-flags/feature-flags.entity.module'
import { FinancialTransactionsEntityModule } from '../../shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { GainsLossesEntityModule } from '../../shared/entity-services/gains-losses/gains-losses.entity.module'
import { IngestionProcessEntityModule } from '../../shared/entity-services/ingestion-process/ingestion-process.entity.module'
import { IngestionWorkflowsEntityModule } from '../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.module'
import { ArbitrumEntityModule } from '../../shared/entity-services/ingestion/evm/arbitrum/arbitrum.entity.module'
import { BscEntityModule } from '../../shared/entity-services/ingestion/evm/bsc/bsc.entity.module'
import { OptimismEntityModule } from '../../shared/entity-services/ingestion/evm/optimism/optimism.entity.module'
import { PolygonsEntityModule } from '../../shared/entity-services/ingestion/evm/polygon/polygons.entity.module'
import { OrganizationSettingsEntityModule } from '../../shared/entity-services/organization-settings/organization-settings.entity.module'
import { OrganizationsEntityModule } from '../../shared/entity-services/organizations/organizations.entity.module'
import { PaymentsEntityModule } from '../../shared/entity-services/payments/payments.entity.module'
import { PayoutsEntityModule } from '../../shared/entity-services/payouts/payouts.entity.module'
import { PendingTransactionsEntityModule } from '../../shared/entity-services/pending-transactions/pending-transactions.entity.module'
import { PreprocessRawTasksEntityModule } from '../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity.module'
import { RawTransactionEntityModule } from '../../shared/entity-services/raw-transactions/raw-transaction.entity.module'
import { TempTransactionsEntityModule } from '../../shared/entity-services/temp-transactions/temp-transactions.entity.module'
import { WalletContractConfigurationLogsEntityModule } from '../../shared/entity-services/wallet-contract-configuration-logs/wallet-contract-configuration-logs.entity.module'
import { WalletGroupEntityModule } from '../../shared/entity-services/wallet-groups/wallet-group.entity.module'
import { WalletsEntityModule } from '../../shared/entity-services/wallets/wallets.entity.module'
import { LoggerModule } from '../../shared/logger/logger.module'
import { BlockExplorerModule } from '../block-explorers/block-explorer.module'
import { AdditionalTransformationsPerWalletGroupDomainService } from './additional-transformations-per-wallet-group.domain.service'
import { AdditionalTransformationsPerWalletDomainService } from './additional-transformations-per-wallet.domain.service'
import { CoreTransformationsDomainService } from './core-transformations.domain.service'
import { FinancialTransformationsDomainService } from './financial-transformations.domain.service'
import { AllTransfersIngestionProcessCommand } from './ingestion/commands/all-transfers-ingestion-process.command'
import { ContractConfigurationIngestionProcessCommand } from './ingestion/commands/contract-configuration-ingestion-process.command'
import { EvmBlockRewardProcessCommand } from './ingestion/commands/evm-block-reward-process.command'
import { EvmLogIngestionProcessCommand } from './ingestion/commands/evm-log-ingestion-process.command'
import { EvmNativeIngestionProcessCommand } from './ingestion/commands/evm-native-ingestion-process-command.service'
import { IngestionProcessWrapper } from './ingestion/commands/ingestion-process.wrapper'
import { ArbitrumDataProviderService } from './ingestion/data-providers/arbitrum-data-provider.service'
import { BscDataProviderService } from './ingestion/data-providers/bsc-data-provider.service'
import { EthereumDataProviderService } from './ingestion/data-providers/ethereum-data-provider.service'
import { IngestionDataProviderFactory } from './ingestion/data-providers/ingestion-data-provider.factory'
import { OptimismDataProviderService } from './ingestion/data-providers/optimism-data-provider.service'
import { PolygonDataProviderService } from './ingestion/data-providers/polygon-data-provider.service'
import { IngestionProcessFactory } from './ingestion/ingestion-process.factory'
import { IngestionsService } from './ingestions.service'
import { AdditionalTransformationsListener } from './listeners/additional-transformation-tasks.listener'
import { CoreTransformationTasksListener } from './listeners/core-transformation-tasks.listener'
import { DraftTransactionMigrationListener } from './listeners/draft-transaction-migration.listener'
import { IngestionTasksListener } from './listeners/ingestion-tasks.listener'
import { OperationalTransformationsListener } from './listeners/operational-transformation-tasks.listener'
import { PaymentsListener } from './listeners/payments.listener'
import { PayoutsListener } from './listeners/payouts.listener'
import { PreprocessRawTasksListener } from './listeners/preprocess-raw-tasks.listener'
import { OperationalTransformationsDomainService } from './operational-transformations.domain.service'
import { PreprocessRawsDomainService } from './preprocess-raws.domain.service'
import { CreateBlockRewardPreprocessDtoCommand } from './preprocess/commands/create-block-reward-preprocess-dto.command'
import { CreateFeePreprocessDtoCommand } from './preprocess/commands/create-fee-preprocess-dto.command'
import { CreateLogPreprocessDtoCommand } from './preprocess/commands/create-log-preprocess-dto.command'
import { CreateNativePreprocessDtoCommand } from './preprocess/commands/create-native-preprocess-dto.command'
import { CreateOrMigratePreprocessCommand } from './preprocess/commands/create-or-migrate-preprocess.command'
import { GetAndCreateCryptocurrenciesCommand } from './preprocess/commands/get-and-create-cryptocurrencies-command.service'
import { OptimismCreateFeePreprocessDtoCommand } from './preprocess/commands/optimism-create-fee-preprocess-dto.command'
import { PreprocessStrategyFactory } from './preprocess/preprocess-strategy.factory'
import { ArbitrumStrategy } from './preprocess/strategies/arbitrum.strategy'
import { BscStrategy } from './preprocess/strategies/bsc.strategy'
import { EthMainnetStrategy } from './preprocess/strategies/eth-mainnet.strategy'
import { EvmStrategy } from './preprocess/strategies/evm.strategy'
import { OptimismStrategy } from './preprocess/strategies/optimism.strategy'
import { PolygonStrategy } from './preprocess/strategies/polygon.strategy'
import { TempTransactionsDomainService } from './temp-transactions.domain.service'
import { WalletsTransformationsDomainService } from './wallets-transformations.domain.service'
import { GnosisStrategy } from './preprocess/strategies/gnosis.strategy'
import { GnosisEntityModule } from '../../shared/entity-services/ingestion/evm/gnosis/gnosis.entity.module'
import { GnosisDataProviderService } from './ingestion/data-providers/gnosis-data-provider.service'

@Module({
  imports: [
    LoggerModule,
    ChainsEntityModule,
    CoreTransformationTasksEntityModule,
    AdditionalTransformationPerWalletTasksEntityModule,
    AdditionalTransformationPerWalletGroupTasksEntityModule,
    FinancialTransactionsEntityModule,
    IngestionWorkflowsEntityModule,
    RawTransactionEntityModule,
    CryptocurrenciesEntityModule,
    PreprocessRawTasksEntityModule,
    GainsLossesEntityModule,
    PricesModule,
    ConfigModule,
    HttpModule,
    WalletsEntityModule,
    WalletGroupEntityModule,
    FeatureFlagsEntityModule,
    OrganizationSettingsEntityModule,
    BlockchainsEntityModule,
    BlockExplorerModule,
    PendingTransactionsEntityModule,
    FilesModule,
    TempTransactionsEntityModule,
    OrganizationsEntityModule,
    IngestionProcessEntityModule,
    ContractConfigurationsEntityModule,
    EvmLogsEntityModule,
    WalletContractConfigurationLogsEntityModule,
    CryptoWrappedMappingsEntityModule,
    ChartOfAccountsEntityModule,
    ResourceAnnotationsEntityModule,
    PolygonsEntityModule,
    BscEntityModule,
    PayoutsEntityModule,
    PayoutsModule,
    PaymentsEntityModule,
    PaymentsModule,
    ArbitrumEntityModule,
    OptimismEntityModule,
    GnosisEntityModule
  ],
  providers: [
    FinancialTransformationsDomainService,
    PreprocessRawsDomainService,
    CoreTransformationsDomainService,
    AdditionalTransformationsPerWalletDomainService,
    AdditionalTransformationsPerWalletGroupDomainService,
    OperationalTransformationsDomainService,
    PreprocessRawTasksListener,
    CoreTransformationTasksListener,
    AdditionalTransformationsListener,
    OperationalTransformationsListener,
    IngestionTasksListener,
    PayoutsListener,
    PaymentsListener,
    WalletsTransformationsDomainService,
    TempTransactionsDomainService,
    DraftTransactionMigrationListener,
    IngestionsService,
    AllTransfersIngestionProcessCommand,
    ContractConfigurationIngestionProcessCommand,
    IngestionProcessWrapper,
    IngestionProcessFactory,
    EthereumDataProviderService,
    PolygonDataProviderService,
    BscDataProviderService,
    ArbitrumDataProviderService,
    OptimismDataProviderService,
    GnosisDataProviderService,
    IngestionDataProviderFactory,
    EvmNativeIngestionProcessCommand,
    EvmLogIngestionProcessCommand,
    EvmBlockRewardProcessCommand,
    PreprocessStrategyFactory,
    EthMainnetStrategy,
    EvmStrategy,
    PolygonStrategy,
    BscStrategy,
    ArbitrumStrategy,
    OptimismStrategy,
    GnosisStrategy,
    CreateNativePreprocessDtoCommand,
    CreateLogPreprocessDtoCommand,
    CreateFeePreprocessDtoCommand,
    CreateBlockRewardPreprocessDtoCommand,
    GetAndCreateCryptocurrenciesCommand,
    CreateOrMigratePreprocessCommand,
    OptimismCreateFeePreprocessDtoCommand
  ],
  exports: [
    FinancialTransformationsDomainService,
    CoreTransformationsDomainService,
    AdditionalTransformationsPerWalletDomainService,
    AdditionalTransformationsPerWalletGroupDomainService,
    PreprocessRawsDomainService,
    WalletsTransformationsDomainService,
    TempTransactionsDomainService,
    IngestionsService,
    EthereumDataProviderService,
    ArbitrumDataProviderService,
    OptimismDataProviderService
  ]
})
export class FinancialTransformationsModule {}
