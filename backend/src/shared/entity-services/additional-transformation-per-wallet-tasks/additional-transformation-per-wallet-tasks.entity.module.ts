import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdditionalTransformationPerWalletTask } from './additional-transformation-per-wallet-task.entity'
import { AdditionalTransformationPerWalletTasksEntityService } from './additional-transformation-per-wallet-tasks.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalTransformationPerWalletTask])],
  providers: [AdditionalTransformationPerWalletTasksEntityService],
  exports: [TypeOrmModule, AdditionalTransformationPerWalletTasksEntityService]
})
export class AdditionalTransformationPerWalletTasksEntityModule {}
