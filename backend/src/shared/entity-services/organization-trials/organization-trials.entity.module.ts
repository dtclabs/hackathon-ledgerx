import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationTrial } from './organization-trial.entity'
import { OrganizationTrialsEntityService } from './organization-trials.entity-service'

// This is a temporary class. Should be deleted after August 2023
@Module({
  imports: [TypeOrmModule.forFeature([OrganizationTrial])],
  providers: [OrganizationTrialsEntityService],
  exports: [TypeOrmModule, OrganizationTrialsEntityService]
})
export class OrganizationTrialsEntityModule {}
