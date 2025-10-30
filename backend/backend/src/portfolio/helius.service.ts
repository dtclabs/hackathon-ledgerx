import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { LoggerService } from '../shared/logger/logger.service'
import { HeliusWalletBalance, WalletBalance, TokenBalance, PriceData, JupiterTokenInfo } from './interfaces'

@Injectable()
export class HeliusService {
  private readonly heliusApiKey: string
  private readonly heliusBaseUrl = 'https://api.helius.xyz/v0'

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {
    this.heliusApiKey = this.configService.get('HELIUS_API_KEY')
  }

  async getWalletBalance(address: string): Promise<WalletBalance> {
    try {
      const url = `${this.heliusBaseUrl}/addresses/${address}/balances`
      const params = {
        'api-key': this.heliusApiKey
      }

      this.logger.info('Fetching comprehensive wallet balance from Helius', { address })

      const response = await firstValueFrom(
        this.httpService.get<HeliusWalletBalance>(url, { params })
      )

      const heliusBalance = response.data

      // Get all token mints including SOL
      const tokenMints = heliusBalance.tokens.map(token => token.mint)
      // Add SOL mint address for price fetching
      const allMints = ['So11111111111111111111111111111111111111112', ...tokenMints]
      
      // Fetch prices for all tokens from Jupiter
      const priceData = await this.getTokenPrices(allMints)
      
      // Fetch token metadata from Jupiter v2 search API for better symbol/name resolution
      const tokenInfoMap = await this.getJupiterTokenInfoBatch(tokenMints)

      // Get SOL price specifically
      const solPriceData = priceData.find(p => p.address === 'So11111111111111111111111111111111111111112')
      const solPrice = solPriceData?.price || await this.getSolanaPrice()
      
      // Calculate SOL balance and value
      const solUiAmount = heliusBalance.nativeBalance / 1e9
      const solValueUsd = solUiAmount * solPrice

      // Convert all token balances with prices and USD values
      const tokenBalances: TokenBalance[] = heliusBalance.tokens
        .map(token => {
          const price = priceData.find(p => p.address === token.mint)
          const uiAmount = parseFloat(token.amount) / Math.pow(10, token.decimals)
          const valueUsd = price ? uiAmount * price.price : 0

          // Get token info from Jupiter v2 search API for better symbol/name resolution
          const jupiterTokenInfo = tokenInfoMap.get(token.mint)
          const symbol = jupiterTokenInfo?.symbol || token.tokenSymbol || this.getTokenSymbolFromMint(token.mint)

          return {
            symbol,
            address: token.mint,
            amount: token.amount,
            decimals: token.decimals,
            uiAmount,
            priceUsd: price?.price || 0,
            valueUsd,
            priceChange24h: price?.priceChange24h,
            // Add additional metadata from Jupiter if available
            name: jupiterTokenInfo?.name,
            icon: jupiterTokenInfo?.icon
          }
        })
        .filter(token => token.valueUsd > 0) // Only include tokens with value

      // Calculate total portfolio value
      const totalValueUsd = solValueUsd + tokenBalances.reduce((sum, token) => 
        sum + (token.valueUsd || 0), 0
      )

      // Add SOL as the first token with percentage
      const solTokenBalance: TokenBalance = {
        symbol: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        amount: heliusBalance.nativeBalance.toString(),
        decimals: 9,
        uiAmount: solUiAmount,
        priceUsd: solPrice,
        valueUsd: solValueUsd,
        percentage: totalValueUsd > 0 ? (solValueUsd / totalValueUsd) * 100 : 0,
        priceChange24h: solPriceData?.priceChange24h
      }

      // Add percentages to all tokens and sort by value
      const allTokensWithPercentages = [solTokenBalance, ...tokenBalances.map(token => ({
        ...token,
        percentage: totalValueUsd > 0 ? (token.valueUsd / totalValueUsd) * 100 : 0
      }))].sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0))

      this.logger.info('Wallet balance fetched successfully', { 
        address, 
        totalValueUsd, 
        tokenCount: allTokensWithPercentages.length 
      })

      return {
        address,
        blockchain: 'solana',
        nativeBalance: solTokenBalance,
        tokenBalances: allTokensWithPercentages,
        totalValueUsd,
        lastUpdated: new Date()
      }
    } catch (error) {
      this.logger.error('Failed to fetch wallet balance from Helius', error, { address })
      throw new Error(`Failed to fetch wallet balance: ${error.message}`)
    }
  }

  async getTokenPrices(tokenMints: string[]): Promise<PriceData[]> {
    if (tokenMints.length === 0) return []

    try {
      // Use Jupiter API v3 for token prices (more comprehensive for Solana)
      // Example: https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112,JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN
      const url = 'https://lite-api.jup.ag/price/v3'
      const params = {
        ids: tokenMints.join(',')
      }

      this.logger.debug('Fetching prices for tokens', { tokenCount: tokenMints.length, tokens: tokenMints })

      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      )

      const priceData: PriceData[] = []
      // Jupiter v3 API response: direct object with mint addresses as keys
      const data = response.data

      for (const mint of tokenMints) {
        if (data[mint]) {
          const tokenData = data[mint]
          priceData.push({
            symbol: this.getTokenSymbolFromMint(mint),
            address: mint,
            price: tokenData.usdPrice,
            source: 'jupiter',
            timestamp: new Date()
          })
          
          this.logger.debug('Price fetched successfully', { 
            mint,
            symbol: this.getTokenSymbolFromMint(mint), 
            price: tokenData.usdPrice,
            priceChange24h: tokenData.priceChange24h,
            decimals: tokenData.decimals
          })
        } else {
          this.logger.debug('No price data found for token', { mint })
        }
      }

      return priceData
    } catch (error) {
      this.logger.error('Failed to fetch token prices from Jupiter v6 API', error)
      return []
    }
  }

  async getSolanaPrice(): Promise<number> {
    try {
      const url = 'https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112'
      const response = await firstValueFrom(this.httpService.get(url))
      
      // v3 API response structure: direct object with mint as key
      return response.data['So11111111111111111111111111111111111111112']?.usdPrice || 0
    } catch (error) {
      this.logger.error('Failed to fetch SOL price', error)
      return 0
    }
  }

  private getTokenSymbolFromMint(mint: string): string {
    // Known Solana token mint addresses and their symbols
    const knownTokens: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
      'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': 'bSOL'
    }

    return knownTokens[mint] || 'UNKNOWN'
  }

  async getTokenMetadata(tokenMints: string[]): Promise<any[]> {
    try {
      const url = `${this.heliusBaseUrl}/token-metadata`
      const params = {
        'api-key': this.heliusApiKey
      }

      const response = await firstValueFrom(
        this.httpService.post(url, { mintAccounts: tokenMints }, { params })
      )

      return response.data
    } catch (error) {
      this.logger.error('Failed to fetch token metadata from Helius', error)
      return []
    }
  }

  async getTransactionHistory(address: string, limit = 100): Promise<any[]> {
    try {
      const url = `${this.heliusBaseUrl}/addresses/${address}/transactions`
      const params = {
        'api-key': this.heliusApiKey,
        limit: limit.toString()
      }

      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      )

      return response.data
    } catch (error) {
      this.logger.error('Failed to fetch transaction history from Helius', error, { address })
      return []
    }
  }

  /**
   * Get token information from Jupiter's tokens v2 search API
   * Example: https://lite-api.jup.ag/tokens/v2/search?query=HfMbPyDdZH6QMaDDUokjYCkHxzjoGBMpgaUvpLWGbF5p
   */
  async getJupiterTokenInfo(tokenAddress: string): Promise<JupiterTokenInfo | null> {
    try {
      const url = `https://lite-api.jup.ag/tokens/v2/search`
      const params = {
        query: tokenAddress
      }

      this.logger.debug('Fetching token info from Jupiter v2 search API', { tokenAddress })

      const response = await firstValueFrom(
        this.httpService.get<JupiterTokenInfo[]>(url, { params })
      )

      if (response.data && response.data.length > 0) {
        const tokenInfo = response.data[0] // Get the first match
        this.logger.debug('Token info found', {
          address: tokenAddress,
          name: tokenInfo.name,
          symbol: tokenInfo.symbol
        })
        return tokenInfo
      }

      this.logger.debug('No token info found', { tokenAddress })
      return null
    } catch (error) {
      this.logger.error('Failed to fetch token info from Jupiter', error, { tokenAddress })
      return null
    }
  }

  /**
   * Get token information for multiple addresses in batch
   */
  async getJupiterTokenInfoBatch(tokenAddresses: string[]): Promise<Map<string, JupiterTokenInfo>> {
    const tokenInfoMap = new Map<string, JupiterTokenInfo>()
    
    this.logger.info('Fetching token info for multiple tokens', { count: tokenAddresses.length })
    
    // Process in parallel but limit concurrency to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batch = tokenAddresses.slice(i, i + batchSize)
      const promises = batch.map(async address => {
        const tokenInfo = await this.getJupiterTokenInfo(address)
        if (tokenInfo) {
          tokenInfoMap.set(address, tokenInfo)
        }
        return { address, tokenInfo }
      })
      
      await Promise.all(promises)
      
      // Small delay between batches to be respectful to the API
      if (i + batchSize < tokenAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    this.logger.info('Token info batch fetch completed', {
      requested: tokenAddresses.length,
      found: tokenInfoMap.size
    })
    
    return tokenInfoMap
  }
}