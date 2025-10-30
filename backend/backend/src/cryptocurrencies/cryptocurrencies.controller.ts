import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Action, Resource } from '../permissions/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { CryptocurrenciesDomainService } from './cryptocurrencies.domain.service'
import { AllSolanaTokensQueryParams, CryptocurrenciesByWalletIdsQueryParams, CryptocurrencyResponseDto } from './interfaces'

@ApiTags('cryptocurrencies')
@ApiBearerAuth()
@RequirePermissionResource(Resource.CRYPTOCURRENCIES)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class CryptocurrenciesController {
  constructor(private cryptocurrenciesDomainService: CryptocurrenciesDomainService) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOperation({
    summary: 'Get supported Solana cryptocurrencies',
    description: 'Returns SOL and SPL tokens from Solana wallets only. EVM tokens are not supported.'
  })
  @ApiResponse({ status: 200, type: CryptocurrencyResponseDto, isArray: true })
  async getByWalletIds(
    @OrganizationId() organizationId: string,
    @Query() query: CryptocurrenciesByWalletIdsQueryParams
  ) {
    return await this.cryptocurrenciesDomainService.getByOrganizationAndWalletPublicIds(
      organizationId,
      query.walletIds,
      query.blockchainIds
    )
  }

  @Get('all-solana-tokens')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOperation({
    summary: 'Get all available Solana tokens',
    description: 'Returns all SOL and SPL tokens available in the system, not limited to wallet balances.'
  })
  @ApiResponse({ status: 200, type: CryptocurrencyResponseDto, isArray: true })
  async getAllSolanaTokens(
    @OrganizationId() organizationId: string,
    @Query() query: AllSolanaTokensQueryParams
  ) {
    return await this.cryptocurrenciesDomainService.getAllSolanaTokens(query.blockchainIds)
  }
}
