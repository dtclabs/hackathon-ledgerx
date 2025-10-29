import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PreprocessRawTask } from './preprocess-raw-task.entity'
import { PreprocessRawTasksEntityService } from './preprocess-raw-tasks.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([PreprocessRawTask])],
  providers: [PreprocessRawTasksEntityService],
  exports: [TypeOrmModule, PreprocessRawTasksEntityService]
})
export class PreprocessRawTasksEntityModule {}
