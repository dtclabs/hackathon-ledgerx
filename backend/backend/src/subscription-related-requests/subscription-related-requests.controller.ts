import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { SubscriptionRelatedRequestsDomainService } from './subscription-related-requests.domain.service'
import { CreateSubscriptionRelatedRequestDto, SubscriptionRelatedRequestDto } from './interfaces'

@ApiTags('subscription-related-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SubscriptionRelatedRequestsController {
  constructor(private readonly subscriptionRelatedRequestsDomainService: SubscriptionRelatedRequestsDomainService) {}

  @Post()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: SubscriptionRelatedRequestDto })
  async create(
    @OrganizationId() organizationId: string,
    @Body(new ValidationPipe()) createSubscriptionRelatedRequestDto: CreateSubscriptionRelatedRequestDto
  ) {
    return await this.subscriptionRelatedRequestsDomainService.create(
      organizationId,
      createSubscriptionRelatedRequestDto
    )
  }
}
