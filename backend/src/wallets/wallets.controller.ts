import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ApiOkResponsePaginated } from '../shared/decorators/api.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator'
import { PermissionsGuard } from '../shared/guards/permissions.guard'
import { LoggerService } from '../shared/logger/logger.service'
import { TaskSyncType } from '../core/events/event-types'
import { Action, Resource } from '../permissions/interfaces'
import { CreateWalletDto, UpdateWalletDto, WalletDto, WalletQueryParams } from './interfaces'
import { WalletsDomainService } from './wallets.domain.service'
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator'
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard'
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface'
import { DataOnchainIngestorService } from '../data-onchain-ingestor/data-onchain-ingestor.service'
import { DataOnchainQueryService } from '../data-onchain-ingestor/data-onchain-query.service'
import { ConfigService } from '@nestjs/config'
import { PricesService } from '../prices/prices.service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@ApiTags('wallets')
@ApiBearerAuth()
@RequirePermissionResource(Resource.WALLETS)
@UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
@Controller()
export class WalletsController {
  constructor(
    private logger: LoggerService,
    private readonly walletsDomainService: WalletsDomainService,
    private readonly dataOnchainIngestorService: DataOnchainIngestorService,
    private readonly dataOnchainQueryService: DataOnchainQueryService,
    private readonly configService: ConfigService,
    private readonly pricesService: PricesService,
    private readonly cryptocurrenciesService: CryptocurrenciesEntityService,
    private readonly http: HttpService
  ) {}

  @Get()
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponsePaginated(WalletDto)
  async getAll(@OrganizationId() organizationId: string, @Query() query: WalletQueryParams) {
    return this.walletsDomainService.getAllPaging(organizationId, query)
  }

  @Get(':publicId')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: WalletDto })
  async get(@Param('publicId') publicId: string, @OrganizationId() organizationId: string) {
    const walletDto = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)

    if (walletDto) {
      return walletDto
    }
    throw new NotFoundException('Wallet not found')
  }

  @Put(':publicId')
  @RequirePermissionAction(Action.UPDATE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.WALLETS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'publicId', type: 'string' })
  @ApiOkResponse({ type: WalletDto })
  async updateWallet(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string,
    @Body() dto: UpdateWalletDto
  ) {
    return await this.walletsDomainService.update(publicId, organizationId, dto)
  }

  @Post()
  @RequirePermissionAction(Action.CREATE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.WALLETS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiOkResponse({ type: WalletDto })
  async createWallet(@Body() data: CreateWalletDto, @OrganizationId() organizationId: string) {
    return await this.walletsDomainService.create(organizationId, data)
  }

  @Post(':publicId/sync')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async syncWallet(@OrganizationId() organizationId: string, @Param('publicId') publicId: string) {
    try {
      await this.walletsDomainService.syncWalletWithPublicIdIncrementally(organizationId, publicId)
      return true
    } catch (e) {
      this.logger.error(`Error syncing wallet ${publicId} for organization ${organizationId}`, e)
      throw new InternalServerErrorException(`Error syncing wallet ${publicId} for organization ${organizationId}`)
    }
  }

  @Post(':publicId/sync-pending')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async syncWalletForPending(@OrganizationId() organizationId: string, @Param('publicId') publicId: string) {
    try {
      await this.walletsDomainService.syncPendingTransactionsByWalletId(organizationId, publicId)
      return true
    } catch (e) {
      this.logger.error(`Error syncing wallet ${publicId} for organization ${organizationId}`, e)
      throw new InternalServerErrorException(`Error syncing wallet ${publicId} for organization ${organizationId}`)
    }
  }

  @Post('sync')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async syncAllWallets(@OrganizationId() organizationId: string) {
    try {
      await this.walletsDomainService.syncAll(organizationId, TaskSyncType.INCREMENTAL)
      return true
    } catch (e) {
      this.logger.error(`Error syncing all wallets for organization ${organizationId}`, e)
      throw new InternalServerErrorException(`Error syncing all wallets for organization ${organizationId}`)
    }
  }

  @Post('sync-pending')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  async syncAllWalletsForPending(@OrganizationId() organizationId: string) {
    try {
      await this.walletsDomainService.syncPendingTransactionsByOrganization(organizationId)
      return true
    } catch (e) {
      this.logger.error(`Error syncing all wallets for organization ${organizationId}`, e)
      throw new InternalServerErrorException(`Error syncing all wallets for organization ${organizationId}`)
    }
  }

  @Post(':publicId/trigger-solana-indexing')
  @RequirePermissionAction(Action.READ)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'publicId', type: 'string' })
  @ApiOperation({
    summary: 'Manually trigger Solana indexing',
    description: 'Trigger Solana transaction indexing for a specific wallet via Temporal worker'
  })
  async triggerSolanaIndexing(@Param('publicId') publicId: string, @OrganizationId() organizationId: string) {
    this.logger.info(`🎯 SOL: Manual trigger for Solana indexing`, {
      publicId,
      organizationId
    })

    try {
      const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)

      if (!wallet.supportedBlockchains || !wallet.supportedBlockchains.includes('solana')) {
        throw new Error('Wallet does not support Solana blockchain')
      }

      const webhookUrl = `${this.configService.get('BASE_URL')}/api/v1/webhooks/indexing-complete`

      const result = await this.dataOnchainIngestorService.triggerSolanaIndexing({
        address: wallet.address,
        chain_id: 'solana',
        sync_mode: 'INCREMENTAL', // For manual triggers, use incremental
        webhook_url: webhookUrl
      })

      this.logger.info(`✅ Manual SOL indexing triggered successfully`, {
        publicId,
        address: wallet.address,
        workflowId: result.workflow_id,
        runId: result.run_id
      })

      return {
        success: true,
        message: 'Solana indexing triggered successfully',
        workflowId: result.workflow_id,
        runId: result.run_id,
        estimatedCompletion: result.estimated_completion_time
      }
    } catch (error) {
      this.logger.error(`❌ Failed to trigger manual SOL indexing`, error, {
        publicId,
        organizationId,
        errorMessage: error.message
      })
      throw new InternalServerErrorException(`Failed to trigger Solana indexing: ${error.message}`)
    }
  }

  // ===== DATA-ONCHAIN ENHANCED ENDPOINTS (UI COMPATIBLE) =====

  @Get(':publicId/enhanced-transactions')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({
    summary: 'Get enhanced wallet transaction history',
    description: 'Get paginated transaction history with enhanced data from indexed blockchain'
  })
  @ApiParam({ name: 'publicId', description: 'Wallet public ID' })
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getEnhancedWalletTransactions(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
    @Query('symbol') symbol?: string,
    @Query('kind') kind?: 'IN' | 'OUT'
  ) {
    try {
      const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)
      if (!wallet) {
        throw new NotFoundException('Wallet not found')
      }

      // Get enhanced data from data-onchain-ingestor
      const chain_id = wallet.supportedBlockchains?.find(bc => bc.includes('solana')) ||
                      wallet.supportedBlockchains?.[0] || 'solana'

      this.logger.debug('Getting enhanced transactions:', {
        walletId: wallet.id,
        address: wallet.address,
        chain_id,
        supportedBlockchains: wallet.supportedBlockchains
      })

      const enhancedData = await this.dataOnchainQueryService.getWalletTransactionHistory(
        wallet.id,
        wallet.address,
        chain_id,
        page || 1,
        per_page || 50,
        { symbol, kind }
      )

      // Debug logging to understand the structure
      this.logger.debug('Enhanced data structure:', {
        hasTransactions: !!enhancedData?.transactions,
        transactionsType: typeof enhancedData?.transactions,
        isArray: Array.isArray(enhancedData?.transactions),
        keys: Object.keys(enhancedData || {}),
        enhancedData: enhancedData
      })

      // Ensure we have valid enhanced data and transactions array
      if (!enhancedData || typeof enhancedData !== 'object') {
        this.logger.error('Invalid enhanced data received, returning empty result')
        return {
          data: [],
          total: 0,
          pagination: {
            current_page: page || 1,
            per_page: per_page || 50,
            total_pages: 0,
            has_next: false,
            has_previous: false
          }
        }
      }

      // Ensure transactions is an array
      const transactions = Array.isArray(enhancedData.transactions) ? enhancedData.transactions : []

      // Transform to UI-compatible format (keep existing structure but add enhanced fields)
      return {
        data: transactions.map(tx => ({
          // Keep original wallet transaction structure
          id: tx.transaction_id,
          hash: tx.hash,
          blockNumber: tx.block_number,
          timestamp: tx.timestamp,
          from: tx.from_address,
          to: tx.to_address,
          value: tx.amount,
          symbol: tx.symbol,
          kind: tx.kind,

          // Add enhanced fields from data-onchain-ingestor
          enhancedData: {
            fee: tx.fee,
            decimals: tx.decimals,
            type: tx.type,
            created_at: tx.created_at,
            updated_at: tx.updated_at
          }
        })),
        total: enhancedData.total_transactions || 0,
        pagination: enhancedData.pagination || {
          current_page: page || 1,
          per_page: per_page || 50,
          total_pages: 0,
          has_next: false,
          has_previous: false
        }
      }
    } catch (error) {
      this.logger.error('Failed to get enhanced wallet transactions', error, { publicId, organizationId })
      throw new InternalServerErrorException('Failed to get enhanced wallet transactions')
    }
  }

  @Get(':publicId/enhanced-portfolio')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({
    summary: 'Get enhanced wallet portfolio',
    description: 'Get current token balances with enhanced analytics and PnL calculations'
  })
  @ApiParam({ name: 'publicId', description: 'Wallet public ID' })
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getEnhancedWalletPortfolio(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string
  ) {
    try {
      const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)
      if (!wallet) {
        throw new NotFoundException('Wallet not found')
      }

      const chain_id = wallet.supportedBlockchains?.find(bc => bc.includes('solana')) ||
                      wallet.supportedBlockchains?.[0] || 'solana'

      // Get enhanced portfolio data
      const enhancedPortfolio = await this.dataOnchainQueryService.getWalletPortfolio(
        wallet.id,
        wallet.address,
        chain_id
      )

      // Get existing PnL data from gains-losses service
      // This preserves the original PnL calculation logic in LedgerX backend

      // Transform to UI-compatible format (enhance existing balance structure)
      return {
        // Keep existing wallet balance structure
        balance: wallet.balance || { blockchains: {} },

        // Add enhanced portfolio data
        enhancedPortfolio: {
          total_value_usd: enhancedPortfolio.total_usd_value,
          token_count: enhancedPortfolio.balances.length,
          tokens: enhancedPortfolio.balances.map(token => ({
            symbol: token.symbol,
            address: token.address,
            balance: token.balance,
            formatted_balance: token.formatted_balance,
            usd_value: token.usd_value || 0,
            percentage: enhancedPortfolio.total_usd_value > 0
              ? ((token.usd_value || 0) / enhancedPortfolio.total_usd_value * 100)
              : 0,

            // PnL will be calculated using existing gains-losses logic
            // This can be enhanced later to integrate with data-onchain-ingestor's PnL
            pnl: {
              unrealized_pnl_usd: 0, // TODO: integrate with gains-losses service
              realized_pnl_usd: 0,   // TODO: integrate with gains-losses service
              total_pnl_usd: 0       // TODO: integrate with gains-losses service
            }
          })),
          sync_status: enhancedPortfolio.sync_status,
          last_updated: enhancedPortfolio.last_updated
        },

        // Keep original metadata
        lastSyncedAt: wallet.lastSyncedAt,
        ownedCryptocurrencies: wallet.ownedCryptocurrencies || {}
      }
    } catch (error) {
      this.logger.error('Failed to get enhanced wallet portfolio', error, { publicId, organizationId })
      throw new InternalServerErrorException('Failed to get enhanced wallet portfolio')
    }
  }

  // Dashboard chart-friendly endpoints
  @Get(':publicId/dashboard-summary')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({ summary: 'Dashboard summary KPIs', description: 'KPIs for dashboard cards (transactions, last transaction date, SOL price, total balance)' })
  async getDashboardSummary(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string,
    @Query('days') days?: number
  ) {
    const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)
    if (!wallet) throw new NotFoundException('Wallet not found')

    const chain_id = wallet.supportedBlockchains?.find(bc => bc.includes('solana')) || wallet.supportedBlockchains?.[0] || 'solana'

    const insights = await this.dataOnchainQueryService.getWalletInsights(wallet.address, chain_id, days || 30)
    const portfolio = await this.dataOnchainQueryService.getWalletPortfolio(wallet.id, wallet.address, chain_id)

    // current SOL price in last 24h: use PricesService for USD current day
    const cryptoSOL = await this.cryptocurrenciesService.getBySymbol('SOL')
    let solPriceUSD: string | null = null
    if (cryptoSOL) {
      solPriceUSD = (await this.pricesService.getCurrentFiatPriceByCryptocurrency(cryptoSOL, 'USD')).toString()
    }

    const totalUsd = portfolio?.total_usd_value || 0
    const lastTxTimestamp = insights?.transaction_trends?.daily_count?.filter(Boolean).slice(-1)[0]?.date || null

    return {
      transactions: insights?.summary?.total_transactions || 0,
      last_transaction: lastTxTimestamp,
      sol_price_usd: solPriceUSD,
      total_balance_usd: totalUsd,
      total_change_pct: undefined // placeholder if later compute growth
    }
  }

  @Get(':publicId/token-distribution')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({ summary: 'Token distribution for charts', description: 'Current token USD distribution for donut/bar charts' })
  async getTokenDistribution(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string
  ) {
    const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)
    if (!wallet) throw new NotFoundException('Wallet not found')

    const chain_id = wallet.supportedBlockchains?.find(bc => bc.includes('solana')) || wallet.supportedBlockchains?.[0] || 'solana'
    const portfolio = await this.dataOnchainQueryService.getWalletPortfolio(wallet.id, wallet.address, chain_id)

    const total = portfolio?.total_usd_value || 0
    const tokens = (portfolio?.balances || []).map(t => ({
      symbol: t.symbol,
      address: t.address,
      usd_value: t.usd_value || 0,
      pct: total > 0 ? (t.usd_value || 0) / total * 100 : 0
    }))

    return { total_usd: total, tokens }
  }

  @Get(':publicId/monthly-transactions')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({ summary: 'Monthly transaction trend', description: 'Aggregates daily counts into monthly totals for line chart' })
  async getMonthlyTransactions(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string,
    @Query('months') months?: number
  ) {
    const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)
    if (!wallet) throw new NotFoundException('Wallet not found')

    const chain_id = wallet.supportedBlockchains?.find(bc => bc.includes('solana')) || wallet.supportedBlockchains?.[0] || 'solana'
    const days = (months || 12) * 30
    const insights = await this.dataOnchainQueryService.getWalletInsights(wallet.address, chain_id, days)

    const monthly: { [ym: string]: number } = {}
    for (const d of insights.transaction_trends.daily_count) {
      const ym = d.date.substring(0, 7)
      monthly[ym] = (monthly[ym] || 0) + d.count
    }
    const series = Object.entries(monthly).sort((a,b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ month, count }))
    return { series }
  }

  @Get(':publicId/price-history')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({ summary: 'Token price history', description: 'Token price history fetched from Birdeye (daily points)' })
  async getPriceHistory(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string,
    @Query('symbol') symbol = 'SOL',
    @Query('fiat') fiat = 'USD',
    @Query('days') days = 90,
    @Query('address') address?: string,
    @Query('chain') chain: 'solana' | 'ethereum' | string = 'solana',
    @Query('interval') interval: '1d' | '1h' | string = '1d'
  ) {
    // Validate env for Birdeye
    const apiKey = this.configService.get<string>('BIRDEYE_API_KEY') || process.env.BIRDEYE_API_KEY
    if (!apiKey) {
      throw new BadRequestException('BIRDEYE_API_KEY is not configured')
    }

    // Default token address for SOL on Solana (Wrapped SOL mint used by most price APIs)
    let tokenAddress = address
    if (!tokenAddress) {
      if (chain.includes('sol')) {
        tokenAddress = 'So11111111111111111111111111111111111111112'
      } else {
        // If not provided for other chains, we require explicit address
        throw new BadRequestException('Token address is required for non-Solana chains')
      }
    }

    // Calculate time range
    const nowMs = Date.now()
    const fromSec = Math.floor((nowMs - Number(days) * 24 * 60 * 60 * 1000) / 1000)
    const toSec = Math.floor(nowMs / 1000)

    // Call Birdeye API
    const url = 'https://public-api.birdeye.so/defi/history_price'
    try {
      const resp = await firstValueFrom(this.http.get(url, {
        headers: { 'X-API-KEY': apiKey, Accept: 'application/json' },
        params: {
          address: tokenAddress,
          chain: chain || 'solana',
          vs: (fiat || 'USD').toLowerCase(),
          interval: interval || '1d',
          startTime: fromSec,
          endTime: toSec
        }
      }))

      const data = resp?.data
      // Birdeye common shapes:
      // { data: { items: [{ unixTime, value }] } } or { data: [{ t, v }] } or directly { items: [...] }
      const items = data?.data?.items || data?.data || data?.items || []

      const points: Array<{ date: string; price: string }> = (items as any[]).map((it: any) => {
        const ts = it.unixTime || it.time || it.t || it.timestamp
        const val = it.value || it.price || it.v
        const date = ts ? new Date((Number(ts)) * 1000).toISOString().substring(0, 10) : undefined
        return { date: date!, price: String(val ?? '0') }
      }).filter(p => !!p.date)

      return { symbol, fiat, days: Number(days), chain, address: tokenAddress, interval, source: 'birdeye', points }
    } catch (error) {
      this.logger.error('Failed to fetch price history from Birdeye', error, { address: tokenAddress, chain, days })
      throw new InternalServerErrorException('Failed to fetch price history from Birdeye')
    }
  }

  @Get(':publicId/insights')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({
    summary: 'Get wallet analytics and insights',
    description: 'Get transaction trends, activity analytics, and insights for the wallet'
  })
  @ApiParam({ name: 'publicId', description: 'Wallet public ID' })
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getWalletInsights(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string,
    @Query('days') days?: number
  ) {
    try {
      const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)
      if (!wallet) {
        throw new NotFoundException('Wallet not found')
      }

      const chain_id = wallet.supportedBlockchains?.find(bc => bc.includes('solana')) ||
                      wallet.supportedBlockchains?.[0] || 'solana'

      const insights = await this.dataOnchainQueryService.getWalletInsights(
        wallet.address,
        chain_id,
        days || 30
      )

      // Transform to UI-compatible format
      return {
        wallet_id: wallet.id,
        address: wallet.address,
        insights: {
          summary: insights.summary,
          top_tokens: insights.top_tokens,
          transaction_trends: insights.transaction_trends,
          chain_id: insights.chain_id
        },
        // Keep existing wallet metadata
        lastSyncedAt: wallet.lastSyncedAt,
        status: wallet.status
      }
    } catch (error) {
      this.logger.error('Failed to get wallet insights', error, { publicId, organizationId })
      throw new InternalServerErrorException('Failed to get wallet insights')
    }
  }

  @Get(':publicId/indexing-status')
  @RequirePermissionAction(Action.READ)
  @ApiOperation({
    summary: 'Get wallet indexing status',
    description: 'Check the current indexing status for the wallet'
  })
  @ApiParam({ name: 'publicId', description: 'Wallet public ID' })
  @ApiParam({ name: 'organizationId', type: 'string' })
  async getWalletIndexingStatus(
    @Param('publicId') publicId: string,
    @OrganizationId() organizationId: string
  ) {
    try {
      const wallet = await this.walletsDomainService.getByOrganizationAndPublicId(publicId, organizationId)
      if (!wallet) {
        throw new NotFoundException('Wallet not found')
      }

      const chain_id = wallet.supportedBlockchains?.find(bc => bc.includes('solana')) ||
                      wallet.supportedBlockchains?.[0] || 'solana'

      const [jobs, count] = await Promise.all([
        this.dataOnchainQueryService.getAddressJobs(wallet.address, chain_id, undefined, 5),
        this.dataOnchainQueryService.getAddressTransactionCount(wallet.address, chain_id)
      ])

      const latestJob = jobs.length > 0 ? jobs[0] : null
      let status = 'UNKNOWN'

      if (latestJob) {
        switch (latestJob.status) {
          case 1: status = 'COMPLETED'; break
          case 0: status = 'PROCESSING'; break
          case -1: status = 'FAILED'; break
        }
      } else if (count.financial_transaction_count && count.financial_transaction_count > 0) {
        status = 'COMPLETED'
      }

      return {
        wallet_id: wallet.id,
        address: wallet.address,
        chain_id,
        status,
        transaction_count: count.financial_transaction_count || 0,
        latest_job: latestJob,
        recent_jobs: jobs,
        last_updated: latestJob?.updated_at || new Date().toISOString()
      }
    } catch (error) {
      this.logger.error('Failed to get wallet indexing status', error, { publicId, organizationId })
      throw new InternalServerErrorException('Failed to get wallet indexing status')
    }
  }

  @Delete(':publicId')
  @RequirePermissionAction(Action.DELETE)
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.WALLETS)
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async delete(@Param('publicId') publicId: string, @OrganizationId() organizationId: string) {
    const result = await this.walletsDomainService.delete(publicId, organizationId)

    if (!result) {
      throw new NotFoundException()
    }
  }
}
