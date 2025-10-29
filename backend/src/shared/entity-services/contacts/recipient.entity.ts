import { ApiProperty } from '@nestjs/swagger'
import { Column, DeepPartial, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { PublicEntity } from '../../../core/entities/base.entity'
import { ERecipientType } from '../../../recipients/interface'
import { Organization } from '../organizations/organization.entity'
import { RecipientContact } from './contacts/recipient-contact.entity'
import { RecipientAddress } from './recipient-address.entity'
import { RecipientBankAccount } from '../recipient-bank-accounts/recipient-bank-account.entity'

@Entity()
@Index('IDX_chart_of_account_organization', ['organization'], {
  where: `"deleted_at" IS NULL`
})
export class Recipient extends PublicEntity {
  @Column({ name: 'organization_name', nullable: true })
  @ApiProperty()
  organizationName: string

  @Column({ name: 'organization_address', nullable: true })
  @ApiProperty()
  organizationAddress: string

  @Column({ name: 'contact_name', nullable: true })
  @ApiProperty()
  contactName: string

  @Column({ type: 'enum', enum: ERecipientType })
  @ApiProperty()
  type: ERecipientType

  @ManyToOne(() => Organization, (organization) => organization.recipients)
  @JoinColumn({ name: 'organization_id' })
  @ApiProperty({ type: () => Organization })
  organization: Organization

  @OneToMany(() => RecipientContact, (contact) => contact.recipient)
  @ApiProperty()
  recipientContacts: RecipientContact[]

  @OneToMany(() => RecipientAddress, (address) => address.recipient)
  recipientAddresses: RecipientAddress[]

  @OneToMany(() => RecipientBankAccount, (recipientBankAccount) => recipientBankAccount.recipient)
  recipientBankAccounts: RecipientBankAccount[]

  static create(params: {
    organizationId: string
    organizationName: string
    organizationAddress: string
    contactName: string
    type: ERecipientType
  }): DeepPartial<Recipient> {
    const entity: DeepPartial<Recipient> = {}
    entity.organization = { id: params.organizationId }
    entity.organizationName = params.organizationName
    entity.organizationAddress = params.organizationAddress
    entity.contactName = params.contactName
    entity.type = params.type
    return entity
  }
}
