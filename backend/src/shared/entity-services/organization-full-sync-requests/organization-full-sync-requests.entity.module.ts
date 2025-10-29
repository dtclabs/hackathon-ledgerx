import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationFullSyncRequest } from './organization-full-sync-request.entity'
import { OrganizationFullSyncRequestsEntityService } from './organization-full-sync-requests.entity.service'
import { LoggerModule } from '../../logger/logger.module'

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationFullSyncRequest]), LoggerModule],
  controllers: [],
  providers: [OrganizationFullSyncRequestsEntityService],
  exports: [TypeOrmModule, OrganizationFullSyncRequestsEntityService]
})
export class OrganizationFullSyncRequestsEntityModule {}
