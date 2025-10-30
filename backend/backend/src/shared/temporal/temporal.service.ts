import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Connection } from '@temporalio/client'
import { LoggerService } from '../logger/logger.service'
const Long = require('long')

@Injectable()
export class TemporalService implements OnModuleInit {
  private connection: Connection
  private readonly namespace: string
  private readonly isEnabled: boolean

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.namespace = this.configService.get('TEMPORAL_NAMESPACE') || 'default'
    this.isEnabled = this.configService.get('TEMPORAL_ENABLED') !== 'false'
  }

  async onModuleInit() {
    if (!this.isEnabled) {
      this.logger.info('Temporal service disabled via TEMPORAL_ENABLED=false')
      return
    }
    
    await this.initializeTemporalConnection()
  }

  private async initializeTemporalConnection() {
    try {
      const serverUrl = this.configService.get('TEMPORAL_SERVER_URL') || 'localhost:7233'
      
      this.logger.info('Attempting to connect to Temporal server', {
        server: serverUrl,
        namespace: this.namespace
      })

      // Create connection to Temporal server
      this.connection = await Connection.connect({
        address: serverUrl
      })

      this.logger.info('Temporal connection established', {
        namespace: this.namespace,
        server: serverUrl
      })

      // Check if namespace exists, create if needed
      await this.ensureNamespaceExists()

    } catch (error) {
      this.logger.error('Failed to initialize Temporal connection - service will operate without workflows', {
        error: error.message,
        server: this.configService.get('TEMPORAL_SERVER_URL') || 'localhost:7233'
      })
      // Don't throw the error - let the application continue
      this.connection = null
    }
  }

  private async ensureNamespaceExists(): Promise<void> {
    try {
      // Check if namespace exists by trying to describe it
      await this.connection.workflowService.describeNamespace({
        namespace: this.namespace
      })
      
      this.logger.info('Temporal namespace exists', { namespace: this.namespace })
      
    } catch (error) {
      if (error.message?.includes('namespace not found') || error.code === 5) {
        // Namespace doesn't exist, create it
        await this.createNamespace()
      } else {
        throw error
      }
    }
  }

  private async createNamespace(): Promise<void> {
    try {
      await this.connection.workflowService.registerNamespace({
        namespace: this.namespace,
        description: `Auto-created namespace for ${this.namespace}`,
        workflowExecutionRetentionPeriod: {
          seconds: Long.fromNumber(3 * 24 * 60 * 60) // 3 days
        }
      })

      this.logger.info('Temporal namespace created successfully', { 
        namespace: this.namespace 
      })

    } catch (error) {
      this.logger.error('Failed to create Temporal namespace', error, {
        namespace: this.namespace
      })
      throw error
    }
  }

  getConnection(): Connection {
    if (!this.isEnabled) {
      throw new Error('Temporal service disabled')
    }
    if (!this.connection) {
      throw new Error('Temporal connection not initialized')
    }
    return this.connection
  }

  isAvailable(): boolean {
    return this.isEnabled && this.connection !== null
  }

  getNamespace(): string {
    return this.namespace
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close()
      this.logger.info('Temporal connection closed')
    }
  }
}