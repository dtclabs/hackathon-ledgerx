import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoggerService } from '../shared/logger/logger.service'
import { FinancialTransactionsDomainService } from './financial-transactions.domain.service'
import { SolFinancialTransactionsEntityService } from '../shared/entity-services/sol-financial-transactions/sol-financial-transactions.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { SolFinancialTransactionChildMetadata } from '../shared/entity-services/sol-financial-transactions/sol-financial-transaction-child-metadata.entity'
import {
  CreateSolFinancialTransactionParentDto,
  CreateSolFinancialTransactionChildDto,
  SolFinancialTransactionParentActivity,
  SolFinancialTransactionParentStatus,
  SolFinancialTransactionParentExportStatus,
  SolFinancialTransactionChildMetadataDirection,
  SolFinancialTransactionChildMetadataType,
  SolFinancialTransactionChildMetadataStatus,
  SolGainLossInclusionStatus
} from '../shared/entity-services/sol-financial-transactions/interfaces'

@Injectable()
export class SolanaFakeDataService {
  constructor(
    private logger: LoggerService,
    private solFinancialTransactionsEntityService: SolFinancialTransactionsEntityService,
    private cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private blockchainsEntityService: BlockchainsEntityService,
    @InjectRepository(SolFinancialTransactionChildMetadata)
    private metadataRepository: Repository<SolFinancialTransactionChildMetadata>
  ) {}

  /**
   * Generate realistic fake data scenarios for gain/loss testing
   * NOTE: This creates raw transaction data WITHOUT calculating gain/loss automatically.
   * Use the recalculate endpoints to trigger gain/loss calculation after data generation.
   */
  async generateGainLossTestData(
    organizationId: string,
    walletAddress: string,
    scenario: 'simple' | 'complex' | 'fifo-test' = 'simple'
  ): Promise<any> {
    this.logger.debug(`Generating ${scenario} gain/loss test data for wallet: ${walletAddress} (without auto gain/loss calculation)`)

    switch (scenario) {
      case 'simple':
        return await this.generateSimpleBuySellScenario(organizationId, walletAddress)
      case 'complex':
        return await this.generateFifoTestScenario(organizationId, walletAddress) // Use FIFO test for complex
      case 'fifo-test':
        return await this.generateFifoTestScenario(organizationId, walletAddress)
      default:
        throw new Error(`Unknown scenario: ${scenario}`)
    }
  }

  /**
   * Simple Buy → Sell scenario for basic gain/loss testing
   */
  private async generateSimpleBuySellScenario(organizationId: string, walletAddress: string): Promise<any> {
    const blockchain = await this.blockchainsEntityService.getByPublicId('solana')
    if (!blockchain) {
      throw new Error('Solana blockchain not found')
    }

    // Get or create test tokens
    const solToken = await this.getOrCreateSolToken()
    const usdcToken = await this.getOrCreateUsdcToken()

    const transactions = []

    // 0. INITIAL DEPOSIT: Start with some USDC balance to use for trading
    const initialDeposit = await this.createFakeTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      hash: this.generateFakeHash(),
      activity: SolFinancialTransactionParentActivity.RECEIVE,
      timestamp: new Date('2024-01-10T10:00:00Z'),
      children: [
        {
          // Incoming USDC (initial deposit)
          direction: SolFinancialTransactionChildMetadataDirection.INCOMING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: '3jzd4GX8xXeqJcH5xTHVYGDfJcpHeUXnF9FgfYKxpump', // Fake external address
          toAddress: walletAddress,
          tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          cryptocurrency: usdcToken,
          amount: '100.000000', // 100 USDC initial balance
          transactionId: 'initial-deposit',
          fiatAmountPerUnit: '1.00',
          fiatAmount: '100.00'
        }
      ]
    })
    transactions.push(initialDeposit)

    // 1. BUY: Receive 100 BONK tokens for 50 USDC (Cost basis: $0.0005 per BONK)
    const buyTransaction = await this.createFakeTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      hash: this.generateFakeHash(),
      activity: SolFinancialTransactionParentActivity.SWAP,
      timestamp: new Date('2024-01-15T10:00:00Z'),
      children: [
        {
          // Outgoing USDC (what we paid)
          direction: SolFinancialTransactionChildMetadataDirection.OUTGOING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: walletAddress,
          toAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Fake DEX address
          tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          cryptocurrency: usdcToken,
          amount: '50.000000', // 50 USDC
          transactionId: 'buy-usdc-out',
          fiatAmountPerUnit: '1.00', // $1 per USDC
          fiatAmount: '50.00'
        },
        {
          // Incoming BONK tokens (what we received)
          direction: SolFinancialTransactionChildMetadataDirection.INCOMING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Fake DEX address
          toAddress: walletAddress,
          tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
          cryptocurrency: await this.getOrCreateBonkToken(),
          amount: '100000.000000000', // 100k BONK
          transactionId: 'buy-bonk-in',
          fiatAmountPerUnit: '0.0005', // $0.0005 per BONK
          fiatAmount: '50.00'
        }
      ]
    })
    transactions.push(buyTransaction)

    // 2. SELL: Sell 60,000 BONK for 45 USDC (Price increased to $0.00075 per BONK)
    const sellTransaction = await this.createFakeTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      hash: this.generateFakeHash(),
      activity: SolFinancialTransactionParentActivity.SWAP,
      timestamp: new Date('2024-02-20T14:30:00Z'),
      children: [
        {
          // Outgoing BONK tokens (what we sold)
          direction: SolFinancialTransactionChildMetadataDirection.OUTGOING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: walletAddress,
          toAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Fake DEX address
          tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
          cryptocurrency: await this.getOrCreateBonkToken(),
          amount: '60000.000000000', // 60k BONK
          transactionId: 'sell-bonk-out',
          fiatAmountPerUnit: '0.00075', // $0.00075 per BONK (price increased!)
          fiatAmount: '45.00'
        },
        {
          // Incoming USDC (what we received)
          direction: SolFinancialTransactionChildMetadataDirection.INCOMING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Fake DEX address
          toAddress: walletAddress,
          tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          cryptocurrency: usdcToken,
          amount: '45.000000', // 45 USDC
          transactionId: 'sell-usdc-in',
          fiatAmountPerUnit: '1.00', // $1 per USDC
          fiatAmount: '45.00'
        }
      ]
    })
    transactions.push(sellTransaction)

    return {
      scenario: 'simple',
      transactions: transactions.length,
      expectedGainLoss: {
        description: 'Sold 60k BONK for $45, cost basis was $30 (60k * $0.0005), so gain = $15',
        soldAmount: '60000 BONK',
        costBasis: '$30.00',
        saleProceeds: '$45.00',
        expectedGain: '$15.00'
      },
      remainingPosition: {
        description: 'Should have 40k BONK remaining with cost basis of $20',
        amount: '40000 BONK',
        costBasis: '$20.00'
      },
      expectedBalances: {
        description: 'Final wallet balances after all transactions',
        USDC: '95.000000', // Started with 100, spent 50, received 45 = 95
        BONK: '40000.000000000' // Bought 100k, sold 60k = 40k remaining
      }
    }
  }

  /**
   * FIFO testing scenario with multiple buys and sells
   */
  private async generateFifoTestScenario(organizationId: string, walletAddress: string): Promise<any> {
    const blockchain = await this.blockchainsEntityService.getByPublicId('solana')
    if (!blockchain) {
      throw new Error('Solana blockchain not found')
    }

    const usdcToken = await this.getOrCreateUsdcToken()
    const bonkToken = await this.getOrCreateBonkToken()
    const transactions = []

    // Initial deposit: Start with USDC balance
    const initialDeposit = await this.createFakeTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      hash: this.generateFakeHash(),
      activity: SolFinancialTransactionParentActivity.RECEIVE,
      timestamp: new Date('2024-01-05T10:00:00Z'),
      children: [
        {
          direction: SolFinancialTransactionChildMetadataDirection.INCOMING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: '3jzd4GX8xXeqJcH5xTHVYGDfJcpHeUXnF9FgfYKxpump',
          toAddress: walletAddress,
          tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          cryptocurrency: usdcToken,
          amount: '200.000000', // 200 USDC initial balance
          transactionId: 'fifo-initial-deposit',
          fiatAmountPerUnit: '1.00',
          fiatAmount: '200.00'
        }
      ]
    })
    transactions.push(initialDeposit)

    // Buy #1: 100k BONK at $0.0004 each = $40
    transactions.push(await this.createSwapTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      timestamp: new Date('2024-01-10T10:00:00Z'),
      sellToken: usdcToken,
      sellAmount: '40.000000',
      sellPrice: '1.00',
      buyToken: bonkToken,
      buyAmount: '100000.000000000',
      buyPrice: '0.0004',
      transactionSuffix: 'buy1'
    }))

    // Buy #2: 150k BONK at $0.0006 each = $90
    transactions.push(await this.createSwapTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      timestamp: new Date('2024-01-20T10:00:00Z'),
      sellToken: usdcToken,
      sellAmount: '90.000000',
      sellPrice: '1.00',
      buyToken: bonkToken,
      buyAmount: '150000.000000000',
      buyPrice: '0.0006',
      transactionSuffix: 'buy2'
    }))

    // Buy #3: 200k BONK at $0.0008 each = $160
    transactions.push(await this.createSwapTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      timestamp: new Date('2024-02-01T10:00:00Z'),
      sellToken: usdcToken,
      sellAmount: '160.000000',
      sellPrice: '1.00',
      buyToken: bonkToken,
      buyAmount: '200000.000000000',
      buyPrice: '0.0008',
      transactionSuffix: 'buy3'
    }))

    // Sell #1: 120k BONK at $0.0010 each = $120 (should use FIFO: 100k from buy1 + 20k from buy2)
    transactions.push(await this.createSwapTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      timestamp: new Date('2024-02-15T14:00:00Z'),
      sellToken: bonkToken,
      sellAmount: '120000.000000000',
      sellPrice: '0.0010',
      buyToken: usdcToken,
      buyAmount: '120.000000',
      buyPrice: '1.00',
      transactionSuffix: 'sell1'
    }))

    // Sell #2: 80k BONK at $0.0012 each = $96 (should use FIFO: 80k from remaining buy2)
    transactions.push(await this.createSwapTransaction({
      organizationId,
      walletAddress,
      blockchainId: blockchain.publicId,
      timestamp: new Date('2024-03-01T16:00:00Z'),
      sellToken: bonkToken,
      sellAmount: '80000.000000000',
      sellPrice: '0.0012',
      buyToken: usdcToken,
      buyAmount: '96.000000',
      buyPrice: '1.00',
      transactionSuffix: 'sell2'
    }))

    return {
      scenario: 'fifo-test',
      transactions: transactions.length,
      expectedFifoCalculation: {
        totalBought: '450k BONK for $290 ($40 + $90 + $160)',
        totalSold: '200k BONK for $216 ($120 + $96)',
        sell1: {
          description: 'Sold 120k BONK for $120',
          fifoLots: [
            { amount: '100k BONK', costBasis: '$40', from: 'Buy #1' },
            { amount: '20k BONK', costBasis: '$12', from: 'Buy #2' }
          ],
          totalCostBasis: '$52',
          gain: '$68'
        },
        sell2: {
          description: 'Sold 80k BONK for $96',
          fifoLots: [
            { amount: '80k BONK', costBasis: '$48', from: 'Buy #2 (remaining 130k)' }
          ],
          totalCostBasis: '$48',
          gain: '$48'
        },
        totalGain: '$116',
        remainingPosition: {
          amount: '250k BONK',
          lots: [
            { amount: '50k BONK', costBasis: '$30', from: 'Buy #2 remaining' },
            { amount: '200k BONK', costBasis: '$160', from: 'Buy #3' }
          ],
          totalCostBasis: '$190'
        }
      },
      expectedBalances: {
        description: 'Final wallet balances after all transactions',
        USDC: '126.000000', // Started with 200, spent 290, received 216 = 126
        BONK: '250000.000000000' // Bought 450k, sold 200k = 250k remaining
      }
    }
  }

  private async createSwapTransaction(params: {
    organizationId: string
    walletAddress: string
    blockchainId: string
    timestamp: Date
    sellToken: any
    sellAmount: string
    sellPrice: string
    buyToken: any
    buyAmount: string
    buyPrice: string
    transactionSuffix: string
  }): Promise<any> {
    return await this.createFakeTransaction({
      organizationId: params.organizationId,
      walletAddress: params.walletAddress,
      blockchainId: params.blockchainId,
      hash: this.generateFakeHash(),
      activity: SolFinancialTransactionParentActivity.SWAP,
      timestamp: params.timestamp,
      children: [
        {
          // Outgoing token
          direction: SolFinancialTransactionChildMetadataDirection.OUTGOING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: params.walletAddress,
          toAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
          tokenAddress: this.getTokenAddress(params.sellToken),
          cryptocurrency: params.sellToken,
          amount: params.sellAmount,
          transactionId: `${params.transactionSuffix}-out`,
          fiatAmountPerUnit: params.sellPrice,
          fiatAmount: (parseFloat(params.sellAmount) * parseFloat(params.sellPrice)).toFixed(2)
        },
        {
          // Incoming token
          direction: SolFinancialTransactionChildMetadataDirection.INCOMING,
          type: SolFinancialTransactionChildMetadataType.TOKEN_TRANSFER,
          fromAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
          toAddress: params.walletAddress,
          tokenAddress: this.getTokenAddress(params.buyToken),
          cryptocurrency: params.buyToken,
          amount: params.buyAmount,
          transactionId: `${params.transactionSuffix}-in`,
          fiatAmountPerUnit: params.buyPrice,
          fiatAmount: (parseFloat(params.buyAmount) * parseFloat(params.buyPrice)).toFixed(2)
        }
      ]
    })
  }

  private getTokenAddress(token: any): string {
    if (token.symbol === 'USDC') return 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    if (token.symbol === 'BONK') return 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
    if (token.symbol === 'SOL') return 'So11111111111111111111111111111111111111112'
    return token.addresses?.[0]?.address || 'unknown'
  }

  private async createFakeTransaction(params: {
    organizationId: string
    walletAddress: string
    blockchainId: string
    hash: string
    activity: SolFinancialTransactionParentActivity
    timestamp: Date
    children: Array<{
      direction: SolFinancialTransactionChildMetadataDirection
      type: SolFinancialTransactionChildMetadataType
      fromAddress: string
      toAddress: string
      tokenAddress: string
      cryptocurrency: any
      amount: string
      transactionId: string
      fiatAmountPerUnit?: string
      fiatAmount?: string
    }>
  }): Promise<any> {
    // Create parent transaction (bypasses automatic gain/loss calculation)
    const parentDto: CreateSolFinancialTransactionParentDto = {
      publicId: params.hash,
      hash: params.hash,
      blockchainId: params.blockchainId,
      activity: params.activity,
      status: SolFinancialTransactionParentStatus.ACTIVE,
      exportStatus: SolFinancialTransactionParentExportStatus.PENDING,
      organizationId: params.organizationId,
      valueTimestamp: params.timestamp,
      blockNumber: Math.floor(Math.random() * 1000000) + 200000000,
      slot: Math.floor(Math.random() * 100000000) + 250000000,
      fee: '0.000005',
      remark: null
    }

    const parentTransaction = await this.solFinancialTransactionsEntityService.createOrUpdateParent(parentDto)

    // Create child transactions (directly via entity service - skips automatic gain/loss calculation)
    const children = []
    for (const childData of params.children) {
      const childDto: CreateSolFinancialTransactionChildDto = {
        publicId: `${params.hash}-${childData.transactionId}`,
        hash: params.hash,
        blockchainId: params.blockchainId,
        fromAddress: childData.fromAddress,
        toAddress: childData.toAddress,
        tokenAddress: childData.tokenAddress,
        cryptocurrency: childData.cryptocurrency,
        cryptocurrencyAmount: childData.amount,
        valueTimestamp: params.timestamp,
        organizationId: params.organizationId,
        solFinancialTransactionParent: parentTransaction,
        transactionId: childData.transactionId,
        instructionIndex: 0,
        type: childData.type,
        direction: childData.direction,
        status: SolFinancialTransactionChildMetadataStatus.SYNCED,
        gainLossInclusionStatus: SolGainLossInclusionStatus.ALL,
        solanaMetadata: {
          program: 'fake-dex',
          instruction: 'swap',
          kind: childData.direction === SolFinancialTransactionChildMetadataDirection.INCOMING ? 'IN' : 'OUT'
        }
      }

      const childTransaction = await this.solFinancialTransactionsEntityService.upsertChild(childDto)
      
      // Manually update metadata with fiat amounts for proper gain/loss calculation
      if (childTransaction.solFinancialTransactionChildMetadata && (childData.fiatAmount || childData.fiatAmountPerUnit)) {
        const metadata = childTransaction.solFinancialTransactionChildMetadata
        metadata.fiatAmount = childData.fiatAmount || '0'
        metadata.fiatAmountPerUnit = childData.fiatAmountPerUnit || '0'
        metadata.fiatCurrency = 'USD'
        metadata.fiatAmountUpdatedBy = 'fake-data-generator'
        metadata.fiatAmountUpdatedAt = new Date()
        metadata.fiatAmountPerUnitUpdatedBy = 'fake-data-generator'
        metadata.fiatAmountPerUnitUpdatedAt = new Date()
        
        // Save the updated metadata
        await this.metadataRepository.save(metadata)
      }
      
      children.push(childTransaction)
    }

    return {
      parent: parentTransaction,
      children,
      hash: params.hash
    }
  }

  private async getOrCreateSolToken(): Promise<any> {
    try {
      return await this.cryptocurrenciesEntityService.getBySymbol('SOL')
    } catch {
      // If not found, create it (simplified - in real app you'd use proper creation)
      throw new Error('SOL token not found - please ensure cryptocurrencies are seeded')
    }
  }

  private async getOrCreateUsdcToken(): Promise<any> {
    try {
      return await this.cryptocurrenciesEntityService.getBySymbol('USDC')
    } catch {
      throw new Error('USDC token not found - please ensure cryptocurrencies are seeded')
    }
  }

  private async getOrCreateBonkToken(): Promise<any> {
    try {
      return await this.cryptocurrenciesEntityService.getBySymbol('BONK')
    } catch {
      throw new Error('BONK token not found - please ensure cryptocurrencies are seeded')
    }
  }

  private generateFakeHash(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

    /**
   * Clean up test data - removes all Solana fake test transactions
   */
  async cleanupTestData(organizationId: string): Promise<{ deleted: number; message: string }> {
    this.logger.debug('Cleaning up test data for organization:', organizationId)
    
    try {
      // Simple approach: delete transactions involving our known fake addresses
      const fakeAddresses = [
        '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Fake DEX
        '3jzd4GX8xXeqJcH5xTHVYGDfJcpHeUXnF9FgfYKxpump' // Fake external address
      ]
      
      let totalDeleted = 0
      
      for (const fakeAddress of fakeAddresses) {
        // Find and delete transactions involving fake addresses
        const deleteQuery = `
          WITH parent_ids AS (
            SELECT DISTINCT p.id
            FROM sol_financial_transaction_parent p
            INNER JOIN sol_financial_transaction_child c ON c.sol_financial_transaction_parent_id = p.id
            WHERE p.organization_id = $1 
            AND (c.from_address = $2 OR c.to_address = $2)
          ),
          child_ids AS (
            SELECT c.id
            FROM sol_financial_transaction_child c
            WHERE c.sol_financial_transaction_parent_id IN (SELECT id FROM parent_ids)
          ),
          deleted_metadata AS (
            DELETE FROM sol_financial_transaction_child_metadata 
            WHERE sol_financial_transaction_child_id IN (SELECT id FROM child_ids)
            RETURNING 1
          ),
          deleted_children AS (
            DELETE FROM sol_financial_transaction_child 
            WHERE sol_financial_transaction_parent_id IN (SELECT id FROM parent_ids)
            RETURNING 1
          ),
          deleted_parents AS (
            DELETE FROM sol_financial_transaction_parent 
            WHERE id IN (SELECT id FROM parent_ids)
            RETURNING 1
          )
          SELECT 
            (SELECT COUNT(*) FROM deleted_metadata) as metadata_deleted,
            (SELECT COUNT(*) FROM deleted_children) as children_deleted,
            (SELECT COUNT(*) FROM deleted_parents) as parents_deleted
        `
        
        const result = await this.solFinancialTransactionsEntityService['solFinancialTransactionParentRepository']
          .query(deleteQuery, [organizationId, fakeAddress])
        
        if (result && result[0]) {
          totalDeleted += parseInt(result[0].metadata_deleted || 0) + 
                         parseInt(result[0].children_deleted || 0) + 
                         parseInt(result[0].parents_deleted || 0)
        }
      }
      
      this.logger.debug('Test data cleanup completed', {
        organizationId,
        totalDeleted
      })
      
      return {
        deleted: totalDeleted,
        message: `Cleaned up ${totalDeleted} fake transaction records`
      }
    } catch (error) {
      this.logger.error('Error cleaning up test data:', error)
      throw error
    }
  }

  /**
   * Truncate ALL Solana financial transaction data for an organization
   * WARNING: This will delete ALL Solana transaction data, not just fake data
   */
  async truncateAllSolanaTransactions(organizationId: string): Promise<{ deleted: number; message: string }> {
    this.logger.debug('TRUNCATING ALL SOLANA TRANSACTIONS for organization:', organizationId)
    
    try {
      // Count and delete all Solana transactions for the organization
      const truncateQuery = `
        WITH child_ids AS (
          SELECT c.id
          FROM sol_financial_transaction_child c
          INNER JOIN sol_financial_transaction_parent p ON c.sol_financial_transaction_parent_id = p.id
          WHERE p.organization_id = $1
        ),
        deleted_metadata AS (
          DELETE FROM sol_financial_transaction_child_metadata 
          WHERE sol_financial_transaction_child_id IN (SELECT id FROM child_ids)
          RETURNING 1
        ),
        deleted_children AS (
          DELETE FROM sol_financial_transaction_child 
          WHERE sol_financial_transaction_parent_id IN (
            SELECT id FROM sol_financial_transaction_parent WHERE organization_id = $1
          )
          RETURNING 1
        ),
        deleted_parents AS (
          DELETE FROM sol_financial_transaction_parent WHERE organization_id = $1
          RETURNING 1
        )
        SELECT 
          (SELECT COUNT(*) FROM deleted_metadata) as metadata_deleted,
          (SELECT COUNT(*) FROM deleted_children) as children_deleted,
          (SELECT COUNT(*) FROM deleted_parents) as parents_deleted
      `
      
      const result = await this.solFinancialTransactionsEntityService['solFinancialTransactionParentRepository']
        .query(truncateQuery, [organizationId])
      
      const totalDeleted = result && result[0] 
        ? parseInt(result[0].metadata_deleted || 0) + 
          parseInt(result[0].children_deleted || 0) + 
          parseInt(result[0].parents_deleted || 0)
        : 0
      
      this.logger.debug('All Solana transactions truncated', {
        organizationId,
        totalDeleted
      })
      
      return {
        deleted: totalDeleted,
        message: `Truncated ${totalDeleted} total Solana transaction records`
      }
    } catch (error) {
      this.logger.error('Error truncating Solana transactions:', error)
      throw error
    }
  }
}