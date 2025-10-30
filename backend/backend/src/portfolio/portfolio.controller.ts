import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PortfolioService } from './portfolio.service'
import { HeliusService } from './helius.service'
import { LoggerService } from '../shared/logger/logger.service'
import { WalletBalance, PnLSummary } from './interfaces'

@ApiTags('Portfolio & PnL')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly heliusService: HeliusService,
    private readonly logger: LoggerService
  ) {}

  @Get(':organizationPublicId/wallets/:walletPublicId/balance')
  @ApiOperation({
    summary: 'Get wallet balance with Helius',
    description: 'Retrieve comprehensive wallet balance including native SOL and all token balances with USD values'
  })
  @ApiParam({ name: 'organizationPublicId', description: 'Organization public ID' })
  @ApiParam({ name: 'walletPublicId', description: 'Wallet public ID' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved successfully' })
  async getWalletBalance(
    @Param('organizationPublicId') organizationPublicId: string,
    @Param('walletPublicId') walletPublicId: string
  ): Promise<WalletBalance> {
    this.logger.info('Getting wallet balance', { organizationPublicId, walletPublicId })
    
    return await this.portfolioService.getWalletBalance(organizationPublicId, walletPublicId)
  }

  @Get(':organizationPublicId/wallets/:walletPublicId/dashboard')
  @ApiOperation({
    summary: 'Get dashboard-style portfolio overview',
    description: 'Retrieve wallet portfolio data formatted like the dashboard UI with total balance, token breakdown, and percentages'
  })
  @ApiParam({ name: 'organizationPublicId', description: 'Organization public ID' })
  @ApiParam({ name: 'walletPublicId', description: 'Wallet public ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard portfolio overview retrieved successfully',
    schema: {
      example: {
        totalBalance: '$2,456,789.5 USD',
        totalBalanceRaw: 2456789.5,
        tokens: [
          {
            symbol: 'SOLANA',
            value: '$1,000,000 USD',
            valueRaw: 1000000,
            percentage: 40.70,
            color: '#9945FF'
          },
          {
            symbol: 'BONK',
            value: '$750,000 USD', 
            valueRaw: 750000,
            percentage: 30.53,
            color: '#F89C42'
          }
        ]
      }
    }
  })
  async getDashboardOverview(
    @Param('organizationPublicId') organizationPublicId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    this.logger.info('Getting dashboard portfolio overview', { organizationPublicId, walletPublicId })
    
    return await this.portfolioService.getDashboardOverview(organizationPublicId, walletPublicId)
  }

  @Get(':organizationPublicId/token-holders/:tokenSymbol')
  @ApiOperation({
    summary: 'Get token holders across organization wallets',
    description: 'Retrieve all wallets in the organization that hold a specific token with their balances and percentages'
  })
  @ApiParam({ name: 'organizationPublicId', description: 'Organization public ID' })
  @ApiParam({ name: 'tokenSymbol', description: 'Token symbol (e.g., SOL, BONK, USDC)' })
  @ApiQuery({ name: 'minBalance', required: false, description: 'Minimum token balance to include' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by: balance, percentage, walletAddress', enum: ['balance', 'percentage', 'walletAddress'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Token holders retrieved successfully',
    schema: {
      example: {
        tokenSymbol: 'SOL',
        tokenName: 'Solana',
        totalHolders: 3,
        totalTokens: 15230.45,
        totalValueUsd: 3000000,
        averageBalance: 5076.82,
        holders: [
          {
            walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            walletPublicId: 'f92dd24e-88ec-4ecd-a092-fe7cc30f19be',
            balance: 5076.14,
            valueUsd: 1000000,
            percentage: 33.33,
            priceUsd: 197.2
          }
        ]
      }
    }
  })
  async getTokenHolders(
    @Param('organizationPublicId') organizationPublicId: string,
    @Param('tokenSymbol') tokenSymbol: string,
    @Query('minBalance') minBalance?: number,
    @Query('sortBy') sortBy: 'balance' | 'percentage' | 'walletAddress' = 'balance'
  ) {
    this.logger.info('Getting token holders', { 
      organizationPublicId, 
      tokenSymbol, 
      minBalance, 
      sortBy 
    })
    
    return await this.portfolioService.getTokenHolders(organizationPublicId, tokenSymbol.toUpperCase(), {
      minBalance,
      sortBy
    })
  }

  @Post(':organizationPublicId/wallets/:walletPublicId/sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Sync wallet transactions for PnL calculation',
    description: 'Process all transactions from data-onchain-ingestor and calculate positions and PnL'
  })
  @ApiParam({ name: 'organizationPublicId', description: 'Organization public ID' })
  @ApiParam({ name: 'walletPublicId', description: 'Wallet public ID' })
  @ApiResponse({ status: 202, description: 'Sync started successfully' })
  async syncWalletTransactions(
    @Param('organizationPublicId') organizationPublicId: string,
    @Param('walletPublicId') walletPublicId: string
  ): Promise<{ message: string }> {
    this.logger.info('Starting wallet transaction sync', { organizationPublicId, walletPublicId })
    
    // Run sync in background
    this.portfolioService.syncWalletTransactions(organizationPublicId, walletPublicId)
      .catch(error => {
        this.logger.error('Failed to sync wallet transactions', error, {
          organizationPublicId,
          walletPublicId
        })
      })

    return { message: 'Sync started successfully' }
  }

  @Get(':organizationPublicId/wallets/:walletPublicId/pnl')
  @ApiOperation({
    summary: 'Get wallet PnL summary',
    description: 'Retrieve comprehensive profit and loss summary including positions, realized/unrealized PnL'
  })
  @ApiParam({ name: 'organizationPublicId', description: 'Organization public ID' })
  @ApiParam({ name: 'walletPublicId', description: 'Wallet public ID' })
  @ApiResponse({ status: 200, description: 'PnL summary retrieved successfully' })
  async getWalletPnL(
    @Param('organizationPublicId') organizationPublicId: string,
    @Param('walletPublicId') walletPublicId: string
  ): Promise<PnLSummary> {
    this.logger.info('Getting wallet PnL', { organizationPublicId, walletPublicId })
    
    return await this.portfolioService.getWalletPnL(organizationPublicId, walletPublicId)
  }

  @Get('tokens/prices')
  @ApiOperation({
    summary: 'Get token prices',
    description: 'Retrieve current USD prices for Solana tokens using Jupiter/Helius'
  })
  @ApiQuery({ name: 'mints', description: 'Comma-separated list of token mint addresses', required: true })
  @ApiResponse({ status: 200, description: 'Token prices retrieved successfully' })
  async getTokenPrices(
    @Query('mints') mints: string
  ): Promise<any> {
    this.logger.info('Getting token prices', { mints })
    
    const mintArray = mints.split(',').map(mint => mint.trim())
    return await this.heliusService.getTokenPrices(mintArray)
  }

  @Get('tokens/:mint/metadata')
  @ApiOperation({
    summary: 'Get token metadata',
    description: 'Retrieve token metadata including name, symbol, logo from Helius'
  })
  @ApiParam({ name: 'mint', description: 'Token mint address' })
  @ApiResponse({ status: 200, description: 'Token metadata retrieved successfully' })
  async getTokenMetadata(
    @Param('mint') mint: string
  ): Promise<any> {
    this.logger.info('Getting token metadata', { mint })
    
    const metadata = await this.heliusService.getTokenMetadata([mint])
    return metadata[0] || null
  }

  @Get('solana-price')
  @ApiOperation({
    summary: 'Get current SOL price',
    description: 'Retrieve current SOL price in USD'
  })
  @ApiResponse({ status: 200, description: 'SOL price retrieved successfully' })
  async getSolanaPrice(): Promise<{ price: number; timestamp: Date }> {
    const price = await this.heliusService.getSolanaPrice()
    return {
      price,
      timestamp: new Date()
    }
  }

  @Get('jupiter/tokens/:tokenAddress/info')
  @ApiOperation({
    summary: 'Get Jupiter token information',
    description: 'Retrieve comprehensive token information from Jupiter v2 search API including name, symbol, stats, and metadata'
  })
  @ApiParam({ 
    name: 'tokenAddress', 
    description: 'Token mint address (e.g., HfMbPyDdZH6QMaDDUokjYCkHxzjoGBMpgaUvpLWGbF5p)',
    example: 'HfMbPyDdZH6QMaDDUokjYCkHxzjoGBMpgaUvpLWGbF5p'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token information retrieved successfully from Jupiter - includes name, symbol, price, market cap, holder count, and other metadata'
  })
  async getJupiterTokenInfo(
    @Param('tokenAddress') tokenAddress: string
  ) {
    this.logger.info('Getting Jupiter token information', { tokenAddress })
    
    const tokenInfo = await this.heliusService.getJupiterTokenInfo(tokenAddress)
    if (!tokenInfo) {
      return { 
        error: 'Token not found',
        tokenAddress,
        message: 'No token information found in Jupiter database'
      }
    }
    
    return {
      ...tokenInfo,
      fetchedAt: new Date().toISOString()
    }
  }
}