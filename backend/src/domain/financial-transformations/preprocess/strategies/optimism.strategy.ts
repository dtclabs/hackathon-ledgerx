import { Injectable } from '@nestjs/common'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { CryptocurrenciesEntityService } from '../../../../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { FinancialTransactionsEntityService } from '../../../../shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { IngestionWorkflowsEntityService } from '../../../../shared/entity-services/ingestion-workflows/ingestion-workflows.entity.service'
import { PreprocessRawTasksEntityService } from '../../../../shared/entity-services/preprocess-raw-tasks/preprocess-raw-tasks.entity-service'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { IngestionDataProviderFactory } from '../../ingestion/data-providers/ingestion-data-provider.factory'
import { CreateLogPreprocessDtoCommand } from '../commands/create-log-preprocess-dto.command'
import { CreateNativePreprocessDtoCommand } from '../commands/create-native-preprocess-dto.command'
import { CreateOrMigratePreprocessCommand } from '../commands/create-or-migrate-preprocess.command'
import { GetAndCreateCryptocurrenciesCommand } from '../commands/get-and-create-cryptocurrencies-command.service'
import { EvmStrategy } from './evm.strategy'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { OptimismCreateFeePreprocessDtoCommand } from '../commands/optimism-create-fee-preprocess-dto.command'

@Injectable()
export class OptimismStrategy extends EvmStrategy {
  constructor(
    protected readonly preprocessRawTasksService: PreprocessRawTasksEntityService,
    protected readonly ingestionTaskService: IngestionWorkflowsEntityService,
    protected readonly financialTransactionsService: FinancialTransactionsEntityService,
    protected readonly cryptocurrenciesService: CryptocurrenciesEntityService,
    protected readonly contractConfigurationsEntityService: ContractConfigurationsEntityService,
    protected readonly logger: LoggerService,
    protected readonly ingestionDataProviderFactory: IngestionDataProviderFactory,
    protected readonly createNativePreprocessDtoCommand: CreateNativePreprocessDtoCommand,
    protected readonly createLogPreprocessDtoCommand: CreateLogPreprocessDtoCommand,
    protected readonly getAndCreateCryptocurrenciesCommand: GetAndCreateCryptocurrenciesCommand,
    protected readonly optimismCreateFeePreprocessDtoCommand: OptimismCreateFeePreprocessDtoCommand,
    protected readonly createOrMigratePreprocessCommand: CreateOrMigratePreprocessCommand,
    protected readonly blockExplorerAdapterFactory: BlockExplorerAdapterFactory
  ) {
    super(
      preprocessRawTasksService,
      ingestionTaskService,
      financialTransactionsService,
      cryptocurrenciesService,
      contractConfigurationsEntityService,
      logger,
      ingestionDataProviderFactory,
      createNativePreprocessDtoCommand,
      createLogPreprocessDtoCommand,
      getAndCreateCryptocurrenciesCommand,
      optimismCreateFeePreprocessDtoCommand,
      createOrMigratePreprocessCommand
    )
  }
}
