import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PaginationParams } from '../core/interfaces'
import { IntegrationEntityService } from '../shared/entity-services/integration/integration.entity-service'

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class IntegrationsController {
  constructor(private integrationEntityService: IntegrationEntityService) {}
  @Get()
  async getIntegrations(@Query() query: PaginationParams) {
    const result = await this.integrationEntityService.getAllPaging(query, [])
    return result
  }
}
