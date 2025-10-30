import { forwardRef, Module } from '@nestjs/common'
import { ProvidersController } from './providers.controller'
import { AuthModule } from '../auth/auth.module'
import { AccountsEntityModule } from '../shared/entity-services/account/accounts.entity.module'
import { ProvidersEntityModule } from '../shared/entity-services/providers/providers.entity.module'

@Module({
  imports: [AccountsEntityModule, ProvidersEntityModule, forwardRef(() => AuthModule)],
  providers: [],
  controllers: [ProvidersController],
  exports: []
})
export class ProvidersModule {}
