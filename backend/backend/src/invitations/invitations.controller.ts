import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { ILike } from 'typeorm'
import { JwtPayload } from '../auth/interfaces'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { INVITATION_EXPIRED } from '../shared/constants'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { accessControlHelper } from '../shared/helpers/access-control.helper'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { Invitation } from '../shared/entity-services/invitations/invitation.entity'
import { InvitationsEntityService } from '../shared/entity-services/invitations/invitations.entity-service'
import { MembersEntityService } from '../shared/entity-services/members/members.entity-service'
import { OrganizationsEntityService } from '../shared/entity-services/organizations/organizations.entity-service'
import { AuthEmail } from '../shared/entity-services/providers/email.entity'
import { EmailEntityService } from '../shared/entity-services/providers/email.entity-service'
import { AuthWallet } from '../shared/entity-services/providers/wallet.entity'
import { WalletsEntityService } from '../shared/entity-services/providers/wallets.entity-service'
import { RolesEntityService } from '../shared/entity-services/roles/roles.entity-service'
import { PaginationParams } from '../core/interfaces'
import { Action, Resource } from '../permissions/interfaces'
import { ConfirmInvitationDto, CreateInvitationDto, InvitationStatus } from './interface'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'

@ApiTags('invitations')
@ApiBearerAuth()
@RequirePermissionResource(Resource.INVITATIONS)
@RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.INVITATIONS)
@UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
@Controller()
export class InvitationsController {
  constructor(
    private invitationsService: InvitationsEntityService,
    private rolesService: RolesEntityService,
    private organizationsService: OrganizationsEntityService,
    private membersService: MembersEntityService,
    private accountsService: AccountsEntityService,
    private walletsService: WalletsEntityService,
    private emailService: EmailEntityService
  ) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getAll(@Query() query: PaginationParams, @Param('organizationId') organizationId: string) {
    const res = await this.invitationsService.getAllPagingInvitation(query, organizationId)
    const now = new Date()
    res.items = res.items.map((item) => {
      if (item.expiredAt <= now && item.status === InvitationStatus.INVITED) {
        item.status = InvitationStatus.EXPIRED
        this.invitationsService.update(item)
      }

      return item
    })

    return res
  }

  @Get(':id/verify')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async checkToken(@Param('organizationId') organizationId: string, @Param('id') id: string, @Req() req) {
    const findOptions = this.getFindOptions(req.user, id, organizationId)
    const invitation = await this.invitationsService.findOne({
      where: findOptions,
      relations: ['organization', 'role']
    })
    const now = new Date()

    if (invitation && invitation.expiredAt > now) {
      return invitation
    }

    throw new NotFoundException()
  }

  @Post(':id/confirm')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async confirm(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Req() req,
    @Body(new ValidationPipe()) confirmInvitationDto: ConfirmInvitationDto
  ) {
    const { accountId } = req.user

    const findOptions = this.getFindOptions(req.user, id, organizationId)
    const invitation = await this.invitationsService.findOne({
      where: findOptions,
      relations: ['organization', 'role']
    })
    const now = new Date()

    if (invitation && invitation.expiredAt > now) {
      const account = await this.accountsService.findOne({ where: { id: accountId } })
      const newMember = await this.membersService.createNewMember({
        organization: invitation.organization,
        account: account,
        role: invitation.role
      })

      invitation.status = InvitationStatus.ACTIVE
      invitation.deletedAt = new Date()
      await this.invitationsService.update(invitation)
      return newMember
    }

    throw new NotFoundException()
  }

  @Post(':id/reject')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async reject(@Param('organizationId') organizationId: string, @Param('id') id: string, @Req() req) {
    const findOptions = this.getFindOptions(req.user, id, organizationId)
    const invitation = await this.invitationsService.findOne({ where: findOptions })
    const now = new Date()

    if (invitation && invitation.expiredAt > now) {
      invitation.status = InvitationStatus.REJECTED
      await this.invitationsService.update(invitation)
      return invitation
    }

    throw new NotFoundException()
  }

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async create(
    @Param('organizationId') organizationPublicId: string,
    @Body(new ValidationPipe()) createInvitationDto: CreateInvitationDto,
    @AccountId() accountId: string
  ) {
    const existInvitation = await this.invitationsService.findActiveInvite({
      email: createInvitationDto.email,
      address: createInvitationDto.address,
      organizationPublicId: organizationPublicId
    })
    if (existInvitation) {
      throw new BadRequestException('User already invited')
    }

    await this.validateIfMemberExists(createInvitationDto, organizationPublicId)

    const organization = await this.organizationsService.findByPublicId(organizationPublicId)
    const currentMember = await this.membersService.findByAccountAndOrganizationPublicId(
      organizationPublicId,
      accountId,
      {
        account: true,
        role: true
      }
    )

    if (
      !accessControlHelper.canUserSetRole({
        currentUserRole: currentMember.role,
        changeToRole: createInvitationDto.role
      })
    ) {
      throw new ForbiddenException(`You are not allowed to set this role`)
    }

    if (!currentMember) {
      throw new NotFoundException(`Can not find member`)
    }
    const role = await this.rolesService.findOne({ where: { name: createInvitationDto.role } })
    const invitation = Invitation.create({
      role,
      organization,
      email: createInvitationDto.email,
      firstName: createInvitationDto.firstName,
      lastName: createInvitationDto.lastName,
      address: createInvitationDto.address,
      status: InvitationStatus.INVITED,
      invitedBy: currentMember,
      message: createInvitationDto.message
    })

    await this.invitationsService.create(invitation)

    return invitation
  }

  private async validateIfMemberExists(createInvitationDto: CreateInvitationDto, organizationId: string) {
    let auth: AuthEmail | AuthWallet | null = null

    if (createInvitationDto.email) {
      auth = await this.emailService.findOneByEmail(createInvitationDto.email)
    } else if (createInvitationDto.address) {
      auth = await this.walletsService.findAvailableWallet(createInvitationDto.address)
    }

    if (auth) {
      const member = await this.membersService.getByOrganizationIdAndAccountId(organizationId, auth.account.id, true)
      if (member) {
        if (member.deletedAt) {
          throw new BadRequestException(`Member is deactivated`)
        }
        throw new BadRequestException('Member already exists')
      }
    }
  }

  @Put(':id/resend')
  @RequirePermissionAction(Action.UPDATE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async resend(@Param('id') invitationId: string) {
    const invitation = await this.invitationsService.findOne({
      where: {
        publicId: invitationId
      }
    })

    if (!invitation) {
      throw new NotFoundException()
    }

    invitation.status = InvitationStatus.INVITED
    const now = new Date()
    now.setHours(now.getHours() + INVITATION_EXPIRED)
    invitation.expiredAt = now
    invitation.deletedAt = null
    await this.invitationsService.update(invitation)

    return invitation
  }

  // @Put(':organizationId')
  // @RequirePermissionAction(Action.UPDATE)
  // @ApiParam({ name: 'organizationId', type: 'string' })
  // async update(
  //   @Param('organizationId') organizationId: string,
  //   @Body(new ValidationPipe()) updateInvitationDto: UpdateInvitationDto
  // ) {
  //   const invitation = await this.invitationsService.findOne({
  //     where: [
  //       {
  //         publicId: updateInvitationDto.id,
  //         organization: {
  //           publicId: organizationId
  //         },
  //         status: InvitationStatus.EXPIRED
  //       },
  //       {
  //         publicId: updateInvitationDto.id,
  //         organization: {
  //           publicId: organizationId
  //         },
  //         status: InvitationStatus.INVITED
  //       }
  //     ],
  //     relations: ['organization', 'role']
  //   })
  //   if (!invitation) {
  //     throw new NotFoundException()
  //   }
  //
  //   invitation.email = updateInvitationDto.email
  //   invitation.fullName = updateInvitationDto.fullName
  //   invitation.address = updateInvitationDto.address
  //   invitation.status = InvitationStatus.INVITED
  //   const now = new Date()
  //   now.setHours(now.getHours() + INVITATION_EXPIRED)
  //   invitation.expiredAt = now
  //   await this.invitationsService.create(invitation)
  //
  //   return invitation
  // }

  @Delete(':id')
  @RequirePermissionAction(Action.DELETE)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async delete(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    const invitation = await this.invitationsService.findOne({
      where: {
        publicId: id,
        organization: {
          publicId: organizationId
        }
      },
      relations: ['organization']
    })

    if (invitation) {
      return this.invitationsService.softDelete(invitation.id)
    }

    throw new NotFoundException()
  }

  getFindOptions(user: JwtPayload, id: string, organizationId: string) {
    if (user.verifierId) {
      return {
        email: ILike(user.verifierId),
        publicId: id,
        status: InvitationStatus.INVITED,
        organization: {
          publicId: organizationId
        }
      }
    }

    return {
      address: ILike(user.address),
      publicId: id,
      status: InvitationStatus.INVITED,
      organization: {
        publicId: organizationId
      }
    }
  }
}
