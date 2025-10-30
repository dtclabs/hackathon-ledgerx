import { Injectable } from '@nestjs/common'
import { MembersEntityService } from '../members/members.entity-service'
import { WalletsEntityService } from '../wallets/wallets.entity-service'
import { ContactDto } from './contact'
import { RecipientsEntityService } from './recipients.entity-service'

@Injectable()
export class ContactsEntityService {
  constructor(
    private membersService: MembersEntityService,
    private recipientsService: RecipientsEntityService,
    private walletsService: WalletsEntityService
  ) {}

  async getByOrganizationIdAndNameOrAddress(params: { organizationId: string; nameOrAddress?: string }) {
    const contacts = await Promise.all([
      this.recipientsService
        .getByOrganizationIdChainAndNameOrAddress(params)
        .then((recipients) => recipients.map((recipient) => ContactDto.mapFromRecipient(recipient))),
      this.walletsService
        .getByOrganizationIdNameOrAddress(params)
        .then((sources) => sources.map((wallet) => ContactDto.mapFromWallet(wallet))),
      this.membersService
        .getByOrganizationIdChainAndNameOrAddress(params)
        .then((members) => members.map((member) => ContactDto.mapFromMember(member)))
    ])

    return contacts.flat()
  }

  async getGroupedContactDtosByAddressPerOrganization(organizationId): Promise<{ [address: string]: ContactDto }> {
    const contacts = await this.getByOrganizationIdAndNameOrAddress({ organizationId })

    return this.groupContactDtosByAddress(contacts)
  }

  groupContactDtosByAddress(contactDtos: ContactDto[]) {
    const contactsGrouped: { [address: string]: ContactDto } = {}

    for (const dto of contactDtos) {
      for (const address of dto.addresses) {
        // Preserve case for Solana addresses, lowercase for EVM
        const addressKey = this.isEvmBlockchain(address.blockchainId) 
          ? address.address.toLowerCase() 
          : address.address
        contactsGrouped[addressKey] = dto
      }
    }

    return contactsGrouped
  }

  private isEvmBlockchain(blockchainId: string | null): boolean {
    if (!blockchainId) return false
    return !blockchainId.toLowerCase().includes('solana')
  }
}
