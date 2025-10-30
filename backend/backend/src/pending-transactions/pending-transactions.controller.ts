import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { PendingTransactionDto, PendingTransactionsQueryParams } from './interfaces'
import { ApiTags, ApiBearerAuth, ApiParam, ApiOkResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PendingTransactionsDomainService } from './pending-transactions.domain.service'
import { PermissionsGuard } from '../shared/guards/permissions.guard'

@ApiTags('pending-transactions')
@ApiBearerAuth()
@RequirePermissionResource(Resource.PENDING_TRANSACTIONS)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class PendingTransactionsController {
  constructor(private readonly pendingTransactionsDomainService: PendingTransactionsDomainService) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: [PendingTransactionDto] })
  async getAllPending(@OrganizationId() organizationId: string, @Query() query: PendingTransactionsQueryParams) {
    return this.pendingTransactionsDomainService.getPendingTransactions(organizationId, query)
  }
}
