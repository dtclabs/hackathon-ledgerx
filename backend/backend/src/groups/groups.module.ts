import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { ProvidersEntityModule } from '../shared/entity-services/providers/providers.entity.module'
import { Group } from './group.entity'
import { GroupsController } from './groups.controller'
import { GroupsService } from './groups.service'

@Module({
  imports: [
    OrganizationsEntityModule,
    MembersEntityModule,
    AccountsEntityModule,
    ProvidersEntityModule,
    TypeOrmModule.forFeature([Group]),
    forwardRef(() => AuthModule)
  ],
  providers: [GroupsService],
  controllers: [GroupsController],
  exports: [TypeOrmModule, GroupsService]
})
export class GroupsModule {}
