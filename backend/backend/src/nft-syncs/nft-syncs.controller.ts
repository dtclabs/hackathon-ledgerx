import { BadRequestException, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { NftsDomainService } from '../domain/nfts/nfts.domain.service'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { NftSyncDto } from './interfaces'

@ApiTags('nft-syncs')
@ApiBearerAuth()
@RequirePermissionResource(Resource.NFTS)
@UseGuards(JwtAuthGuard)
@Controller()
export class NftSyncsController {
  constructor(private nftsDomainService: NftsDomainService) {}

  @Post('')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ status: 200, type: NftSyncDto })
  async sync(@OrganizationId() organizationId: string): Promise<NftSyncDto> {
    throw new BadRequestException('This feature is now deprecated')
    const nftOrganizationSync = await this.nftsDomainService.syncOrganization(organizationId)

    return NftSyncDto.map(nftOrganizationSync)
  }

  @Get('/latest')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ status: 200, type: NftSyncDto })
  async getLatestSync(@OrganizationId() organizationId: string): Promise<NftSyncDto> {
    const nftOrganizationSync = await this.nftsDomainService.getLatestSyncJobByOrganization(organizationId)

    return NftSyncDto.map(nftOrganizationSync)
  }
}
