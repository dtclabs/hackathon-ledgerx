import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { DataOnchainIngestorService, IndexingRequest } from './data-onchain-ingestor.service'
import { LoggerService } from '../shared/logger/logger.service'

export class TriggerIndexingDto {
  address: string
  chain_id: string
  sync_mode?: 'INCREMENTAL' | 'HISTORICAL'
  from_slot?: number
  to_slot?: number
  webhook_url?: string
}

export class IndexingStatusDto {
  address: string
  chain_id: string
  run_id?: string
}

export class IndexingResponseDto {
  success: boolean
  message: string
  run_id?: string
  estimated_completion_time?: string
}

@ApiTags('Data Onchain Ingestor')
@Controller('data-onchain-ingestor')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataOnchainIngestorController {
  constructor(
    private readonly dataOnchainIngestorService: DataOnchainIngestorService,
    private readonly logger: LoggerService
  ) {}

  @Post('solana/index')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Trigger Solana address indexing',
    description: 'Starts indexing process for a Solana address via data-onchain-ingestor service'
  })
  @ApiResponse({
    status: 202,
    description: 'Indexing process started successfully',
    type: IndexingResponseDto
  })
  async triggerSolanaIndexing(@Body() triggerDto: TriggerIndexingDto): Promise<IndexingResponseDto> {
    this.logger.info('SOL: Triggering Solana address indexing', {
      address: triggerDto.address,
      chain_id: triggerDto.chain_id,
      sync_mode: triggerDto.sync_mode
    })

    const request: IndexingRequest = {
      address: triggerDto.address,
      chain_id: triggerDto.chain_id,
      sync_mode: triggerDto.sync_mode || 'INCREMENTAL',
      from_slot: triggerDto.from_slot,
      to_slot: triggerDto.to_slot,
      webhook_url: triggerDto.webhook_url
    }

    return await this.dataOnchainIngestorService.triggerSolanaIndexing(request)
  }

  @Get('status/:address')
  @ApiOperation({
    summary: 'Check indexing status',
    description: 'Get current status of indexing process for an address'
  })
  async getIndexingStatus(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('run_id') run_id?: string
  ) {
    this.logger.info('Checking indexing status', {
      address,
      chain_id,
      run_id
    })

    return await this.dataOnchainIngestorService.checkIndexingStatus(address, chain_id, run_id)
  }

  @Get('transactions/:address')
  @ApiOperation({
    summary: 'Get indexed transactions',
    description: 'Retrieve indexed transaction data for an address'
  })
  @ApiParam({ name: 'address', description: 'Blockchain address to query' })
  @ApiQuery({ name: 'chain_id', description: 'Blockchain identifier (e.g., solana)', required: true })
  @ApiQuery({ name: 'limit', description: 'Number of results to return (default: 100)', required: false })
  @ApiQuery({ name: 'offset', description: 'Number of results to skip (default: 0)', required: false })
  @ApiQuery({ name: 'exclude_wsol', description: 'Exclude WSOL transactions (default: true)', required: false, type: Boolean })
  async getIndexedTransactions(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0,
    @Query('exclude_wsol') exclude_wsol: boolean = true  
  ) {
    this.logger.info('SOL: Getting indexed transactions', {
      address,
      chain_id,
      exclude_wsol,
      limit,
      offset
    })

    return await this.dataOnchainIngestorService.getIndexedTransactions(
      address,
      chain_id,
      limit,
      offset,
      exclude_wsol
    )
  }

  @Post('solana/bulk-index')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Trigger bulk Solana indexing',
    description: 'Start indexing process for multiple Solana addresses'
  })
  async triggerBulkSolanaIndexing(
    @Body() bulkRequest: { addresses: string[]; chain_id: string; sync_mode?: 'INCREMENTAL' | 'HISTORICAL' }
  ) {
    this.logger.info('SOL: Triggering bulk Solana indexing', {
      addressCount: bulkRequest.addresses.length,
      chain_id: bulkRequest.chain_id,
      sync_mode: bulkRequest.sync_mode
    })

    const results = []
    
    for (const address of bulkRequest.addresses) {
      try {
        const request: IndexingRequest = {
          address,
          chain_id: bulkRequest.chain_id,
          sync_mode: bulkRequest.sync_mode || 'INCREMENTAL'
        }
        
        const result = await this.dataOnchainIngestorService.triggerSolanaIndexing(request)
        results.push({ address, ...result })
      } catch (error) {
        results.push({
          address,
          success: false,
          message: error.message
        })
      }
    }

    return {
      success: true,
      message: `Bulk indexing initiated for ${bulkRequest.addresses.length} addresses`,
      results
    }
  }
}