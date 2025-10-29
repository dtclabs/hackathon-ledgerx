import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { LoggerService } from '../../../shared/logger/logger.service'
import { FinancialTransformationsEventType } from '../events/events'
import { TempTransactionsDomainService } from '../temp-transactions.domain.service'

@Injectable()
export class DraftTransactionMigrationListener {
  constructor(
    private legacyMigrationDomainService: TempTransactionsDomainService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService
  ) {}

  @OnEvent(FinancialTransformationsEventType.DRAFT_TRANSACTION_MIGRATION, { async: true, promisify: true })
  async handleDraftTransactionMigrationEvent() {
    try {
      await this.legacyMigrationDomainService.migrateForAllNonMigratedTempTransaction()
    } catch (e) {
      this.logger.error(`Can not migrate files/notes/categories/correspondingChartOfAccount`, e)
    }
  }
}
