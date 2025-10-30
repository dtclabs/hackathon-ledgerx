import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IntegrationWhitelistRequest } from './integration-whitelist-requests.entity'
import { IntegrationWhitelistRequestEntityService } from './integration-whitelist-requests.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationWhitelistRequest])],
  providers: [IntegrationWhitelistRequestEntityService],
  exports: [TypeOrmModule, IntegrationWhitelistRequestEntityService]
})
export class IntegrationWhitelistRequestEntityModule {}
