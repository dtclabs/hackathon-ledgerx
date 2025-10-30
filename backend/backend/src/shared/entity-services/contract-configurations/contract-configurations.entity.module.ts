import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContractConfiguration } from './contract-configuration.entity'
import { ContractConfigurationsEntityService } from './contract-configurations.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([ContractConfiguration])],
  providers: [ContractConfigurationsEntityService],
  exports: [TypeOrmModule, ContractConfigurationsEntityService]
})
export class ContractConfigurationsEntityModule {}
