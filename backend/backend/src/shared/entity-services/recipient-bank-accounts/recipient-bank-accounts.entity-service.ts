import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, FindOptionsRelations, Repository, FindOptionsWhere } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { RecipientBankAccount } from './recipient-bank-account.entity'
import { Recipient } from '../contacts/recipient.entity'
import { FiatCurrency } from '../fiat-currencies/fiat-currency.entity'

@Injectable()
export class RecipientBankAccountsEntityService extends BaseEntityService<RecipientBankAccount> {
  constructor(
    @InjectRepository(RecipientBankAccount)
    private recipientBankAccountsRepository: Repository<RecipientBankAccount>
  ) {
    super(recipientBankAccountsRepository)
  }

  async findOneByPublicId(
    publicId: string,
    organizationId: string,
    options: {
      recipientPublicId?: string
      relations?: FindOptionsRelations<RecipientBankAccount>
    } = {}
  ): Promise<RecipientBankAccount> {
    const recipientBankAccountWhereOptions: FindOptionsWhere<RecipientBankAccount> = { publicId: publicId }
    const recipientWhereOptions: FindOptionsWhere<Recipient> = {
      organization: {
        id: organizationId
      }
    }
    if (options.recipientPublicId) recipientWhereOptions.publicId = options.recipientPublicId
    recipientBankAccountWhereOptions.recipient = recipientWhereOptions

    const relations: FindOptionsRelations<RecipientBankAccount> = options.relations
      ? {
          fiatCurrency: true,
          ...options.relations
        }
      : { fiatCurrency: true }

    return await this.recipientBankAccountsRepository.findOne({
      where: recipientBankAccountWhereOptions,
      relations: {
        fiatCurrency: true,
        ...relations
      }
    })
  }

  async findByPublicIds(publicIds: string[], organizationId: string): Promise<RecipientBankAccount[]> {
    return await this.recipientBankAccountsRepository.find({
      where: {
        publicId: In(publicIds),
        recipient: {
          organization: {
            id: organizationId
          }
        }
      }
    })
  }

  async createRecipientBankAccount(params: {
    tripleAId: string
    recipient: { id: string }
    bankName: string
    accountNumber: string
    fiatCurrency: { id: string }
  }): Promise<RecipientBankAccount> {
    console.log(params)
    const recipientBankAccount = new RecipientBankAccount()
    recipientBankAccount.tripleAId = params.tripleAId
    recipientBankAccount.recipient = params.recipient as Recipient
    recipientBankAccount.bankName = params.bankName
    recipientBankAccount.accountNumberLast4 =
      params.accountNumber.substring(0, params.accountNumber.length - 4).replace(/\d/g, '*') +
      params.accountNumber.substring(params.accountNumber.length - 4)
    recipientBankAccount.fiatCurrency = params.fiatCurrency as FiatCurrency

    return await this.recipientBankAccountsRepository.save(recipientBankAccount)
  }

  async softDeleteById(id: string) {
    return await this.recipientBankAccountsRepository.softDelete({ id: id })
  }
}
