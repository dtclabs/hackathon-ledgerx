import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { ProvidersEntityModule } from '../shared/entity-services/providers/providers.entity.module'
import { RolesEntityModule } from '../shared/entity-services/roles/roles.entity.module'
import { GroupsModule } from '../groups/groups.module'
import { AccountsController } from './accounts.controller'
import { ChainsEntityModule } from '../shared/entity-services/chains/chains.entity.module'

@Module({
  imports: [
    RolesEntityModule,
    OrganizationsEntityModule,
    AccountsEntityModule,
    ProvidersEntityModule,
    ChainsEntityModule,
    forwardRef(() => AuthModule),
    forwardRef(() => GroupsModule)
  ],
  providers: [],
  controllers: [AccountsController],
  exports: []
})
export class AccountsModule {}
