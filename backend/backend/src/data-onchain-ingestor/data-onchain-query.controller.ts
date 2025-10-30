import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'
import { DataOnchainQueryService } from './data-onchain-query.service'
import { LoggerService } from '../shared/logger/logger.service'
import {
  FinancialTransaction,
  TransactionFilters,
  TransactionAggregate,
  TokenInfo,
  WalletTransactionHistory,
  WalletPortfolio,
  TransactionDetails,
  WalletInsights,
  AddressCount
} from './interfaces'

@ApiTags('Data Onchain Query')
@Controller('data-onchain-query')
export class DataOnchainQueryController {
  constructor(
    private readonly dataOnchainQueryService: DataOnchainQueryService,
    private readonly logger: LoggerService
  ) {}

  // ===== FINANCIAL TRANSACTIONS =====

  @Get('addresses/:address/transactions')
  @ApiOperation({
    summary: 'Get financial transactions for an address',
    description: 'Retrieve indexed financial transactions with comprehensive filtering options'
  })
  @ApiParam({ name: 'address', description: 'Blockchain address to query' })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier (e.g., solana)', required: true })
  @ApiQuery({ name: 'symbol', description: 'Filter by token symbol', required: false })
  @ApiQuery({ name: 'kind', description: 'Filter by transaction direction', enum: ['IN', 'OUT'], required: false })
  @ApiQuery({ name: 'type', description: 'Filter by transaction type', required: false })
  @ApiQuery({ name: 'from_block', description: 'Start block number', required: false })
  @ApiQuery({ name: 'to_block', description: 'End block number', required: false })
  @ApiQuery({ name: 'limit', description: 'Number of results to return', required: false })
  @ApiQuery({ name: 'offset', description: 'Number of results to skip', required: false })
  @ApiQuery({ name: 'exclude_wsol', description: 'Exclude WSOL transactions', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', description: 'Sort order', enum: ['block_number_desc', 'block_number_asc', 'created_at_desc', 'created_at_asc'], required: false })
  @ApiResponse({ status: 200, description: 'Financial transactions retrieved successfully' })
  async getTransactions(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('symbol') symbol?: string,
    @Query('kind') kind?: 'IN' | 'OUT',
    @Query('type') type?: string,
    @Query('from_block') from_block?: number,
    @Query('to_block') to_block?: number,
    @Query('from_time') from_time?: number,
    @Query('to_time') to_time?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('exclude_wsol') exclude_wsol?: boolean,
    @Query('sort') sort?: string
  ): Promise<FinancialTransaction[]> {
    this.logger.info('Fetching financial transactions', {
      address,
      chain_id,
      symbol,
      kind,
      limit: limit || 100
    })

    const filters: TransactionFilters = {
      symbol,
      kind,
      type,
      from_block,
      to_block,
      from_time,
      to_time,
      exclude_wsol: exclude_wsol ?? true, // Exclude WSOL by default
      limit: limit || 100,
      offset: offset || 0,
      sort: sort as any || 'created_at_desc'
    }

    return await this.dataOnchainQueryService.getTransactions(address, chain_id, filters)
  }

  @Get('addresses/:address/balances')
  @ApiOperation({
    summary: 'Get aggregated token balances for an address',
    description: 'Calculate net token balances based on transaction history'
  })
  @ApiParam({ name: 'address', description: 'Blockchain address to query' })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier', required: true })
  @ApiQuery({ name: 'by_symbol', description: 'Group by symbol and token address', required: false })
  @ApiQuery({ name: 'include_fee', description: 'Include fees in calculations', required: false })
  @ApiResponse({ status: 200, description: 'Token balances retrieved successfully' })
  async getBalances(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('by_symbol') by_symbol?: boolean,
    @Query('include_fee') include_fee?: boolean,
    @Query('exclude_wsol') exclude_wsol?: boolean
  ): Promise<TransactionAggregate[]> {
    this.logger.info('Fetching balance aggregates', { address, chain_id, by_symbol })

    return await this.dataOnchainQueryService.getBalanceAggregates(address, chain_id, {
      by_symbol: by_symbol ?? true,
      include_fee: include_fee ?? true,
      exclude_wsol: exclude_wsol ?? true
    })
  }

  @Get('addresses/:address/count')
  @ApiOperation({
    summary: 'Get transaction count for an address',
    description: 'Get the total number of indexed transactions for an address'
  })
  @ApiParam({ name: 'address', description: 'Blockchain address to query' })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier', required: true })
  @ApiResponse({ status: 200, description: 'Transaction count retrieved successfully' })
  async getTransactionCount(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string
  ): Promise<AddressCount> {
    return await this.dataOnchainQueryService.getAddressTransactionCount(address, chain_id)
  }

  // ===== WALLET-SPECIFIC ENDPOINTS =====

  @Get('wallets/:wallet_id/history')
  @ApiOperation({
    summary: 'Get comprehensive wallet transaction history',
    description: 'Get paginated transaction history with metadata for UI display'
  })
  @ApiParam({ name: 'wallet_id', description: 'Wallet identifier' })
  @ApiQuery({ name: 'address', description: 'Wallet address', required: true })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier', required: true })
  @ApiQuery({ name: 'page', description: 'Page number (1-based)', required: false })
  @ApiQuery({ name: 'per_page', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Wallet transaction history retrieved successfully' })
  async getWalletHistory(
    @Param('wallet_id') wallet_id: string,
    @Query('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
    @Query('symbol') symbol?: string,
    @Query('kind') kind?: 'IN' | 'OUT'
  ): Promise<WalletTransactionHistory> {
    if (!address || !chain_id) {
      throw new HttpException('Address and chain_id are required', HttpStatus.BAD_REQUEST)
    }

    const filters: TransactionFilters = {}
    if (symbol) filters.symbol = symbol
    if (kind) filters.kind = kind

    return await this.dataOnchainQueryService.getWalletTransactionHistory(
      wallet_id,
      address,
      chain_id,
      page || 1,
      per_page || 50,
      filters
    )
  }

  @Get('wallets/:wallet_id/portfolio')
  @ApiOperation({
    summary: 'Get wallet portfolio overview',
    description: 'Get current token balances and portfolio value for a wallet'
  })
  @ApiParam({ name: 'wallet_id', description: 'Wallet identifier' })
  @ApiQuery({ name: 'address', description: 'Wallet address', required: true })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier', required: true })
  @ApiResponse({ status: 200, description: 'Wallet portfolio retrieved successfully' })
  async getWalletPortfolio(
    @Param('wallet_id') wallet_id: string,
    @Query('address') address: string,
    @Query('chain_id') chain_id: string
  ): Promise<WalletPortfolio> {
    if (!address || !chain_id) {
      throw new HttpException('Address and chain_id are required', HttpStatus.BAD_REQUEST)
    }

    return await this.dataOnchainQueryService.getWalletPortfolio(wallet_id, address, chain_id)
  }

  @Get('wallets/:wallet_id/insights')
  @ApiOperation({
    summary: 'Get wallet analytics and insights',
    description: 'Get transaction trends, top tokens, and activity analytics'
  })
  @ApiParam({ name: 'wallet_id', description: 'Wallet identifier' })
  @ApiQuery({ name: 'address', description: 'Wallet address', required: true })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier', required: true })
  @ApiQuery({ name: 'days', description: 'Number of days to analyze', required: false })
  @ApiResponse({ status: 200, description: 'Wallet insights retrieved successfully' })
  async getWalletInsights(
    @Param('wallet_id') wallet_id: string,
    @Query('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('days') days?: number
  ): Promise<WalletInsights> {
    if (!address || !chain_id) {
      throw new HttpException('Address and chain_id are required', HttpStatus.BAD_REQUEST)
    }

    return await this.dataOnchainQueryService.getWalletInsights(address, chain_id, days || 30)
  }

  // ===== TRANSACTION DETAILS =====

  @Get('transactions/:transaction_id/details')
  @ApiOperation({
    summary: 'Get detailed transaction information',
    description: 'Get comprehensive transaction details with related transactions and metadata'
  })
  @ApiParam({ name: 'transaction_id', description: 'Transaction identifier' })
  @ApiQuery({ name: 'address', description: 'Address context for the transaction', required: true })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier', required: true })
  @ApiResponse({ status: 200, description: 'Transaction details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionDetails(
    @Param('transaction_id') transaction_id: string,
    @Query('address') address: string,
    @Query('chain_id') chain_id: string
  ): Promise<TransactionDetails> {
    if (!address || !chain_id) {
      throw new HttpException('Address and chain_id are required', HttpStatus.BAD_REQUEST)
    }

    const details = await this.dataOnchainQueryService.getTransactionDetails(
      transaction_id,
      address,
      chain_id
    )

    if (!details) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND)
    }

    return details
  }

  // ===== TOKEN INFORMATION =====

  @Get('tokens')
  @ApiOperation({
    summary: 'Search token information',
    description: 'Search for token metadata by symbol or name'
  })
  @ApiQuery({ name: 'q', description: 'Search query (symbol or name)', required: false })
  @ApiQuery({ name: 'limit', description: 'Maximum number of results', required: false })
  @ApiResponse({ status: 200, description: 'Tokens retrieved successfully' })
  async searchTokens(
    @Query('q') searchQuery?: string,
    @Query('limit') limit?: number
  ): Promise<TokenInfo[]> {
    return await this.dataOnchainQueryService.getTokens(searchQuery, limit || 100)
  }

  @Get('tokens/:symbol')
  @ApiOperation({
    summary: 'Get token information by symbol',
    description: 'Get detailed metadata for a specific token'
  })
  @ApiParam({ name: 'symbol', description: 'Token symbol' })
  @ApiResponse({ status: 200, description: 'Token information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async getTokenBySymbol(@Param('symbol') symbol: string): Promise<TokenInfo> {
    const token = await this.dataOnchainQueryService.getTokenBySymbol(symbol)
    
    if (!token) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND)
    }

    return token
  }

  // ===== INDEXING STATUS =====

  @Get('addresses/:address/indexing-status')
  @ApiOperation({
    summary: 'Get address indexing status',
    description: 'Check the current indexing status and recent jobs for an address'
  })
  @ApiParam({ name: 'address', description: 'Blockchain address to check' })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier', required: true })
  @ApiResponse({ status: 200, description: 'Indexing status retrieved successfully' })
  async getIndexingStatus(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string
  ) {
    const [jobs, count] = await Promise.all([
      this.dataOnchainQueryService.getAddressJobs(address, chain_id, undefined, 5),
      this.dataOnchainQueryService.getAddressTransactionCount(address, chain_id)
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
      address,
      chain_id,
      status,
      transaction_count: count.financial_transaction_count || 0,
      latest_job: latestJob,
      recent_jobs: jobs,
      last_updated: latestJob?.updated_at || new Date().toISOString()
    }
  }
}