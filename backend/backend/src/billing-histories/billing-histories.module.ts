import { Module } from '@nestjs/common'
import { BillingHistoriesEntityModule } from '../shared/entity-services/billing-histories/billing-histories.entity.module'
import { BillingHistoriesController } from './billing-histories.controller'
import { BillingHistoriesDomainService } from './billing-histories.domain.service'
import { FilesModule } from '../files/files.module'

@Module({
  imports: [BillingHistoriesEntityModule, FilesModule],
  controllers: [BillingHistoriesController],
  providers: [BillingHistoriesDomainService],
  exports: []
})
export class BillingHistoriesModule {}
