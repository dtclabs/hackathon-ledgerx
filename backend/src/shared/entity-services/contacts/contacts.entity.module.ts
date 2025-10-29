import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MembersEntityModule } from '../members/members.entity.module'
import { ProvidersEntityModule } from '../providers/providers.entity.module'
import { WalletsEntityModule } from '../wallets/wallets.entity.module'
import { ContactsEntityService } from './contacts.entity-service'
import { ContactProvider } from './contacts/contact.entity'
import { ContactProvidersService } from './contacts/contacts.entity-service'
import { RecipientContact } from './contacts/recipient-contact.entity'
import { RecipientContactsEntityService } from './contacts/recipient-contact.entity-service'
import { OrganizationAddressesService } from './organization-addresses.service'
import { RecipientAddress } from './recipient-address.entity'
import { Recipient } from './recipient.entity'
import { RecipientsEntityService } from './recipients.entity-service'
import { RecipientAddressesEntityService } from './recipient-addresses.entity-service'

@Module({
  imports: [
    ProvidersEntityModule,
    MembersEntityModule,
    WalletsEntityModule,
    TypeOrmModule.forFeature([Recipient, RecipientAddress, RecipientContact, ContactProvider])
  ],
  providers: [
    RecipientContactsEntityService,
    ContactProvidersService,
    RecipientsEntityService,
    RecipientAddressesEntityService,
    ContactsEntityService,
    OrganizationAddressesService
  ],
  exports: [
    TypeOrmModule,
    RecipientContactsEntityService,
    ContactProvidersService,
    RecipientsEntityService,
    RecipientAddressesEntityService,
    ContactsEntityService,
    OrganizationAddressesService
  ]
})
export class ContactsEntityModule {}
