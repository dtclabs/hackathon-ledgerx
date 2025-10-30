import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { SubscriptionsService } from './subscriptions.service'
import { SubscriptionDto, SubscriptionParams } from './interface'

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: SubscriptionDto })
  async get(@OrganizationId() organizationId: string, @Query() query: SubscriptionParams) {
    return await this.subscriptionsService.getSubscription(organizationId, query.status)
  }
}
