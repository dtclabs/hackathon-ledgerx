import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception'
import { accessControlHelper } from '../shared/helpers/access-control.helper'
import { ContactProvidersService } from '../shared/entity-services/contacts/contacts/contacts.entity-service'
import { MemberAddress } from '../shared/entity-services/members/addresses/address.entity'
import { MemberAddressesEntityService } from '../shared/entity-services/members/addresses/addresses.entity-service'
import { MemberContact } from '../shared/entity-services/members/contacts/member-contact.entity'
import { MemberContactsEntityService } from '../shared/entity-services/members/contacts/member-contact.entity-service'
import { MemberProfileEntityService } from '../shared/entity-services/members/member-profile.entity-service'
import { Member } from '../shared/entity-services/members/member.entity'
import { MembersEntityService } from '../shared/entity-services/members/members.entity-service'
import { Role } from '../shared/entity-services/roles/role.entity'
import { RolesEntityService } from '../shared/entity-services/roles/roles.entity-service'
import { TokensEntityService } from '../shared/entity-services/tokens/tokens.entity-service'
import { PaginationResponse } from '../core/interfaces'
import { ERole } from '../roles/interfaces'
import { AddressDto, MemberDto, MemberQueryParams, ProfileDto, UpdateProfileDto } from './index'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { DeepPartial } from 'typeorm'
import {
  EntityTypeEnum,
  OrganizationAddressesService
} from '../shared/entity-services/contacts/organization-addresses.service'
import { MemberProfile } from '../shared/entity-services/members/member-profile.entity'

@Injectable()
export class MemberDomainService {
  constructor(
    private membersService: MembersEntityService,
    private memberProfileService: MemberProfileEntityService,
    private memberContactsService: MemberContactsEntityService,
    private memberAddressesService: MemberAddressesEntityService,
    private contactProvidersService: ContactProvidersService,
    private rolesService: RolesEntityService,
    private tokensService: TokensEntityService,
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private organizationAddressesService: OrganizationAddressesService
  ) {}

  async getAllPagingDto(
    paginationParams: MemberQueryParams,
    organizationId: string
  ): Promise<PaginationResponse<MemberDto>> {
    const membersPaginationResponse = await this.membersService.getAllPagingMember(paginationParams, organizationId)

    return {
      ...membersPaginationResponse,
      items: membersPaginationResponse.items.map((item) => MemberDto.map(item))
    }
  }

  async canUserModifyMember(param: { organizationPublicId: string; currentUserRole: Role; memberId: string }) {
    const member = await this.getMemberByPublicIdAndOrganizationPublicId(param.organizationPublicId, param.memberId, [
      'account',
      'role',
      'organization',
      'account.walletAccounts',
      'account.emailAccounts'
    ])

    if (!member) {
      throw new NotFoundException(`Can not find member`)
    }

    switch (param.currentUserRole.name) {
      case ERole.Owner: {
        if (member.role.name === ERole.Owner) {
          throw new ForbiddenException(`You are not allowed to modify this user`)
        }
        return member
      }
      case ERole.Admin: {
        if (member.role.name === ERole.Employee) {
          return member
        }
      }
    }
    throw new ForbiddenException(`You are not allowed to modify this user`)
  }

  private async getMemberByPublicIdAndOrganizationPublicId(
    organizationPublicId: string,
    memberId: string,
    relations: string[]
  ) {
    return this.membersService.findOne({
      where: {
        publicId: memberId,
        organization: {
          publicId: organizationPublicId
        }
      },
      relations,
      withDeleted: true
    })
  }

  async getProfileMember(param: { organizationPublicId: string; currentMember: Member; memberPublicId: string }) {
    const member = await this.getMemberByPublicIdAndOrganizationPublicId(
      param.organizationPublicId,
      param.memberPublicId,
      [
        'role',
        'organization',
        'account',
        'profile',
        'profile.addresses',
        'profile.contacts',
        'profile.contacts.contactProvider'
      ]
    )

    if (!member) {
      throw new NotFoundException(`Can not find member`)
    }

    if ([ERole.Admin, ERole.Owner].includes(param.currentMember.role.name)) {
      return member
    } else if (member.id === param.currentMember.id) {
      return member
    }

    throw new ForbiddenException(`Can not get access`)
  }

  async getMemberByAccountAndOrganizationPublicId(organizationPublicId: string, accountId: string) {
    return await this.membersService.findByAccountAndOrganizationPublicId(organizationPublicId, accountId, {
      account: {
        walletAccounts: true,
        emailAccounts: true
      },
      role: true,
      organization: true
    })
  }

  async getMemberProfileByAccount(organizationPublicId: string, accountId: string) {
    return await this.membersService.findByAccountAndOrganizationPublicId(organizationPublicId, accountId, {
      role: true,
      organization: true,
      account: true,
      profile: {
        addresses: {
          token: true,
          cryptocurrency: true
        },
        contacts: {
          contactProvider: true
        }
      }
    })
  }

  async updateRole(param: { role: ERole; member: Member }) {
    const role = await this.rolesService.getByName(param.role)
    if (!role) {
      throw new BadRequestException(`Can not find role`)
    }
    await this.membersService.update({
      id: param.member.id,
      role
    })

    return MemberDto.map({
      ...param.member,
      role
    })
  }

  async deactivate(member: Member, deactivatedBy: string) {
    const updatedMember = await this.membersService.update({
      id: member.id,
      deletedAt: new Date(),
      deletedBy: {
        id: deactivatedBy
      }
    })
    return MemberDto.map({
      ...member,
      ...updatedMember
    })
  }

  async activate(member: Member) {
    const updatedMember = await this.membersService.update({
      id: member.id,
      deletedAt: null,
      deletedBy: null
    })
    return MemberDto.map({
      ...member,
      ...updatedMember
    })
  }

  async updateProfile(member: Member, params: UpdateProfileDto): Promise<ProfileDto> {
    const addresses: DeepPartial<MemberAddress>[] = []
    const contacts: DeepPartial<MemberContact>[] = []

    await this.validateRecipientAddressesUniqueness(member.profile, params.addresses, member.organization.id)

    for (const wallet of params.addresses) {
      let memberAddress: DeepPartial<MemberAddress>
      if (wallet.cryptocurrencySymbol) {
        const cryptocurrency = await this.cryptocurrenciesService.getBySymbol(wallet.cryptocurrencySymbol)
        if (!cryptocurrency) {
          throw new BadRequestException(`Can not find cryptocurrency ${wallet.cryptocurrencySymbol}`)
        }
        const token = await this.tokensService.getBySymbol(cryptocurrency.symbol)
        memberAddress = MemberAddress.create({
          address: wallet.address,
          memberProfileId: member.profile.id,
          blockchainId: wallet.blockchainId,
          cryptocurrencyId: cryptocurrency.id,
          tokenId: token?.id
        })
      } else {
        memberAddress = MemberAddress.create({
          address: wallet.address,
          memberProfileId: member.profile.id,
          blockchainId: wallet.blockchainId,
          cryptocurrencyId: null,
          tokenId: null
        })
      }

      await this.memberAddressesService.create(memberAddress)
      addresses.push(memberAddress)
    }

    for (const contact of params.contacts) {
      const provider = await this.contactProvidersService.get(contact.providerId)
      if (!provider) {
        throw new BadRequestException(`Can not find contact provider ${contact.providerId}`)
      }
      const memberContact = MemberContact.create({
        content: contact.content,
        profileId: member.profile.id,
        contactProviderId: contact.providerId
      })
      await this.memberContactsService.create(memberContact)
      contacts.push(memberContact)
    }

    const memberProfile = await this.memberProfileService.update({
      ...member.profile,
      addresses,
      contacts
    })

    return ProfileDto.map({
      ...member,
      profile: memberProfile
    })
  }

  canUserUpdateRole(param: { currentUserRole: Role; changeToRole: ERole }) {
    if (!accessControlHelper.canUserSetRole(param)) {
      throw new ForbiddenException(`You are not allowed to set this role`)
    }
  }

  private async validateRecipientAddressesUniqueness(
    memberProfile: MemberProfile,
    wallets: AddressDto[],
    organizationId: string
  ) {
    // find duplicates in the wallets array by properties "address" and "blockchainId" and throw an error if found
    const duplicates = wallets.filter(
      (wallet, index) =>
        index !== wallets.findIndex((otherWallet) => this.isRecipientAddressUnique(wallet, otherWallet))
    )
    if (duplicates.length > 0) {
      throw new BadRequestException('Duplicate addresses in the same member profile')
    }

    for (const wallet of wallets) {
      const validationResponse = await this.organizationAddressesService.getAddressLocation(
        wallet.address,
        wallet.blockchainId,
        organizationId
      )

      if (validationResponse?.isNewOrSame(memberProfile, EntityTypeEnum.MEMBERS)) {
        continue
      }

      if (!!validationResponse) {
        throw new BadRequestException(`This address exists in '${validationResponse.message}'.`)
      }
    }
  }

  private isRecipientAddressUnique(
    a: { address: string; blockchainId: string },
    b: {
      address: string
      blockchainId: string
    }
  ) {
    return a.address.toLowerCase() === b.address.toLowerCase() && a.blockchainId === b.blockchainId
  }
}
