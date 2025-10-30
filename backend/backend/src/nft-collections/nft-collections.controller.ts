import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { NftQueryParams } from '../nfts/interfaces'
import { Action, Resource } from '../permissions/interfaces'
import { ApiOkResponsePaginated } from '../shared/decorators/api.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { NftCollectionDropdownDto, NftCollectionDto } from './interfaces'
import { NftCollectionsControllerService } from './nft-collections.controller.service'

@ApiTags('nft-collections')
@ApiBearerAuth()
@RequirePermissionResource(Resource.NFTS)
@UseGuards(JwtAuthGuard)
@Controller()
export class NftCollectionsController {
  constructor(private nftCollectionsDomainService: NftCollectionsControllerService) {}

  @Get('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponsePaginated(NftCollectionDto)
  async getList(@OrganizationId() organizationId: string, @Query() query: NftQueryParams) {
    return await this.nftCollectionsDomainService.getAllNftCollectionPaging(query, organizationId)
  }

  @Get('dropdown')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: NftCollectionDropdownDto, isArray: true })
  async getDropdownList(@OrganizationId() organizationId: string) {
    const nftCollections = await this.nftCollectionsDomainService.getAllByOrganizationId(organizationId)

    if (nftCollections?.length) {
      return nftCollections.map((nftCollection) => NftCollectionDropdownDto.map(nftCollection))
    }
    return []
  }

  @Get(':id')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: NftCollectionDto })
  async getByPublicId(@OrganizationId() organizationId: string, @Param('id') publicId: string) {
    return await this.nftCollectionsDomainService.getByPublicIdAndOrganizationId(publicId, organizationId)
  }
}
