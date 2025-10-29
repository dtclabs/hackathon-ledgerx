import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IntegrationSyncRequest } from './integration-sync-request.entity'
import { IntegrationSyncRequestsEntityService } from './integration-sync-requests.entity.service'

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationSyncRequest])],
  providers: [IntegrationSyncRequestsEntityService],
  exports: [TypeOrmModule, IntegrationSyncRequestsEntityService]
})
export class IntegrationSyncRequestsEntityModule {}
