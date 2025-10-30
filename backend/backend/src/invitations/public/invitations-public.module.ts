import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { InvitationsEntityModule } from '../../shared/entity-services/invitations/invitations.entity.module'
import { InvitationsPublicController } from './invitations-public.controller'

@Module({
  imports: [InvitationsEntityModule, ConfigModule, HttpModule],
  controllers: [InvitationsPublicController],
  providers: [],
  exports: []
})
export class InvitationsPublicModule {}
