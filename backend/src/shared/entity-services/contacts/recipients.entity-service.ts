import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindOptionsRelations, Repository, UpdateResult } from 'typeorm'
import { PaginationResponse } from '../../../core/interfaces'
import { ERecipientType, RecipientQuery } from '../../../recipients/interface'
import { BaseEntityService } from '../base.entity-service'
import { RecipientAddress } from './recipient-address.entity'
import { Recipient } from './recipient.entity'
import { RecipientContact } from './contacts/recipient-contact.entity'

@Injectable()
export class RecipientsEntityService extends BaseEntityService<Recipient> {
  constructor(
    @InjectRepository(Recipient)
    private recipientsRepository: Repository<Recipient>,
    @InjectRepository(RecipientAddress)
    private recipientAddressesRepository: Repository<RecipientAddress>,
    @InjectRepository(RecipientContact)
    private recipientContactRepository: Repository<RecipientContact>
  ) {
    super(recipientsRepository)
  }

  async getRecipients(options: RecipientQuery, organizationId: string): Promise<PaginationResponse<Recipient>> {
    const size = options.size || 10
    const page = options.page || 0
    const search = (options.search || '').trim()
    const order = options.order || 'updatedAt'
    const direction = (options.direction || 'DESC') as 'DESC' | 'ASC'
    const { type } = options

    let query =
      'organization.publicId = :organizationId AND (r1.address ILIKE :search OR recipient.contactName ILIKE :search OR recipient.organizationName ILIKE :search OR recipient.organizationAddress ILIKE :search)'

    if (type) {
      query += ' AND recipient.type = :type'
    }

    const [items, total] = await this.recipientsRepository
      .createQueryBuilder('recipient')
      .leftJoinAndSelect('recipient.organization', 'organization')
      .leftJoinAndSelect('recipient.recipientContacts', 'recipientContacts')
      .leftJoinAndSelect('recipientContacts.contactProvider', 'contactProvider')
      .leftJoinAndSelect('recipient.recipientAddresses', 'r1')
      .leftJoinAndSelect('recipient.recipientAddresses', 'r2')
      .leftJoinAndSelect('recipient.recipientBankAccounts', 'recipientBankAccounts')
      .leftJoinAndSelect('r2.token', 'token')
      .where(query, {
        organizationId,
        search: `%${search}%`,
        type
      })
      .orderBy(`recipient.${order}`, direction)
      .skip(size * page)
      .take(size)
      .getManyAndCount()

    return {
      totalItems: total,
      totalPages: Math.ceil(total / size),
      currentPage: page,
      items,
      limit: size
    }
  }

  async getAllRecipients(organizationId: string): Promise<Recipient[]> {
    const query = 'recipient."organization_id" = :organizationId'

    const sql = this.recipientsRepository
      .createQueryBuilder('recipient')
      .leftJoinAndSelect('recipient.recipientAddresses', 'r1')
      .where(query, {
        organizationId
      })

    return sql.getMany()
  }

  getByOrganization(organizationId: string, relations?: FindOptionsRelations<Recipient>): Promise<Recipient[]> {
    return this.recipientsRepository.find({ where: { organization: { id: organizationId } }, relations, cache: 5000 })
  }

  async getRecipientsGroupedByAddressesByOrganization(
    organizationId: string
  ): Promise<{ [address: string]: Recipient }> {
    const recipients = await this.getByOrganization(organizationId, { recipientAddresses: true })

    const recipientsGrouped: { [address: string]: Recipient } = {}

    for (const recipient of recipients) {
      for (const recipientAddress of recipient?.recipientAddresses) {
        // Preserve case for Solana addresses, lowercase for EVM
        const addressKey = recipientAddress.blockchainId?.toLowerCase().includes('solana')
          ? recipientAddress.address
          : recipientAddress.address.toLowerCase()
        recipientsGrouped[addressKey] = recipient
      }
    }

    return recipientsGrouped
  }

  getByOrganizationAndId(
    organizationId: string,
    id: string,
    relations: FindOptionsRelations<Recipient>
  ): Promise<Recipient> {
    return this.recipientsRepository.findOne({ where: { organization: { id: organizationId }, id }, relations })
  }

  getByOrganizationAndPublicId(organizationId: string, publicId: string): Promise<Recipient> {
    return this.recipientsRepository.findOne({ where: { organization: { id: organizationId }, publicId } })
  }

  getByOrganizationIdChainAndNameOrAddress(params: {
    organizationId: string
    blockchainId?: string
    nameOrAddress?: string
  }) {
    let query = 'organization.id = :organizationId'

    if (params.nameOrAddress) {
      query += ` AND (r1.address ILIKE :search OR recipient.contactName ILIKE :search OR recipient.organizationName ILIKE :search OR recipient.organizationAddress ILIKE :search)`
    }

    if (params.blockchainId) {
      query += ' AND blockchain_id= :blockchainId'
    }

    const sql = this.recipientsRepository
      .createQueryBuilder('recipient')
      .leftJoinAndSelect('recipient.organization', 'organization')
      .leftJoinAndSelect('recipient.recipientContacts', 'recipientContacts')
      .leftJoinAndSelect('recipientContacts.contactProvider', 'contactProvider')
      .leftJoinAndSelect('recipient.recipientAddresses', 'r2')
      .leftJoinAndSelect('r2.token', 'token')
      .leftJoin('recipient.recipientAddresses', 'r1')
      .where(query, {
        organizationId: params.organizationId,
        search: `%${params.nameOrAddress}%`,
        blockchainId: params.blockchainId
      })
    return sql.getMany()
  }

  async updateRecipient(
    id: string,
    params: {
      contactName: string
      organizationName: string
      organizationAddress: string
    }
  ): Promise<UpdateResult> {
    return await this.recipientsRepository.update(id, params)
  }

  saveRecipientAddress(recipientAddress: DeepPartial<RecipientAddress>): Promise<RecipientAddress> {
    return this.recipientAddressesRepository.save(recipientAddress)
  }

  softDeleteRecipientAddressById(recipientAddressId: string) {
    return this.recipientAddressesRepository.softDelete(recipientAddressId)
  }

  softDeleteRecipientContactById(recipientContactId: string) {
    return this.recipientContactRepository.softDelete(recipientContactId)
  }
}
