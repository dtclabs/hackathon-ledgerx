import { Body, Controller, Get, NotFoundException, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { EProvider, JwtPayload } from '../auth/interfaces'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { JwtUser } from '../shared/decorators/jwtUser/jwt-user.decorator'
import { Account } from '../shared/entity-services/account/account.entity'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { RolesEntityService } from '../shared/entity-services/roles/roles.entity-service'
import { UpdateAccountDto } from './interfaces'

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private rolesService: RolesEntityService, private accountsService: AccountsEntityService) {}

  @Get()
  async getMyAccount(@Req() req) {
    return this.getMe(req.user)
  }

  @Get('me')
  async getMe(@JwtUser() user: JwtPayload) {
    const { accountId, authId, provider, walletId } = user
    const findOptions = []
    const relations = []
    switch (provider) {
      case EProvider.EMAIL:
        findOptions.push({ id: accountId, emailAccounts: { id: authId } })
        relations.push('emailAccounts')
        break
      case EProvider.TWITTER:
        findOptions.push({ id: accountId, twitterAccounts: { id: authId } })
        relations.push('twitterAccounts')
        break
      case EProvider.WALLET:
        findOptions.push({ id: accountId, walletAccounts: { id: walletId } })
        relations.push('walletAccounts')
        break
      case EProvider.XERO:
        findOptions.push({ id: accountId, xeroAccounts: { id: authId } })
        relations.push('xeroAccounts')
        break
    }
    return this.accountsService.findOne({ where: findOptions, relations })
  }

  @Put('me')
  async updateMe(
    @Body(new ValidationPipe()) updateAccountDto: UpdateAccountDto,
    @JwtUser() user: JwtPayload
  ): Promise<Account> {
    const account = await this.accountsService.findOne({ where: { id: user.accountId } })
    if (account) {
      const updateData: Partial<Account> = {}
      if (updateAccountDto.firstName || updateAccountDto.lastName) {
        updateData.firstName = updateAccountDto.firstName
        updateData.lastName = updateAccountDto.lastName
        updateData.image = updateAccountDto.image
      }

      if (updateAccountDto.agreementSignedAt && !account.agreementSignedAt) {
        updateData.agreementSignedAt = updateAccountDto.agreementSignedAt
      }

      if (Object.keys(updateData).length) {
        await this.accountsService.updateById(account.id, updateData)
      }
      return { ...account, ...updateData }
    }

    throw new NotFoundException()
  }

  // @Put(':id')
  // async put(
  //   @Body(new ValidationPipe()) updateAccountDto: UpdateAccountDto,
  //   @Param('id', new ParseUUIDPipe()) id: string
  // ) {
  //   const account = await this.accountsService.findOne({where: {id}})
  //   if (account) {
  //     account.firstName = updateAccountDto.firstName
  //     account.lastName = updateAccountDto.lastName
  //     account.image = updateAccountDto.image
  //
  //     await this.accountsService.update(account)
  //
  //     return account
  //   }
  //
  //   throw new NotFoundException()
  // }

  // @Delete(':id')
  // async delete(@Param('id', new ParseUUIDPipe()) id: string) {
  //   const account = await this.accountsService.findOne({where: {id}})
  //   if (account) {
  //     return this.accountsService.softDelete(account.id)
  //   }
  //
  //   throw new NotFoundException()
  // }
}
