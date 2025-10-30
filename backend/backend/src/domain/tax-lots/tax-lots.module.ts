import { Module } from '@nestjs/common'
import { LoggerModule } from '../../shared/logger/logger.module'
import { TaxLotsDomainService } from './tax-lots.domain.service'
import { GainsLossesEntityModule } from '../../shared/entity-services/gains-losses/gains-losses.entity.module'
import { BlockchainsEntityModule } from '../../shared/entity-services/blockchains/blockchains.entity.module'

@Module({
  imports: [LoggerModule, GainsLossesEntityModule, BlockchainsEntityModule],
  providers: [TaxLotsDomainService],
  exports: [TaxLotsDomainService]
})
export class TaxLotsModule {}
