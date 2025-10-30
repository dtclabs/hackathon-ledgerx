import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IngestionProcess } from './ingestion-process.entity'
import { IngestionProcessEntityService } from './ingestion-process.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([IngestionProcess])],
  controllers: [],
  providers: [IngestionProcessEntityService],
  exports: [TypeOrmModule, IngestionProcessEntityService]
})
export class IngestionProcessEntityModule {}
