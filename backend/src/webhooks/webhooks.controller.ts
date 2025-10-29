import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { WebhooksService } from './webhooks.service'
import { LoggerService } from '../shared/logger/logger.service'

export class IndexingWebhookDto {
  address: string
  chain_id: string
  run_id: string
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING'
  transaction_count?: number
  error_message?: string
  completed_at?: string
  metadata?: any
}

export class WebhookResponseDto {
  success: boolean
  message: string
  processed_at: string
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly logger: LoggerService
  ) {}

  @Post('indexing-complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive indexing completion webhook',
    description: 'Webhook endpoint to receive notifications when data-onchain-ingestor completes indexing'
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: WebhookResponseDto
  })
  async handleIndexingComplete(@Body() webhook: IndexingWebhookDto): Promise<WebhookResponseDto> {
    this.logger.info('SOL: Received indexing completion webhook', {
      address: webhook.address,
      chain_id: webhook.chain_id,
      run_id: webhook.run_id,
      status: webhook.status,
      transaction_count: webhook.transaction_count
    })

    try {
      await this.webhooksService.processIndexingWebhook(webhook)

      return {
        success: true,
        message: 'Indexing webhook processed successfully',
        processed_at: new Date().toISOString()
      }
    } catch (error) {
      this.logger.error('Failed to process indexing webhook', error, {
        webhook
      })

      return {
        success: false,
        message: 'Failed to process indexing webhook',
        processed_at: new Date().toISOString()
      }
    }
  }

  @Post('indexing-progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive indexing progress webhook',
    description: 'Webhook endpoint to receive progress updates during indexing'
  })
  async handleIndexingProgress(@Body() webhook: any) {
    this.logger.info('SOL: Received indexing progress webhook', {
      address: webhook.address,
      chain_id: webhook.chain_id,
      run_id: webhook.run_id,
      progress: webhook.progress
    })

    await this.webhooksService.processProgressWebhook(webhook)

    return {
      success: true,
      message: 'Progress webhook processed successfully',
      processed_at: new Date().toISOString()
    }
  }

  @Get('status/:address')
  @ApiOperation({
    summary: 'Get webhook processing status',
    description: 'Check the status of webhook processing for a specific address'
  })
  async getWebhookStatus(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('run_id') run_id?: string
  ) {
    return await this.webhooksService.getWebhookStatus(address, chain_id, run_id)
  }

  @Get('history/:address')
  @ApiOperation({
    summary: 'Get webhook history',
    description: 'Get webhook processing history for an address'
  })
  async getWebhookHistory(
    @Param('address') address: string,
    @Query('chain_id') chain_id: string,
    @Query('limit') limit: number = 10
  ) {
    return await this.webhooksService.getWebhookHistory(address, chain_id, limit)
  }
}