import { forwardRef, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AccountsModule } from '../accounts/accounts.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { MembersEntityModule } from '../shared/entity-services/members/members.entity.module'
import { ProvidersEntityModule } from '../shared/entity-services/providers/providers.entity.module'
import { OrganizationsModule } from '../organizations/organizations.module'
import { RolesModule } from '../roles/roles.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { jwtConstants } from './constants'
import { ConfigModule } from '@nestjs/config'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtStrategy } from './jwt.strategy'
import { LoggerModule } from '../shared/logger/logger.module'
import { InternalAuthGuard } from './internal-auth.guard'
import { AuthWhitelistsEntityModule } from '../shared/entity-services/auth-whitelists/auth-whitelists.entity.module'
import { HttpModule } from '@nestjs/axios'
import { Auth0Module } from '../domain/integrations/auth0/auth0.module'

@Module({
  imports: [
    ConfigModule,
    OrganizationsModule,
    LoggerModule,
    PassportModule,
    RolesModule,
    AccountsEntityModule,
    ProvidersEntityModule,
    AuthWhitelistsEntityModule,
    MembersEntityModule,
    HttpModule,
    forwardRef(() => AccountsModule),
    JwtModule.register({
      secret: jwtConstants.secret
    }),
    Auth0Module
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, InternalAuthGuard],
  exports: [AuthService]
})
export class AuthModule {}
