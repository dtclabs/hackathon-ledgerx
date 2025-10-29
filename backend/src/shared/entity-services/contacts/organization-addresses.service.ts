import { Injectable } from '@nestjs/common'
import { ILike } from 'typeorm'
import { MemberAddressesEntityService } from '../members/addresses/addresses.entity-service'
import { MemberProfile } from '../members/member-profile.entity'
import { SourceType } from '../wallets/interfaces'
import { Wallet } from '../wallets/wallet.entity'
import { WalletsEntityService } from '../wallets/wallets.entity-service'
import { Recipient } from './recipient.entity'
import { RecipientsEntityService } from './recipients.entity-service'

@Injectable()
export class OrganizationAddressesService {
  constructor(
    private walletsService: WalletsEntityService,
    private recipientsService: RecipientsEntityService,
    private memberAddressesService: MemberAddressesEntityService
  ) {}

  // TODO: to standardize the return value with address revamp
  // Return the string name of the location now and empty string if not found
  async getAddressLocation(
    address: string,
    blockchainId: string,
    organizationId: string
  ): Promise<ValidationResponse | null> {
    return this.getAddressLocationForWallet(address, organizationId)
  }

  async getAddressLocationForWallet(address: string, organizationId: string): Promise<ValidationResponse | null> {
    // Try exact match first (for Solana), then lowercase match (for EVM)
    const existWallet = await this.walletsService.findOne({
      where: [
        {
          organization: {
            id: organizationId
          },
          address: address // Exact match for Solana
        },
        {
          organization: {
            id: organizationId
          },
          address: address.toLowerCase() // Lowercase match for EVM
        }
      ]
    })

    if (existWallet) {
      if (existWallet.sourceType === SourceType.GNOSIS) {
        return new ValidationResponse(EntityTypeEnum.SAFE_SOURCE_OF_FUNDS, existWallet, 'safe wallet')
      } else {
        return new ValidationResponse(EntityTypeEnum.WALLET_SOURCE_OF_FUNDS, existWallet, 'wallets')
      }
    }

    const existRecipient = await this.recipientsService.findOne({
      where: {
        organization: {
          id: organizationId
        },
        recipientAddresses: {
          address: ILike(address)
        }
      }
    })

    if (existRecipient) {
      return new ValidationResponse(EntityTypeEnum.CONTACTS, existRecipient, 'contacts')
    }

    // For member addresses, try both original case and lowercase for compatibility
    let existMemberAddress = await this.memberAddressesService.checkAddressByOrganizationNoChain(
      address,
      organizationId
    )
    
    // If not found and it's not a Solana address, try lowercase
    if (!existMemberAddress && !this.isSolanaAddress(address)) {
      existMemberAddress = await this.memberAddressesService.checkAddressByOrganizationNoChain(
        address.toLowerCase(),
        organizationId
      )
    }

    if (existMemberAddress) {
      return new ValidationResponse(EntityTypeEnum.MEMBERS, existMemberAddress.profile, 'members')
    }

    return null
  }

  async isWallet(address: string, organizationId: string): Promise<boolean> {
    const existWallet = await this.walletsService.findOne({
      where: {
        organization: {
          id: organizationId
        },
        address: address.toLowerCase()
      }
    })

    return !!existWallet
  }

  private isSolanaAddress(address: string): boolean {
    // Solana addresses are typically 32-44 characters in base58 format
    // This is a simple heuristic - could be enhanced with actual base58 validation
    return address.length >= 32 && address.length <= 44 && 
           !/^0x[a-fA-F0-9]{40}$/.test(address) // Not an Ethereum address
  }
}

export enum EntityTypeEnum {
  WALLET_SOURCE_OF_FUNDS = 'WALLET_SOURCE_OF_FUNDS',
  WALLET = 'WALLET',
  SAFE_SOURCE_OF_FUNDS = 'SAFE_SOURCE_OF_FUNDS',
  CONTACTS = 'CONTACTS',
  MEMBERS = 'MEMBERS'
}

export class ValidationResponse {
  public entityType: EntityTypeEnum
  public entity: Recipient | MemberProfile | Wallet
  public message: string

  constructor(entityType: EntityTypeEnum, entity: Recipient | MemberProfile | Wallet, message: string) {
    this.entityType = entityType
    this.entity = entity
    this.message = message
  }

  isNewOrSame(entity: Recipient | MemberProfile, entityType: EntityTypeEnum): boolean {
    if (!this.entity) {
      return true
    }

    return this.entity.id === entity?.id && this.entityType === entityType
  }

  isNotNewOrSame(entity: Recipient | MemberProfile, entityType: EntityTypeEnum): boolean {
    return !this.isNewOrSame(entity, entityType)
  }
}
