import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ILike } from 'typeorm'
import { AuthService } from '../auth/auth.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { ERole } from '../roles/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { NoAuth } from '../shared/decorators/no-auth.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { ChartOfAccountMappingsEntityService } from '../shared/entity-services/chart-of-account-mapping/chart-of-account-mappings.entity-service'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { OrganizationAddressesService } from '../shared/entity-services/contacts/organization-addresses.service'
import { CountriesEntityService } from '../shared/entity-services/countries/countries.entity-service'
import { FiatCurrenciesEntityService } from '../shared/entity-services/fiat-currencies/fiat-currencies.entity-service'
import { CostBasisCalculationMethod } from '../shared/entity-services/gains-losses/interfaces'
import { MembersEntityService } from '../shared/entity-services/members/members.entity-service'
import { OrganizationOnboarding } from '../shared/entity-services/organization-onboarding/organization-onboarding.entity'
import { OrganizationOnboardingEntityService } from '../shared/entity-services/organization-onboarding/organization-onboarding.entity-service'
import { OrganizationSetting } from '../shared/entity-services/organization-settings/organization-setting.entity'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { OrganizationTrialsEntityService } from '../shared/entity-services/organization-trials/organization-trials.entity-service'
import { Organization } from '../shared/entity-services/organizations/organization.entity'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { RolesEntityService } from '../shared/entity-services/roles/roles.entity-service'
import { TimezonesEntityService } from '../shared/entity-services/timezones/timezones.entity-service'
import { WalletGroup } from '../shared/entity-services/wallet-groups/wallet-group.entity'
import { WalletGroupsEntityService } from '../shared/entity-services/wallet-groups/wallet-groups.entity-service'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { CreateOrganizationDto, PublicOrganizationDto, UpdateOrganizationDto, ValidateAddressDto } from './interfaces'
import { FeatureFlagsEntityService } from '../shared/entity-services/feature-flags/feature-flags.entity-service'
import { SubscriptionsEntityService } from '../shared/entity-services/subscriptions/subscriptions.entity-service'

@ApiTags('organizations')
@ApiBearerAuth()
@RequirePermissionResource(Resource.ORGANIZATIONS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizations')
export class OrganizationsController {
  DEFAULT_WALLET_GROUP_NAME = `Default Group`

  constructor(
    private organizationsService: OrganizationsEntityService,
    private memberService: MembersEntityService,
    private authsService: AuthService,
    private accountsService: AccountsEntityService,
    private rolesService: RolesEntityService,
    private organizationAddressesService: OrganizationAddressesService,
    private walletGroupsService: WalletGroupsEntityService,
    private organizationSettingsService: OrganizationSettingsEntityService,
    private fiatCurrenciesService: FiatCurrenciesEntityService,
    private timezonesService: TimezonesEntityService,
    private countriesService: CountriesEntityService,
    private orgOnboardingService: OrganizationOnboardingEntityService,
    private chartOfAccountMappingsService: ChartOfAccountMappingsEntityService,
    private chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private organizationTrialsEntityService: OrganizationTrialsEntityService,
    private subscriptionsEntityService: SubscriptionsEntityService
  ) {}

  @Get('me')
  @ApiResponse({ status: 200, type: [Organization] })
  async getMyOrganizations(@Req() req) {
    const { accountId } = req.user

    const findOptions = []
    findOptions.push({ members: { account: { id: accountId } } })

    const organizations = await this.organizationsService.find({
      where: findOptions,
      relations: ['members', 'members.role', 'members.role.permissions']
    })

    return organizations
  }

  @Get(':id/public')
  @NoAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: [PublicOrganizationDto] })
  async getPublicOrganization(@Param('id', new ParseUUIDPipe()) organizationId: string) {
    const organization = await this.organizationsService.findByPublicId(organizationId)

    if (organization) {
      return PublicOrganizationDto.map({ organization: organization })
    }

    throw new NotFoundException()
  }

  @Post(':id/public')
  @NoAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: [PublicOrganizationDto] })
  async getAndValidatePublicOrganization(
    @Param('id', new ParseUUIDPipe()) publicId: string,
    @Body(new ValidationPipe()) validateAddressDto: ValidateAddressDto
  ) {
    const organization = await this.organizationsService.findByPublicId(publicId)

    if (organization) {
      const isAddressValid = await this.organizationAddressesService.isWallet(
        validateAddressDto.address,
        organization.id
      )

      if (!isAddressValid) {
        throw new BadRequestException('Address is not valid')
      }

      return PublicOrganizationDto.map({ organization: organization })
    }

    throw new NotFoundException()
  }

  @Get('connect/:organizationId')
  @ApiResponse({ status: 200 })
  async connectOrganization(@Param('organizationId') organizationId: string, @Req() req) {
    const { verifierId, address, authId, walletId, accountId, provider, roles } = req.user

    const findOptions = []
    findOptions.push({ members: { account: { id: accountId } }, publicId: organizationId })

    const organization = await this.organizationsService.findOne({
      where: findOptions,
      relations: ['members']
    })

    if (!organization) {
      throw new ForbiddenException('Forbidden resource')
    }

    const account = await this.accountsService.findOne({ where: { id: accountId } })
    account.activeOrganizationId = organizationId
    await this.accountsService.create(account)

    const accessToken = this.authsService.generateAccessToken({
      verifierId,
      address,
      walletId,
      authId,
      accountId,
      provider,
      roles,
      organizationId
    })

    return {
      accessToken,
      organization
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: Organization })
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const organization = await this.organizationsService.findByPublicId(id)
    if (organization) {
      return organization
    }

    throw new NotFoundException()
  }

  @Post()
  @ApiResponse({ status: 200, type: Organization })
  async create(@Body() createOrganizationDto: CreateOrganizationDto, @AccountId() accountId: string) {
    const organizations = await this.organizationsService.find({
      where: { members: { account: { id: accountId } }, name: ILike(`${createOrganizationDto.name.trim()}`) }
    })

    if (organizations.length) {
      throw new BadRequestException(
        'You have an organisation with the same name, please pick another name for this organisation'
      )
    }

    createOrganizationDto.members = []

    const account = await this.accountsService.findOne({ where: { id: accountId } })
    const role = await this.rolesService.findOne({ where: { name: ERole.Owner } })

    const member = await this.memberService.createNewMember({
      organization: null,
      account,
      role
    })
    createOrganizationDto.members.push(member)

    const organization = new Organization()

    organization.name = createOrganizationDto.name
    organization.type = createOrganizationDto.type
    organization.members = createOrganizationDto.members
    const newOrganization = await this.organizationsService.create(organization)

    if (createOrganizationDto.contacts) {
      const organizationOnboarding = new OrganizationOnboarding()
      organizationOnboarding.contact = createOrganizationDto.contacts
      organizationOnboarding.organizationId = newOrganization.publicId
      organizationOnboarding.jobTitle = createOrganizationDto.jobTitle
      await this.orgOnboardingService.create(organizationOnboarding)
    }

    const defaultWalletGroup = WalletGroup.create({
      name: this.DEFAULT_WALLET_GROUP_NAME,
      organizationId: newOrganization.id
    })
    await this.walletGroupsService.create(defaultWalletGroup)

    const currency = await this.fiatCurrenciesService.getDefault()
    const timezone = await this.timezonesService.getDefault()
    const country = await this.countriesService.getDefault()

    const setting = OrganizationSetting.create({
      organization: newOrganization,
      fiatCurrency: currency,
      costBasisMethod: CostBasisCalculationMethod.FIFO,
      timezone: timezone,
      country
    })

    await this.organizationSettingsService.create(setting)

    await this.chartOfAccountsEntityService.seedChartOfAccountsForOrganization(newOrganization.id)
    await this.chartOfAccountMappingsService.createDefaultMappingsForOrganization(newOrganization.id)
    // Continue creating organization_trial until officially deprecated
    await this.organizationTrialsEntityService.createDefaultForNewOrganization(newOrganization.id)
    await this.subscriptionsEntityService.createFreeTrial(newOrganization)

    return newOrganization
  }

  @Put(':id')
  @RequirePermissionAction(Action.UPDATE)
  @ApiResponse({ status: 200, type: Organization })
  async update(@Body() updateOrganizationDto: UpdateOrganizationDto, @AccountId() accountId: string) {
    const organizations = await this.organizationsService.find({
      where: { members: { account: { id: accountId } }, name: ILike(`${updateOrganizationDto.name.trim()}`) }
    })

    if (organizations.length) {
      throw new BadRequestException('You have an organisation with the same name')
    }

    const organization = await this.organizationsService.findByPublicId(updateOrganizationDto.id)
    if (organization) {
      organization.name = updateOrganizationDto.name
      organization.type = updateOrganizationDto.type
      return this.organizationsService.update(organization)
    }

    throw new NotFoundException()
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const organization = await this.organizationsService.findOne({
      where: { id }
    })
    if (organization) {
      return this.organizationsService.softDelete(id)
    }

    throw new NotFoundException()
  }
}
