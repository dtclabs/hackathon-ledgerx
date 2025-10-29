import { Controller, Post, Get, Delete, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiParam, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../shared/guards/permissions.guard';
import { SubscriptionPlanPermissionGuard } from '../shared/guards/subscription-plan-permission.guard';
import { RequirePermissionAction, RequirePermissionResource } from '../shared/decorators/permissions.decorator';
import { Action, Resource } from '../permissions/interfaces';
import { RequireSubscriptionPlanPermission } from '../shared/decorators/subscription-plan-permission.decorator';
import { SubscriptionPlanPermissionName } from '../shared/entity-services/subscriptions/interface';
import { FinancialTransactionsDomainService } from './financial-transactions.domain.service';
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator';

@ApiTags('financial-transactions')
@ApiBearerAuth()
@Controller()
export class FinancialTransactionsController {
  constructor(
    private readonly financialTransactionsService: FinancialTransactionsDomainService
  ) {
    console.log('FinancialTransactionsController initialized!');
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get paginated Solana financial transactions',
    description: 'Get comprehensive list of financial transactions from all Solana wallets in wallet groups with full gain/loss calculations, contacts, and rich metadata. Supports both pagination styles: page/size and limit/offset'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (0-based)', example: 0 })
  @ApiQuery({ name: 'size', required: false, description: 'Number of transactions per page', example: 10 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to retrieve (alternative to size)', example: 100 })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of transactions to skip (alternative to page)', example: 0 })
  @ApiQuery({ name: 'walletIds', required: false, description: 'Filter by specific wallet IDs (comma-separated)' })
  @ApiQuery({ name: 'walletGroupIds', required: false, description: 'Filter by wallet group IDs (comma-separated)' })
  @ApiQuery({ name: 'symbol', required: false, description: 'Filter by token symbol (e.g., SOL, USDC)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by transaction type (deposit, withdrawal, fee, etc.)' })
  @ApiQuery({ name: 'direction', required: false, description: 'Filter by direction (incoming, outgoing)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter transactions from this date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter transactions until this date (ISO string)' })
  @ApiQuery({ name: 'startTime', required: false, description: 'Filter transactions from this time (ISO string) - HQ.xyz compatible' })
  @ApiQuery({ name: 'endTime', required: false, description: 'Filter transactions until this time (ISO string) - HQ.xyz compatible' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter transactions from this date (ISO string) - alias for startDate' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter transactions to this date (ISO string) - alias for endDate' })
  @ApiQuery({ name: 'fromAddress', required: false, description: 'Filter by sender address (Solana base58 address)' })
  @ApiQuery({ name: 'toAddress', required: false, description: 'Filter by receiver address (Solana base58 address)' })
  @ApiQuery({ name: 'address', required: false, description: 'Filter by either sender or receiver address (Solana base58 address)' })
  @ApiQuery({ name: 'txHash', required: false, description: 'Filter by transaction hash (Solana transaction signature)' })
  @ApiQuery({ name: 'activity', required: false, description: 'Filter by transaction activity (swap, transfer, etc.)' })
  @ApiQuery({ name: 'substatuses', required: false, description: 'Filter by transaction substatuses (comma-separated). For Solana: PENDING_VALIDATION, VALIDATED, REQUIRES_MANUAL_REVIEW' })
  @ApiQuery({ name: 'walletAddresses', required: false, description: 'Filter by wallet addresses (comma-separated Solana base58 addresses)' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.READ)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async getAllSolanaFinancialTransactions(
    @OrganizationId() organizationId: string,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('walletIds') walletIds?: string,
    @Query('walletGroupIds') walletGroupIds?: string,
    @Query('symbol') symbol?: string,
    @Query('type') type?: string,
    @Query('direction') direction?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('fromAddress') fromAddress?: string,
    @Query('toAddress') toAddress?: string,
    @Query('address') address?: string,
    @Query('txHash') txHash?: string,
    @Query('activity') activity?: string,
    @Query('substatuses') substatuses?: string,
    @Query('walletAddresses') walletAddresses?: string
  ) {
    // Handle both pagination styles: page/size and limit/offset
    let finalPage = page;
    let finalSize = size;
    
    if (limit !== undefined) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum)) {
        finalSize = limitNum;
        if (offset !== undefined) {
          const offsetNum = parseInt(offset, 10);
          if (!isNaN(offsetNum)) {
            finalPage = Math.floor(offsetNum / limitNum);
          }
        }
      }
    }

    // Handle date parameters (support multiple formats: startDate/endDate, startTime/endTime, fromDate/toDate)
    const finalStartDate = startDate || startTime || fromDate;
    const finalEndDate = endDate || endTime || toDate;

    const query = {
      page: finalPage,
      size: finalSize,
      walletIds: walletIds ? walletIds.split(',') : undefined,
      walletGroupIds: walletGroupIds ? walletGroupIds.split(',') : undefined,
      symbol,
      type,
      direction,
      startDate: finalStartDate ? new Date(finalStartDate) : undefined,
      endDate: finalEndDate ? new Date(finalEndDate) : undefined,
      fromAddress,
      toAddress,
      address,
      txHash,
      activity,
      substatuses: substatuses ? (Array.isArray(substatuses) ? substatuses : substatuses.split(',')) : undefined,
      walletAddresses: walletAddresses ? (Array.isArray(walletAddresses) ? walletAddresses : walletAddresses.split(',')) : undefined
    };

    return this.financialTransactionsService.getAllSolanaTransactionsPaging(organizationId, query);
  }



  @Post('import/:walletPublicId')
  @ApiParam({ name: 'walletPublicId', type: 'string' })
  @RequireSubscriptionPlanPermission(SubscriptionPlanPermissionName.FINANCIAL_TRANSACTIONS)
  @ApiOperation({ summary: 'Start background import of Solana transactions' })
  @UseGuards(JwtAuthGuard, PermissionsGuard, SubscriptionPlanPermissionGuard)
  @RequirePermissionAction(Action.CREATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async importTransactions(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    return this.financialTransactionsService.importSolanaTransactions(organizationId, walletPublicId);
  }

  @Get('import/status/:jobId')
  @ApiParam({ name: 'jobId', type: 'string' })
  @ApiOperation({ summary: 'Check status of Solana transaction import job' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.READ)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async getImportJobStatus(
    @OrganizationId() organizationId: string,
    @Param('jobId') jobId: string
  ) {
    return this.financialTransactionsService.getSolanaImportJobStatus(organizationId, jobId);
  }



  // Wallet-specific routes - these need to come BEFORE generic :walletPublicId route
  @Get('wallet/:walletPublicId')
  @ApiOperation({ 
    summary: 'Get wallet Solana financial transactions with rich format',
    description: 'Get comprehensive list of financial transactions for a specific Solana wallet with full gain/loss calculations, contacts, and rich metadata - same format as main transactions endpoint'
  })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to retrieve', example: 100 })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of transactions to skip', example: 0 })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.READ)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async getSolanaWalletTransactions(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
  ) {
    return this.financialTransactionsService.getSolanaWalletTransactions(
      organizationId,
      walletPublicId,
      limit,
      offset
    );
  }

  @Get('wallet/:walletPublicId/balances')
  @ApiOperation({ summary: 'Get wallet Solana balance summary' })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.READ)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async getSolanaWalletBalanceSummary(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    return this.financialTransactionsService.getSolanaWalletBalanceSummary(
      organizationId,
      walletPublicId
    );
  }

  @Get('wallet/:walletPublicId/debug')
  @ApiOperation({ summary: 'Debug wallet Solana transaction data' })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.READ)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async debugSolanaWalletData(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    return this.financialTransactionsService.debugSolanaWalletData(
      organizationId,
      walletPublicId
    );
  }

  @Post('wallet/:walletPublicId/generate-test-data')
  @ApiOperation({ summary: 'Generate fake Solana transaction data for gain/loss testing' })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.CREATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async generateSolanaTestData(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string,
    @Body() body: { scenario?: 'simple' | 'complex' | 'fifo-test' }
  ) {
    return this.financialTransactionsService.generateSolanaTestData(
      organizationId,
      walletPublicId,
      body.scenario || 'simple'
    );
  }

  @Post('wallet/:walletPublicId/process-gains-losses')
  @ApiOperation({ summary: 'Process gains/losses for Solana wallet transactions' })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.CREATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async processSolanaGainsLosses(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    return this.financialTransactionsService.processSolanaGainLoss(organizationId, walletPublicId);
  }

  @Get('wallet/:walletPublicId/gains-losses-summary')
  @ApiOperation({ summary: 'Get gains/losses summary for Solana wallet' })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.READ)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async getSolanaGainsLossesSummary(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    return this.financialTransactionsService.getSolanaGainsLossesSummary(organizationId, walletPublicId);
  }

  @Post('wallet/:walletPublicId/recalculate-gains-losses')
  @ApiOperation({ summary: 'Recalculate all gains/losses for Solana wallet' })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.UPDATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async recalculateSolanaGainsLosses(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    return this.financialTransactionsService.recalculateSolanaGainsLosses(organizationId, walletPublicId);
  }

  @Delete('solana/test-data/cleanup')
  @ApiOperation({ 
    summary: 'Clean up Solana test data',
    description: 'Remove fake test data generated for testing purposes. Only removes transactions created by the test data generator.'
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.DELETE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async cleanupSolanaTestData(
    @OrganizationId() organizationId: string
  ) {
    return this.financialTransactionsService.cleanupSolanaTestData(organizationId);
  }

  @Delete('solana/truncate')
  @ApiOperation({ 
    summary: '⚠️ Truncate ALL Solana transaction data',
    description: 'WARNING: This deletes ALL Solana financial transaction data for the organization, not just test data. Use with extreme caution!'
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.DELETE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async truncateAllSolanaTransactions(
    @OrganizationId() organizationId: string
  ) {
    return this.financialTransactionsService.truncateAllSolanaTransactions(organizationId);
  }

  @Post('wallet/:walletPublicId/recalculate-test-gains-losses')
  @ApiOperation({ 
    summary: 'Recalculate gains/losses for test wallet data',
    description: 'Trigger gain/loss recalculation for all transactions in a Solana wallet. Useful after generating test data.'
  })
  @ApiParam({ name: 'walletPublicId', description: 'Public ID of the wallet' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.UPDATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async recalculateTestGainsLosses(
    @OrganizationId() organizationId: string,
    @Param('walletPublicId') walletPublicId: string
  ) {
    return this.financialTransactionsService.processSolanaGainLoss(organizationId, walletPublicId);
  }

  @Post('generate-fake-data')
  @ApiOperation({ 
    summary: '🎭 Generate fake price data for ALL existing transactions',
    description: 'Manually generate realistic fake price data with gain/loss calculations for ALL existing transactions that are missing price data. Processes all transactions in chronological order for realistic gain/loss scenarios.'
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Optional limit for number of transactions to process (default: process ALL)' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.UPDATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async generateFakeDataForExistingTransactions(
    @OrganizationId() organizationId: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.financialTransactionsService.generateFakeDataForExistingTransactions(organizationId, limitNum);
  }

  @Post('organization/recalculate-gains-losses')
  @ApiOperation({ 
    summary: 'Recalculate gains/losses for all Solana wallets in organization',
    description: 'Trigger gain/loss recalculation for all Solana wallets across the entire organization. This will process all wallets and their transactions to calculate missing gain/loss values.'
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.UPDATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async recalculateOrganizationGainsLosses(
    @OrganizationId() organizationId: string
  ) {
    return this.financialTransactionsService.recalculateOrganizationGainsLosses(organizationId);
  }

  @Get('organization/debug-transactions')
  @ApiOperation({ 
    summary: 'Debug organization transaction data',
    description: 'Debug endpoint to check transaction data for all Solana wallets in organization'
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.READ)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async debugOrganizationTransactions(
    @OrganizationId() organizationId: string
  ) {
    return this.financialTransactionsService.debugOrganizationTransactions(organizationId);
  }

  @Post('organization/generate-fake-data')
  @ApiOperation({ 
    summary: '🎭 Generate fake data for ALL transactions in organization',
    description: 'Generate realistic fake price data and gain/loss calculations for ALL transactions across the entire organization. This will process every single transaction that is missing price data.'
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissionAction(Action.UPDATE)
  @RequirePermissionResource(Resource.FINANCIAL_TRANSACTIONS)
  async generateFakeDataForOrganization(
    @OrganizationId() organizationId: string
  ) {
    return this.financialTransactionsService.generateFakeDataForExistingTransactions(organizationId);
  }
}