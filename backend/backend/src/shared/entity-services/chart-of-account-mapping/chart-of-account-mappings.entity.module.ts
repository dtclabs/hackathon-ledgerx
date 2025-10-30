import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LoggerModule } from '../../logger/logger.module'
import { ChartOfAccountMapping } from './chart-of-account-mapping.entity'
import { ChartOfAccountMappingsEntityService } from './chart-of-account-mappings.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([ChartOfAccountMapping]), LoggerModule],
  controllers: [],
  providers: [ChartOfAccountMappingsEntityService],
  exports: [TypeOrmModule, ChartOfAccountMappingsEntityService]
})
export class ChartOfAccountMappingsEntityModule {}
