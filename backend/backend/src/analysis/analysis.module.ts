import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalysisCreateTransaction } from './analysis-create-transaction.entity'
import { AnalysisEventTracker } from './analysis-event-tracker.entity'
import { AnalysisController } from './analysis.controller'
import { Analysis } from './analysis.entity'
import { AnalysisService } from './analysis.service'
import { AnalysisCreatePayout } from './analysis-create-payout.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Analysis, AnalysisEventTracker, AnalysisCreateTransaction, AnalysisCreatePayout])
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [TypeOrmModule, AnalysisService]
})
export class AnalysisModule {}
