import { Module } from '@nestjs/common'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { FeatureWaitlistRequestsEntityModule } from '../shared/entity-services/feature-waitlist-requests/feature-waitlist-request.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { FeatureWaitlistRequestsController } from './feature-waitlist-requests.controller'

@Module({
  imports: [FeatureWaitlistRequestsEntityModule, AccountsEntityModule, MembersEntityModule],
  controllers: [FeatureWaitlistRequestsController]
})
export class FeatureWaitlistRequestsModule {}
