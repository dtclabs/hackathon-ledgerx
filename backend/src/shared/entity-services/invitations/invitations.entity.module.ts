import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Invitation } from './invitation.entity'
import { InvitationsEntityService } from './invitations.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Invitation])],
  providers: [InvitationsEntityService],
  exports: [TypeOrmModule, InvitationsEntityService]
})
export class InvitationsEntityModule {}
