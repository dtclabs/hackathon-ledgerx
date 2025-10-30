import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { ApiOkResponsePaginated } from '../shared/decorators/api.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { NftAggregateDto, NftDto, NftQueryParams } from './interfaces'
import { NftsControllerService } from './nfts.controller.service'

@ApiTags('nfts')
@ApiBearerAuth()
@RequirePermissionResource(Resource.NFTS)
@UseGuards(JwtAuthGuard)
@Controller()
export class NftsController {
  constructor(private nftsControllerService: NftsControllerService) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponsePaginated(NftDto)
  async getList(@Query() query: NftQueryParams, @OrganizationId() organizationId: string) {
    return this.nftsControllerService.getAllNftPaging(organizationId, query)
  }

  @Get('aggregate')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: NftAggregateDto })
  async getAggregate(@Query() query: NftQueryParams, @OrganizationId() organizationId: string) {
    return this.nftsControllerService.getNftAggregate(organizationId, query)
  }

  @Get(':id')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: NftDto })
  async getNft(@Param('id') publicId: string, @OrganizationId() organizationId: string) {
    return await this.nftsControllerService.getNftByPublicId(organizationId, publicId)
  }
}
