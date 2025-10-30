import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MemberAddress } from './addresses/address.entity'
import { MemberAddressesEntityService } from './addresses/addresses.entity-service'
import { MemberProfile } from './member-profile.entity'
import { MemberProfileEntityService } from './member-profile.entity-service'
import { Member } from './member.entity'
import { MembersEntityService } from './members.entity-service'
import { MemberContactsEntityService } from './contacts/member-contact.entity-service'
import { MemberContact } from './contacts/member-contact.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Member, MemberAddress, MemberProfile, MemberContact])],
  providers: [
    MembersEntityService,
    MemberAddressesEntityService,
    MemberProfileEntityService,
    MemberContactsEntityService
  ],
  exports: [
    TypeOrmModule,
    MembersEntityService,
    MemberAddressesEntityService,
    MemberProfileEntityService,
    MemberContactsEntityService
  ]
})
export class MembersEntityModule {}
