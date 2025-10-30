import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdditionalTransformationPerWalletGroupTask } from './additional-transformation-per-wallet-group-task.entity'
import { AdditionalTransformationPerWalletGroupTasksEntityService } from './additional-transformation-per-wallet-group-tasks.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalTransformationPerWalletGroupTask])],
  providers: [AdditionalTransformationPerWalletGroupTasksEntityService],
  exports: [TypeOrmModule, AdditionalTransformationPerWalletGroupTasksEntityService]
})
export class AdditionalTransformationPerWalletGroupTasksEntityModule {}
