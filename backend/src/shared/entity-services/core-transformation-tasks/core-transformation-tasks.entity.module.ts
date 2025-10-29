import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoreTransformationTask } from './core-transformation-tasks.entity'
import { CoreTransformationTasksEntityService } from './core-transformation-tasks.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([CoreTransformationTask])],
  providers: [CoreTransformationTasksEntityService],
  exports: [TypeOrmModule, CoreTransformationTasksEntityService]
})
export class CoreTransformationTasksEntityModule {}
