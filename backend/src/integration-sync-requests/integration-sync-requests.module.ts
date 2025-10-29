import { Module } from '@nestjs/common'
import { IntegrationSyncRequestsEntityModule } from '../shared/entity-services/integration-sync-requests/integration-sync-requests.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { IntegrationSyncRequestsController } from './integration-sync-requests.controller'
import { IntegrationSyncRequestsService } from './integration-sync-requests.service'

@Module({
  imports: [IntegrationSyncRequestsEntityModule, MembersEntityModule],
  controllers: [IntegrationSyncRequestsController],
  providers: [IntegrationSyncRequestsService]
})
export class IntegrationSyncRequestsModule {}
