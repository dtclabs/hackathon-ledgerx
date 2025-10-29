import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { ContactsEntityService } from '../shared/entity-services/contacts/contacts.entity-service'
import { Action, Resource } from '../permissions/interfaces'
import { GetContactsParams } from './interface'

@ApiTags('contacts')
@ApiBearerAuth()
@RequirePermissionResource(Resource.RECIPIENTS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ContactsController {
  constructor(private contactsDomainService: ContactsEntityService) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: ContactDto, isArray: true })
  async getAll(@Query() query: GetContactsParams, @OrganizationId() organizationId: string) {
    return this.contactsDomainService.getByOrganizationIdAndNameOrAddress({
      organizationId,
      nameOrAddress: query.nameOrAddress
    })
  }
}
