import { Injectable } from '@nestjs/common'
import { Connection, PublicKey, ParsedTransactionWithMeta, GetProgramAccountsFilter } from '@solana/web3.js'
import { SortingOrder } from 'alchemy-sdk'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { SupportedBlockchains } from '../../../shared/entity-services/blockchains/interfaces'
import { AddressBalance } from '../types/balance'
import { TransactionResponsePaginated, TransactionResponse } from '../interfaces'
import { AlchemySyncMetaData } from '../types/sync-meta-data.type'

export interface HeliusTransactionResponse {
  signature: string
  slot: number
  timestamp: number
  fee: number
  feePayer: string
  success: boolean
  source: string
  type: string
  accountData: Array<{
    account: string
    nativeBalanceChange: number
    tokenBalanceChanges: Array<{
      mint: string
      rawTokenAmount: {
        tokenAmount: string
        decimals: number
      }
      tokenAccount: string
      userAccount: string
    }>
  }>
  instructions: Array<{
    accounts: string[]
    data: string
    programId: string
    innerInstructions: any[]
  }>
  events: any
}

export interface HeliusBalanceResponse {
  tokens: Array<{
    tokenAccount: string
    mint: string
    amount: number
    decimals: number
    owner: string
  }>
  nativeBalance: number
}

export interface SolanaTransactionResponse {
  signature: string
  slot: number
  blockTime: number | null
  meta: any
  transaction: any
}

export interface SolanaBalanceResponse {
  address: string
  balance: number // lamports
  tokenBalances?: Array<{
    mint: string
    amount: string
    decimals: number
  }>
}

@Injectable()
export class SolanaAdapter {
  private connections: Map<SupportedBlockchains, Connection> = new Map()
  private heliusApiUrls: Map<SupportedBlockchains, string> = new Map()

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const heliusApiKey = this.configService.get('HELIUS_API_KEY')
    
    // Initialize Solana connections
    this.connections.set(
      SupportedBlockchains.SOLANA_MAINNET, 
      new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
    )
    this.connections.set(
      SupportedBlockchains.SOLANA_DEVNET, 
      new Connection('https://api.devnet.solana.com', 'confirmed')
    )

    // Initialize Helius API URLs
    if (heliusApiKey) {
      this.heliusApiUrls.set(
        SupportedBlockchains.SOLANA_MAINNET,
        `https://api.helius.xyz/v0`
      )
      this.heliusApiUrls.set(
        SupportedBlockchains.SOLANA_DEVNET,
        `https://api-devnet.helius.xyz/v0`
      )
    }
  }

  private getConnection(blockchain: SupportedBlockchains): Connection {
    const connection = this.connections.get(blockchain)
    if (!connection) {
      throw new Error(`Unsupported Solana blockchain: ${blockchain}`)
    }
    return connection
  }

  private getHeliusApiUrl(blockchain: SupportedBlockchains): string | null {
    return this.heliusApiUrls.get(blockchain) || null
  }

  private async fetchHeliusTransactions(
    address: string,
    blockchain: SupportedBlockchains,
    before?: string,
    limit: number = 100
  ): Promise<HeliusTransactionResponse[]> {
    const apiUrl = this.getHeliusApiUrl(blockchain)
    const heliusApiKey = this.configService.get('HELIUS_API_KEY')
    
    if (!apiUrl || !heliusApiKey) {
      console.warn('Helius API not configured, falling back to basic RPC')
      return []
    }

    try {
      const params: any = {
        api_key: heliusApiKey,
        limit,
        source: 'HELIUS_ENHANCED'
      }
      
      if (before) {
        params.before = before
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/addresses/${address}/transactions`, {
          params
        })
      )

      return response.data || []
    } catch (error) {
      console.error('Error fetching Helius transactions:', error)
      return []
    }
  }

  async getBalance(address: string): Promise<AddressBalance[]> {
    // For Solana, we need to determine the blockchain based on the address or use mainnet as default
    const blockchain = SupportedBlockchains.SOLANA_MAINNET
    
    // Try Helius API first for enhanced balance data
    const heliusBalance = await this.fetchHeliusBalance(address, blockchain)
    if (heliusBalance) {
      return this.processHeliusBalance(heliusBalance)
    }

    // Fallback to basic RPC
    return this.getBasicBalance(address, blockchain)
  }

  private async fetchHeliusBalance(
    address: string,
    blockchain: SupportedBlockchains
  ): Promise<HeliusBalanceResponse | null> {
    const apiUrl = this.getHeliusApiUrl(blockchain)
    const heliusApiKey = this.configService.get('HELIUS_API_KEY')
    
    if (!apiUrl || !heliusApiKey) {
      return null
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/addresses/${address}/balances`, {
          params: {
            api_key: heliusApiKey
          }
        })
      )

      return response.data
    } catch (error) {
      console.warn('Error fetching Helius balance, falling back to RPC:', error)
      return null
    }
  }

  private processHeliusBalance(heliusBalance: HeliusBalanceResponse): AddressBalance[] {
    const balances: AddressBalance[] = []

    // Add SOL native balance
    balances.push({
      tokenAddress: 'SOL',
      balance: heliusBalance.nativeBalance.toString()
    })

    // Add SPL token balances
    for (const token of heliusBalance.tokens) {
      if (token.amount > 0) { // Only include tokens with positive balance
        balances.push({
          tokenAddress: token.mint,
          balance: token.amount.toString()
        })
      }
    }

    return balances
  }

  private async getBasicBalance(address: string, blockchain: SupportedBlockchains): Promise<AddressBalance[]> {
    const connection = this.getConnection(blockchain)
    const publicKey = new PublicKey(address)
    
    const balances: AddressBalance[] = []
    
    // Get SOL balance (native token)
    const solBalance = await connection.getBalance(publicKey)
    balances.push({
      tokenAddress: 'SOL', // Native SOL token
      balance: solBalance.toString()
    })
    
    // Get SPL token balances
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') // SPL Token program
      })

      for (const account of tokenAccounts.value) {
        const tokenInfo = account.account.data.parsed.info
        balances.push({
          tokenAddress: tokenInfo.mint,
          balance: tokenInfo.tokenAmount.amount
        })
      }
    } catch (error) {
      console.warn('Error fetching SPL token balances:', error)
    }

    return balances
  }

  async getTransactionsByAddress(
    address: string,
    meta: AlchemySyncMetaData,
    validatorFn: (hash: string) => Promise<{ loadInternal: boolean; loadReceipt: boolean }>
  ): Promise<TransactionResponsePaginated> {
    const blockchain = SupportedBlockchains.SOLANA_MAINNET
    
    try {
      // Try Helius API first for enhanced transaction data
      const heliusTransactions = await this.fetchHeliusTransactions(
        address,
        blockchain,
        meta.nextPageId,
        100
      )

      if (heliusTransactions.length > 0) {
        return this.processHeliusTransactions(heliusTransactions, meta, address)
      }

      // Fallback to basic RPC if Helius is not available
      return this.processBasicRpcTransactions(address, blockchain, meta)
    } catch (error) {
      console.error('Error fetching Solana transactions:', error)
      return {
        nextPageId: undefined,
        order: SortingOrder.DESCENDING,
        direction: meta.direction,
        lastBlock: undefined,
        firstBlock: undefined,
        response: []
      }
    }
  }

  private async processHeliusTransactions(
    heliusTransactions: HeliusTransactionResponse[],
    meta: AlchemySyncMetaData,
    address: string
  ): Promise<TransactionResponsePaginated> {
    const response: TransactionResponse[] = []

    for (const tx of heliusTransactions) {
      // Find account data for this address
      const accountData = tx.accountData.find(acc => acc.account === address)
      const nativeChange = accountData?.nativeBalanceChange || 0
      const tokenChanges = accountData?.tokenBalanceChanges || []

      // Convert Helius transaction to our format
      const transactionResponse: TransactionResponse = {
        hash: tx.signature,
        blockNumber: tx.slot.toString(),
        blockTimestamp: tx.timestamp.toString(),
        receipt: {
          transactionHash: tx.signature,
          blockNumber: tx.slot,
          status: tx.success ? 1 : 0,
          gasUsed: tx.fee.toString(),
          logs: []
        } as any,
        transfers: tokenChanges.map(change => ({
          hash: tx.signature,
          blockNum: tx.slot.toString(),
          from: change.userAccount,
          to: address,
          value: change.rawTokenAmount.tokenAmount,
          tokenId: change.mint,
          asset: change.mint,
          category: 'erc20' as any,
          rawContract: {
            address: change.mint,
            decimals: change.rawTokenAmount.decimals
          }
        } as any)),
        internal: [],
        external: nativeChange !== 0 ? {
          hash: tx.signature,
          blockNum: tx.slot.toString(),
          from: nativeChange < 0 ? address : tx.feePayer,
          to: nativeChange > 0 ? address : 'unknown',
          value: Math.abs(nativeChange).toString(),
          asset: 'SOL',
          category: 'external' as any
        } as any : undefined
      }

      response.push(transactionResponse)
    }

    return {
      nextPageId: heliusTransactions.length > 0 ? heliusTransactions[heliusTransactions.length - 1].signature : undefined,
      order: SortingOrder.DESCENDING,
      direction: meta.direction,
      lastBlock: heliusTransactions.length > 0 ? heliusTransactions[0].slot.toString() : undefined,
      firstBlock: heliusTransactions.length > 0 ? heliusTransactions[heliusTransactions.length - 1].slot.toString() : undefined,
      response
    }
  }

  private async processBasicRpcTransactions(
    address: string,
    blockchain: SupportedBlockchains,
    meta: AlchemySyncMetaData
  ): Promise<TransactionResponsePaginated> {
    const connection = this.getConnection(blockchain)
    const publicKey = new PublicKey(address)
    
    // Get confirmed signature info for the address
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 100,
      before: meta.nextPageId
    })

    const response: TransactionResponse[] = []
    
    for (const sig of signatures) {
      // Basic transaction response for Solana
      const transactionResponse: TransactionResponse = {
        hash: sig.signature,
        blockNumber: sig.slot?.toString() || '0',
        blockTimestamp: sig.blockTime?.toString() || '0',
        receipt: null, // Solana doesn't have receipts like Ethereum
        transfers: [], // Would need to parse transaction data for transfers
        internal: [],
        external: undefined
      }
      
      response.push(transactionResponse)
    }

    return {
      nextPageId: signatures.length > 0 ? signatures[signatures.length - 1].signature : undefined,
      order: SortingOrder.DESCENDING,
      direction: meta.direction,
      lastBlock: signatures.length > 0 ? signatures[0].slot?.toString() : undefined,
      firstBlock: signatures.length > 0 ? signatures[signatures.length - 1].slot?.toString() : undefined,
      response
    }
  }

  async getTransactionReceiptViaAPI(txHash: string): Promise<any> {
    const blockchain = SupportedBlockchains.SOLANA_MAINNET
    const connection = this.getConnection(blockchain)
    
    try {
      const transaction = await connection.getTransaction(txHash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      })
      
      return {
        transactionHash: txHash,
        blockNumber: transaction?.slot?.toString() || '0',
        status: transaction?.meta?.err ? 0 : 1,
        gasUsed: '0', // Solana uses compute units, not gas
        logs: transaction?.meta?.logMessages || []
      }
    } catch (error) {
      console.error('Error fetching Solana transaction receipt:', error)
      return null
    }
  }

  async getTransaction(
    signature: string,
    blockchain: SupportedBlockchains
  ): Promise<SolanaTransactionResponse | null> {
    const connection = this.getConnection(blockchain)
    
    const transaction = await connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })

    if (!transaction) {
      return null
    }

    return {
      signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      meta: transaction.meta,
      transaction: transaction.transaction
    }
  }

  async getTokenMetadata(mint: string, blockchain: SupportedBlockchains) {
    const connection = this.getConnection(blockchain)
    
    try {
      // For SPL tokens, you'd typically need to fetch metadata from a metadata program
      // This is a simplified version
      const mintPublicKey = new PublicKey(mint)
      const mintInfo = await connection.getParsedAccountInfo(mintPublicKey)
      
      const data = mintInfo.value?.data
      if (data && 'parsed' in data) {
        return {
          mint,
          decimals: data.parsed?.info?.decimals || 9,
          supply: data.parsed?.info?.supply || '0'
        }
      }
      
      return {
        mint,
        decimals: 9,
        supply: '0'
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error)
      return null
    }
  }

  isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }
}