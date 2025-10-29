import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { TokensController } from './tokens.controller'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { TokensEntityModule } from '../shared/entity-services/tokens/tokens.entity.module'

@Module({
  imports: [TokensEntityModule, forwardRef(() => AuthModule), OrganizationsEntityModule],
  controllers: [TokensController],
  providers: [],
  exports: []
})
export class TokensModule {}
