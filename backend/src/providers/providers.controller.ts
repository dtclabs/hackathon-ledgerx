import { Body, Controller, Get, NotFoundException, Param, Post, ValidationPipe } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SignMessage } from '../shared/constants'
import { Account } from '../shared/entity-services/account/account.entity'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { EmailEntityService } from '../shared/entity-services/providers/email.entity-service'
import { TwitterEntityService } from '../shared/entity-services/providers/twitter.entity-service'
import { AuthWallet } from '../shared/entity-services/providers/wallet.entity'
import { WalletsEntityService } from '../shared/entity-services/providers/wallets.entity-service'
import { AddressPipe } from '../shared/pipes/address.pipe'
import { CreateWalletDto } from './interfaces'

@ApiTags('providers')
@Controller('providers')
export class ProvidersController {
  constructor(
    private accountsService: AccountsEntityService,
    private walletsService: WalletsEntityService,
    private emailService: EmailEntityService,
    private twitterService: TwitterEntityService
  ) {}

  @Get('wallet/:address')
  async get(@Param('address', new AddressPipe()) address: string) {
    const wallet = await this.walletsService.findOneByAddress(address)
    if (wallet) {
      wallet.nonce = `${SignMessage} (${wallet.nonce})`
      return wallet
    }

    throw new NotFoundException()
  }

  @Post('wallet')
  async post(@Body(new ValidationPipe()) createWalletDto: CreateWalletDto) {
    let wallet = await this.walletsService.findOneByAddress(createWalletDto.address)
    if (wallet) {
      wallet.nonce = `${SignMessage} (${wallet.nonce})`
      return wallet
    }
    const isNewAccount = true
    wallet = new AuthWallet()
    wallet.address = createWalletDto.address
    const nonce = this.walletsService.generateNonce()
    wallet.nonce = nonce

    const account = new Account()
    account.name = createWalletDto.address
    account.firstName = createWalletDto.firstName
    account.lastName = createWalletDto.lastName
    account.agreementSignedAt = createWalletDto.agreementSignedAt
    account.walletAccounts = [wallet]

    await this.walletsService.add(wallet)
    await this.accountsService.create(account)
    wallet.nonce = `${SignMessage} (${nonce})`

    return { ...wallet, isNewAccount }
  }
}
