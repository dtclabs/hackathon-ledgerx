import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RolesController } from './roles.controller'
import { Role } from '../shared/entity-services/roles/role.entity'
import { AuthModule } from '../auth/auth.module'
import { RolesEntityModule } from '../shared/entity-services/roles/roles.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    RolesEntityModule,
    MembersEntityModule,
    OrganizationsEntityModule,
    AccountsEntityModule,
    forwardRef(() => AuthModule)
  ],
  providers: [],
  controllers: [RolesController],
  exports: []
})
export class RolesModule {}
