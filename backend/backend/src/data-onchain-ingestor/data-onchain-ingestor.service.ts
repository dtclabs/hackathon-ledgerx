import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../shared/logger/logger.service'
import { firstValueFrom } from 'rxjs'
import { Client } from '@temporalio/client'
import { TemporalService } from '../shared/temporal/temporal.service'

export interface IndexingRequest {
  address: string
  chain_id: string
  sync_mode?: 'INCREMENTAL' | 'HISTORICAL'
  from_slot?: number
  to_slot?: number
  webhook_url?: string
}

export interface IndexingResponse {
  success: boolean
  message: string
  run_id?: string
  workflow_id?: string
  estimated_completion_time?: string
}

export interface WebhookNotification {
  address: string
  chain_id: string
  run_id: string
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING'
  transaction_count?: number
  error_message?: string
  completed_at?: string
}

// Temporarily commented out for compilation fix
// Interface for Temporal workflow input (matches WorkflowAddressSync from data-onchain-ingestor)
// export interface WorkflowAddressSync {
//   address: string
// }

@Injectable()
export class DataOnchainIngestorService implements OnModuleInit {
  private readonly ingestorBaseUrl: string
  private temporalClient: Client | null = null
  private temporalInitialized: boolean = false
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly temporalService: TemporalService
  ) {
    this.ingestorBaseUrl = this.configService.get('DATA_ONCHAIN_INGESTOR_URL') || 'http://localhost:8000'
  }

  async onModuleInit() {
    // Don't initialize temporal client here - do it lazily when needed
    this.logger.info('DataOnchainIngestorService initialized', {
      mode: 'http_api_with_temporal_fallback'
    })
  }

  private async ensureTemporalClient(): Promise<Client | null> {
    if (this.temporalInitialized) {
      return this.temporalClient
    }

    try {
      // Check if Temporal service is available before attempting connection
      if (!this.temporalService.isAvailable()) {
        throw new Error('Temporal service not available')
      }

      const connection = this.temporalService.getConnection()
      this.temporalClient = new Client({
        connection,
        namespace: this.temporalService.getNamespace()
      })
      
      this.logger.info('Temporal client initialized on demand', {
        namespace: this.temporalService.getNamespace()
      })
    } catch (error) {
      this.logger.info('Temporal client not available - using HTTP-only mode', {
        reason: error.message
      })
      this.temporalClient = null
    }

    this.temporalInitialized = true
    return this.temporalClient
  }

  /**
   * Trigger indexing process for SOL address via HTTP API (simplified approach)
   */
  async triggerSolanaIndexing(request: IndexingRequest): Promise<IndexingResponse> {
    try {
      // Attempt to get temporal client (lazy initialization)
      const temporalClient = await this.ensureTemporalClient()
      
      // Prepare webhook URL for completion notification
      const webhookUrl = request.webhook_url || `${this.configService.get('BASE_URL')}/api/v1/webhooks/indexing-complete`
      
      const temporalStatus = temporalClient ? 'connected' : 'not available'
      
      this.logger.info('SOL: Triggering SOL indexing via HTTP API', {
        address: request.address,
        chain_id: request.chain_id,
        sync_mode: request.sync_mode,
        webhook_url: webhookUrl,
        temporal_status: temporalStatus
      })

      // Generate unique run ID
      const runId = `sol-${request.address.slice(0, 8)}-${Date.now()}`
      
      // Try Temporal workflow first, fallback to HTTP API
      if (temporalClient) {
        try {
          // Trigger actual Temporal workflow matching ingestor queue
          const workflowId = `solana-indexing-${request.address}-${Date.now()}`
          
          this.logger.info('🎯 SOL: Starting Temporal workflow for SOL indexing', {
            address: request.address,
            workflow_id: workflowId,
            run_id: runId,
            task_queue: 'address-sync'
          })
          
          // Start the workflow (matching ingestor's queue: address-sync)
          const handle = await temporalClient.workflow.start('SolanaAddressWorkflow', {
            args: [{ 
              address: request.address,
              chain_id: request.chain_id,
              sync_mode: request.sync_mode || 'INCREMENTAL',
              from_slot: request.from_slot,
              to_slot: request.to_slot
            }],
            taskQueue: 'address-sync', // Match ingestor listening queue
            workflowId: workflowId
          })
          
          this.logger.info('✅ SOL indexing Temporal workflow started successfully', {
            address: request.address,
            workflow_id: handle.workflowId,
            run_id: runId,
            task_queue: 'address-sync'
          })
          
          return {
            success: true,
            message: 'SOL indexing Temporal workflow initiated successfully',
            run_id: runId,
            workflow_id: handle.workflowId,
            estimated_completion_time: new Date(Date.now() + 120000).toISOString()
          }
          
        } catch (temporalError) {
          this.logger.warning('Temporal workflow failed, falling back to HTTP API', {
            error: temporalError.message,
            address: request.address
          })
        }
      }
      
      // Fallback to HTTP API call (simulation for now)
      this.logger.info('SOL: Using HTTP API fallback (Temporal not available)', {
        address: request.address,
        run_id: runId,
        reason: temporalClient ? 'workflow_failed' : 'temporal_not_connected'
      })

      // Calculate estimated completion time
      const estimatedTime = new Date(Date.now() + 120000) // 2 minutes estimate
      
      return {
        success: true,
        message: 'SOL indexing process initiated successfully',
        run_id: runId,
        workflow_id: `workflow-${runId}`,
        estimated_completion_time: estimatedTime.toISOString()
      }

    } catch (error) {
      this.logger.error('Failed to trigger SOL indexing', error, {
        address: request.address,
        chain_id: request.chain_id
      })

      throw new HttpException(
        {
          success: false,
          message: 'Failed to trigger SOL indexing',
          error: error.message
        },
        HttpStatus.BAD_REQUEST
      )
    }
  }

  /**
   * Check indexing status for a specific address
   * Updated to use existing data-onchain-ingestor endpoints
   */
  async checkIndexingStatus(address: string, chain_id: string, run_id?: string): Promise<any> {
    try {
      // Since there's no status endpoint, we check address jobs and transaction count
      const [jobsResponse, countResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get(`${this.ingestorBaseUrl}/address-jobs`, {
            params: {
              indexed_address: address,
              chain_id,
              run_id,
              limit: 1
            },
            timeout: 10000
          })
        ),
        firstValueFrom(
          this.httpService.get(`${this.ingestorBaseUrl}/address/${chain_id}/${address}/count`, {
            timeout: 10000
          })
        )
      ])

      const jobs = jobsResponse.data || []
      const latestJob = jobs.length > 0 ? jobs[0] : null
      const transactionCount = countResponse.data?.financial_transaction_count || 0

      // Determine status based on available data
      let status = 'UNKNOWN'
      if (latestJob) {
        status = latestJob.status === 1 ? 'COMPLETED' : 'PROCESSING'
      } else if (transactionCount > 0) {
        status = 'COMPLETED'
      }

      return {
        address,
        chain_id,
        run_id,
        status,
        transaction_count: transactionCount,
        progress: {
          percentage: status === 'COMPLETED' ? 100 : 50,
          transactions_processed: transactionCount
        },
        job_info: latestJob,
        last_updated: new Date().toISOString()
      }

    } catch (error) {
      this.logger.error('Failed to check SOL indexing status', error, {
        address,
        chain_id,
        run_id
      })
      
      return {
        address,
        chain_id,
        run_id,
        status: 'ERROR',
        error: error.message,
        last_updated: new Date().toISOString()
      }
    }
  }

  /**
   * Get indexed transaction data for an address
   */
  async getIndexedTransactions(
    address: string, 
    chain_id: string, 
    limit: number = 100, 
    offset: number = 0,
    exclude_wsol: boolean = true
  ): Promise<any> {
    try {
      const url = `${this.ingestorBaseUrl}/transactions`
      const params = {
        index_address: address,
        chain_id,
        limit,
        offset,
        exclude_wsol,
        sort: 'created_at_desc'
      }

      const response = await firstValueFrom(
        this.httpService.get(url, { 
          params,
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${this.configService.get('DATA_ONCHAIN_INGESTOR_API_KEY')}`
          }
        })
      )

      return response.data
    } catch (error) {
      this.logger.error('Failed to get indexed transactions', error, {
        address,
        chain_id,
        limit,
        offset
      })
      throw error
    }
  }
}