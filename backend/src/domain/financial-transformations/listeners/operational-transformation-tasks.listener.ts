import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { BlockchainsEntityService } from '../../../shared/entity-services/blockchains/blockchains.entity-service'
import { FeatureFlagsEntityService } from '../../../shared/entity-services/feature-flags/feature-flags.entity-service'
import { WalletStatusesEnum } from '../../../shared/entity-services/wallets/interfaces'
import { WalletsEntityService } from '../../../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../../../shared/logger/logger.service'
import { ChangeFiatCurrencyForOrganizationEventParams, FinancialTransformationsEventType } from '../events/events'
import { OperationalTransformationsDomainService } from '../operational-transformations.domain.service'
import { WalletsTransformationsDomainService } from '../wallets-transformations.domain.service'

@Injectable()
export class OperationalTransformationsListener {
  constructor(
    private operationalTransformationsDomainService: OperationalTransformationsDomainService,
    private featureFlagsService: FeatureFlagsEntityService,
    private logger: LoggerService,
    private blockchainsService: BlockchainsEntityService,
    private walletsService: WalletsEntityService,
    private walletsTransformationsDomainService: WalletsTransformationsDomainService
  ) {}

  @OnEvent(FinancialTransformationsEventType.OPERATIONAL_TRANSFORMATION_RECALCULATE_PRICES_FOR_TRANSACTION_PARENT, {
    async: true,
    promisify: true
  })
  async handleRecalculatePricesForTransactionParent(parentId: string) {
    this.logger.info(
      `OPERATIONAL_TRANSFORMATION_RECALCULATE_PRICES_FOR_TRANSACTION_PARENT is running for: ${parentId}-------------------`
    )

    try {
      await this.operationalTransformationsDomainService.executeRecalculatePriceForParentIdWorkflow(parentId)

      this.logger.info(
        `OPERATIONAL_TRANSFORMATION_RECALCULATE_PRICES_FOR_TRANSACTION_PARENT is COMPLETED for: ${parentId}-------------------`
      )
    } catch (e) {
      this.logger.error(
        `Error handle OPERATIONAL_TRANSFORMATION_RECALCULATE_PRICES_FOR_TRANSACTION_PARENT for: ${parentId}`,
        e
      )
    }
  }

  @OnEvent(FinancialTransformationsEventType.OPERATIONAL_TRANSFORMATION_CHANGE_FIAT_CURRENCY_FOR_ORGANIZATION, {
    async: true,
    promisify: true
  })
  async handleResyncPriceForOrganizationEvent(params: ChangeFiatCurrencyForOrganizationEventParams) {
    this.logger.info(`OPERATIONAL_TRANSFORMATION_CHANGE_FIAT_CURRENCY_FOR_ORGANIZATION is running for:`, params)

    try {
      await this.operationalTransformationsDomainService.executeChangeFiatCurrencyForOrganizationWorkflow(params)

      this.logger.info(`OPERATIONAL_TRANSFORMATION_CHANGE_FIAT_CURRENCY_FOR_ORGANIZATION is COMPLETED for:`, params)

      await this.walletsTransformationsDomainService.syncBalanceFromChainForOrganization(params.organizationId)
    } catch (e) {
      this.logger.error(`Error handle OPERATIONAL_TRANSFORMATION_CHANGE_FIAT_CURRENCY_FOR_ORGANIZATION`, params, e)
    } finally {
      await this.walletsService.updateWalletsSyncStatusForOrganization(params.organizationId, WalletStatusesEnum.SYNCED)
    }
  }
}
