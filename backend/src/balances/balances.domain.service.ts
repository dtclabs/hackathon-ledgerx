import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { ConfigService } from '@nestjs/config'
import { TaxLotsDomainService } from '../domain/tax-lots/tax-lots.domain.service'
import { PricesService } from '../prices/prices.service'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { OrganizationSettingsEntityService } from '../shared/entity-services/organization-settings/organization-settings.entity-service'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import { BalanceDtoBuilder } from './balanceDto.builder'
import { AssetBalanceQueryParams } from './interfaces'
import { BalanceGroupByFieldEnum } from './types'
import { PortfolioService } from '../portfolio/portfolio.service'

@Injectable()
export class BalancesDomainService {
  constructor(
    private logger: LoggerService,
    private walletsService: WalletsEntityService,
    private pricesService: PricesService,
    private taxLotsDomainService: TaxLotsDomainService,
    private blockchainsEntityService: BlockchainsEntityService,
    private organizationSettingsEntityService: OrganizationSettingsEntityService,
    private configService: ConfigService,
    private portfolioService: PortfolioService
  ) {}

  async getBalanceByOrganization(organizationId: string, params: AssetBalanceQueryParams) {
    let wallets: Wallet[] = []
    if (params.walletIds?.length) {
      wallets = await this.walletsService.getByOrganizationAndPublicIds(organizationId, params.walletIds)
    } else {
      wallets = await this.walletsService.getAllByOrganizationId(organizationId)
    }

    // Only handle Solana wallets, remove EVM support
    const solanaWallets = wallets.filter(wallet => 
      wallet.supportedBlockchains.some(chain => chain.includes('solana'))
    )

    this.logger.info('Processing Solana-only balance calculation', {
      totalWallets: wallets.length,
      solanaWallets: solanaWallets.length,
      organizationId,
      groupBy: params.groupBy,
      secondGroupBy: params.secondGroupBy
    })

    if (solanaWallets.length === 0) {
      this.logger.debug('No Solana wallets found, returning empty balance')
      const organizationSetting = await this.organizationSettingsEntityService.getByOrganizationId(organizationId, {
        fiatCurrency: true
      })
      
      return {
        value: '0',
        fiatCurrency: organizationSetting.fiatCurrency.alphabeticCode || 'USD',
        groups: {}
      }
    }

    // Handle nested grouping: groupBy=walletId&secondGroupBy=blockchainId
    if (params.groupBy === BalanceGroupByFieldEnum.WALLET_ID && 
        params.secondGroupBy === BalanceGroupByFieldEnum.BLOCKCHAIN_ID) {
      return await this.getWalletBlockchainNestedBalance(organizationId, solanaWallets, params)
    }

    // Use the token-level balance method to show individual tokens as groups
    return await this.getTokenLevelBalance(organizationId, params)
  }

  private async getSolanaBalanceBuilder(wallets: Wallet[], organizationId: string, blockchainIds: string[]): Promise<BalanceDtoBuilder> {
    const balanceBuilder = new BalanceDtoBuilder(wallets)
    
    // Create test data for Solana wallets
    this.logger.debug('Creating test balance data for Solana wallets', { 
      walletCount: wallets.length, 
      organizationId 
    })
    
    // Mock cryptocurrency entities for test data
    const mockCryptocurrencies = [
      { id: 'bonk-id', symbol: 'BONK', name: 'Bonk', blockchain: 'solana' },
      { id: 'usdc-id', symbol: 'USDC', name: 'USD Coin', blockchain: 'solana' },
      { id: 'sol-id', symbol: 'SOL', name: 'Solana', blockchain: 'solana' },
      { id: 'jup-id', symbol: 'JUP', name: 'Jupiter', blockchain: 'solana' }
    ]
    
    // Mock tax lots with realistic balances
    const mockTaxLots = []
    
    for (const wallet of wallets) {
      if (wallet.supportedBlockchains.some(chain => chain.includes('solana'))) {
        // Create tax lots for different tokens
        const tokenBalances = [
          { symbol: 'BONK', amount: '15000000', fiatValue: '150.00', cryptoId: 'bonk-id' },
          { symbol: 'USDC', amount: '2500.50', fiatValue: '2500.50', cryptoId: 'usdc-id' },
          { symbol: 'SOL', amount: '12.5', fiatValue: '2100.00', cryptoId: 'sol-id' },
          { symbol: 'JUP', amount: '850.75', fiatValue: '425.38', cryptoId: 'jup-id' }
        ]
        
        tokenBalances.forEach((tokenBalance, index) => {
          const mockCrypto = mockCryptocurrencies.find(c => c.id === tokenBalance.cryptoId)
          if (mockCrypto) {
            const costBasisPerUnit = parseFloat(tokenBalance.fiatValue) / parseFloat(tokenBalance.amount)
            const mockTaxLot = {
              id: `${wallet.id}-${tokenBalance.symbol}-${index}`,
              walletId: wallet.id,
              wallet: wallet,
              cryptocurrencyAmount: tokenBalance.amount,
              amountAvailable: tokenBalance.amount, // This is the field the balance builder expects
              costBasisFiatCurrency: 'USD',
              costBasisFiatAmount: tokenBalance.fiatValue,
              costBasisPerUnit: costBasisPerUnit,
              cryptocurrency: mockCrypto as any,
              blockchainId: 'solana',
              blockchain: { id: 'solana', name: 'Solana' } as any
            } as any
            
            this.logger.debug('Creating mock tax lot', {
              id: mockTaxLot.id,
              symbol: tokenBalance.symbol,
              amountAvailable: mockTaxLot.amountAvailable,
              costBasisPerUnit: costBasisPerUnit
            })
            
            mockTaxLots.push(mockTaxLot)
            balanceBuilder.addTaxLot(mockTaxLot)
            
            // Add current price (mock 1:1 for test)
            const currentPrice = new Decimal(costBasisPerUnit)
            balanceBuilder.addCurrentFiatPrice(mockCrypto as any, currentPrice)
            
            this.logger.debug('Added current price', {
              cryptoId: mockCrypto.id,
              currentPrice: currentPrice.toString()
            })
          } else {
            this.logger.error('Mock cryptocurrency not found', { cryptoId: tokenBalance.cryptoId })
          }
        })
      }
    }
    
    this.logger.debug('Created test tax lots', { count: mockTaxLots.length })
    return balanceBuilder
  }

  // Helper method to create test wallets data
  private createTestWalletsData(organizationId: string): any[] {
    return [
      {
        id: 'test-wallet-1',
        publicId: 'wallet-1-pub',
        name: 'Test Solana Wallet 1',
        description: 'Development test wallet 1',
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        supportedBlockchains: ['solana'],
        organizationId: organizationId,
        blockchain: { id: 'solana', name: 'Solana' }
      },
      {
        id: 'test-wallet-2', 
        publicId: 'wallet-2-pub',
        name: 'Test Solana Wallet 2',
        description: 'Development test wallet 2',
        address: 'CWE8jPTUYhdCTZYWPiLW2pWpBVkVDQ88NEep5toKGkXR',
        supportedBlockchains: ['solana'],
        organizationId: organizationId,
        blockchain: { id: 'solana', name: 'Solana' }
      }
    ]
  }

  // Helper method to create test assets data
  private createTestAssetsData(organizationId: string): any[] {
    return [
      {
        id: 'asset-bonk',
        publicId: 'bonk-asset-pub',
        cryptocurrency: {
          id: 'crypto-bonk',
          symbol: 'BONK',
          name: 'Bonk',
          blockchainId: 'solana'
        },
        blockchain: { id: 'solana', name: 'Solana' },
        totalQuantity: '15000000',
        totalFiatValue: '150.00',
        fiatCurrency: 'USD',
        averageCostBasis: '0.00001',
        unrealizedGainLoss: '25.50',
        walletBreakdown: [
          {
            walletId: 'test-wallet-1',
            walletName: 'Test Solana Wallet 1',
            quantity: '10000000',
            fiatValue: '100.00'
          },
          {
            walletId: 'test-wallet-2',
            walletName: 'Test Solana Wallet 2', 
            quantity: '5000000',
            fiatValue: '50.00'
          }
        ]
      },
      {
        id: 'asset-usdc',
        publicId: 'usdc-asset-pub',
        cryptocurrency: {
          id: 'crypto-usdc',
          symbol: 'USDC',
          name: 'USD Coin',
          blockchainId: 'solana'
        },
        blockchain: { id: 'solana', name: 'Solana' },
        totalQuantity: '2500.50',
        totalFiatValue: '2500.50',
        fiatCurrency: 'USD',
        averageCostBasis: '1.00',
        unrealizedGainLoss: '0.00',
        walletBreakdown: [
          {
            walletId: 'test-wallet-1',
            walletName: 'Test Solana Wallet 1',
            quantity: '1800.25',
            fiatValue: '1800.25'
          },
          {
            walletId: 'test-wallet-2',
            walletName: 'Test Solana Wallet 2',
            quantity: '700.25', 
            fiatValue: '700.25'
          }
        ]
      },
      {
        id: 'asset-sol',
        publicId: 'sol-asset-pub',
        cryptocurrency: {
          id: 'crypto-sol',
          symbol: 'SOL',
          name: 'Solana',
          blockchainId: 'solana'
        },
        blockchain: { id: 'solana', name: 'Solana' },
        totalQuantity: '12.5',
        totalFiatValue: '2100.00',
        fiatCurrency: 'USD',
        averageCostBasis: '140.00',
        unrealizedGainLoss: '350.00',
        walletBreakdown: [
          {
            walletId: 'test-wallet-1',
            walletName: 'Test Solana Wallet 1',
            quantity: '8.2',
            fiatValue: '1378.00'
          },
          {
            walletId: 'test-wallet-2',
            walletName: 'Test Solana Wallet 2',
            quantity: '4.3',
            fiatValue: '722.00'
          }
        ]
      }
    ]
  }

  private applyGroupingToTestBalance(testBalance: any, groupBy?: string, secondGroupBy?: string): any {
    // For test data, we'll simulate the grouping structure
    if (groupBy === 'blockchainId') {
      return {
        value: testBalance.value,
        fiatCurrency: testBalance.fiatCurrency,
        groups: {
          'solana': {
            value: testBalance.value,
            fiatCurrency: testBalance.fiatCurrency,
            ...(secondGroupBy === 'walletId' ? {
              groups: {
                'test-wallet-1-public': {
                  value: '2625.00',
                  fiatCurrency: 'USD'
                },
                'test-wallet-2-public': {
                  value: '2550.88',
                  fiatCurrency: 'USD'
                }
              }
            } : {})
          }
        }
      }
    } else if (groupBy === 'walletId') {
      return {
        value: testBalance.value,
        fiatCurrency: testBalance.fiatCurrency,
        groups: {
          'test-wallet-1-public': {
            value: '2625.00',
            fiatCurrency: 'USD',
            ...(secondGroupBy === 'blockchainId' ? {
              groups: {
                'solana': {
                  value: '2625.00',
                  fiatCurrency: 'USD'
                }
              }
            } : {})
          },
          'test-wallet-2-public': {
            value: '2550.88',
            fiatCurrency: 'USD',
            ...(secondGroupBy === 'blockchainId' ? {
              groups: {
                'solana': {
                  value: '2550.88',
                  fiatCurrency: 'USD'
                }
              }
            } : {})
          }
        }
      }
    }
    
    return testBalance
  }

  /**
   * Enhanced Solana balance builder using real Helius data
   * Returns balance data in the same format as EVM blockchains
   */
  private async getSolanaPortfolioBalanceBuilder(
    wallets: Wallet[], 
    organizationId: string, 
    blockchainIds: string[], 
    params: AssetBalanceQueryParams
  ): Promise<BalanceDtoBuilder> {
    const balanceBuilder = new BalanceDtoBuilder(wallets)

    try {
      this.logger.info('Building Solana balance using Helius integration', {
        organizationId,
        walletCount: wallets.length,
        blockchainIds
      })

      // Filter Solana wallets
      const solanaWallets = wallets.filter(wallet => 
        wallet.supportedBlockchains.some(chain => chain.includes('solana'))
      )

      if (solanaWallets.length === 0) {
        this.logger.debug('No Solana wallets found for balance calculation', { walletCount: wallets.length })
        return balanceBuilder
      }

      // Get balance data from all Solana wallets using portfolio service
      let totalSolanaBalance = new Decimal(0)
      const tokenBalances = new Map<string, { symbol: string, totalAmount: Decimal, totalValueUsd: Decimal }>()

      for (const wallet of solanaWallets) {
        try {
          // Get wallet balance data from portfolio service (which uses Helius)
          const walletBalance = await this.portfolioService.getWalletBalance(organizationId, wallet.publicId)
          
          this.logger.debug('Retrieved wallet balance from Helius', {
            walletId: wallet.publicId,
            totalValue: walletBalance.totalValueUsd
          })

          // Add SOL native balance
          if (walletBalance.nativeBalance && walletBalance.nativeBalance.valueUsd > 0) {
            const solAmount = new Decimal(walletBalance.nativeBalance.uiAmount)
            const solValueUsd = new Decimal(walletBalance.nativeBalance.valueUsd || 0)
            
            if (tokenBalances.has('SOL')) {
              const existing = tokenBalances.get('SOL')
              existing.totalAmount = existing.totalAmount.add(solAmount)
              existing.totalValueUsd = existing.totalValueUsd.add(solValueUsd)
            } else {
              tokenBalances.set('SOL', {
                symbol: 'SOL',
                totalAmount: solAmount,
                totalValueUsd: solValueUsd
              })
            }
            
            totalSolanaBalance = totalSolanaBalance.add(solValueUsd)
          }

          // Add token balances
          walletBalance.tokenBalances?.forEach(token => {
            if (token.valueUsd && token.valueUsd > 0) {
              const tokenAmount = new Decimal(token.uiAmount)
              const tokenValueUsd = new Decimal(token.valueUsd)
              
              if (tokenBalances.has(token.symbol)) {
                const existing = tokenBalances.get(token.symbol)
                existing.totalAmount = existing.totalAmount.add(tokenAmount)
                existing.totalValueUsd = existing.totalValueUsd.add(tokenValueUsd)
              } else {
                tokenBalances.set(token.symbol, {
                  symbol: token.symbol,
                  totalAmount: tokenAmount,
                  totalValueUsd: tokenValueUsd
                })
              }
              
              totalSolanaBalance = totalSolanaBalance.add(tokenValueUsd)
            }
          })

        } catch (error) {
          this.logger.error(`Failed to get balance for wallet ${wallet.publicId}`, error)
          continue
        }
      }

      // Create tax lots for each token to match the token-level grouping format
      tokenBalances.forEach((tokenData, symbol) => {
        const mockCryptocurrency = {
          id: `solana-${symbol.toLowerCase()}`,
          symbol: symbol,
          name: this.getTokenName(symbol),
          blockchain: symbol.toLowerCase(), // Use token symbol as blockchain for grouping
          blockchainId: symbol.toLowerCase()
        }

        // Create a tax lot for this token
        const mockTaxLot = {
          id: `solana-${symbol}-balance`,
          amountAvailable: tokenData.totalAmount.toString(),
          costBasisPerUnit: tokenData.totalValueUsd.div(tokenData.totalAmount).toString(),
          costBasisFiatCurrency: 'USD',
          transferredAt: new Date(),
          cryptocurrency: mockCryptocurrency,
          wallet: solanaWallets[0], // Use first Solana wallet as representative
          blockchainId: symbol.toLowerCase() // Group by token symbol instead of blockchain
        }

        this.logger.debug('Creating Solana token tax lot', {
          symbol,
          amount: tokenData.totalAmount.toString(),
          valueUsd: tokenData.totalValueUsd.toString(),
          groupBy: symbol.toLowerCase()
        })

        balanceBuilder.addTaxLot(mockTaxLot as any)
        
        // Add current price (value / amount)
        const currentPrice = tokenData.totalAmount.gt(0) ? 
          tokenData.totalValueUsd.div(tokenData.totalAmount) : 
          new Decimal(0)
        
        balanceBuilder.addCurrentFiatPrice(mockCryptocurrency as any, currentPrice)
      })

      this.logger.info('Successfully built Solana balance from Helius data', {
        totalValue: totalSolanaBalance.toString(),
        tokenCount: tokenBalances.size,
        walletCount: solanaWallets.length
      })

    } catch (error) {
      this.logger.error('Failed to get real Solana balance, falling back to test data', error)
      // Fallback to existing test data method
      return this.getSolanaBalanceBuilder(wallets, organizationId, blockchainIds)
    }

    return balanceBuilder
  }

  /**
   * Enhanced method that returns token-level balance data
   * Similar to your Go solanaTokenBalances() function
   * Returns individual token balances instead of blockchain-level grouping
   */
  async getTokenLevelBalance(organizationId: string, params: AssetBalanceQueryParams) {
    this.logger.info('Getting token-level balance data', { organizationId, params })

    let wallets: Wallet[] = []
    if (params.walletIds?.length) {
      wallets = await this.walletsService.getByOrganizationAndPublicIds(organizationId, params.walletIds)
    } else {
      wallets = await this.walletsService.getAllByOrganizationId(organizationId)
    }

    // Filter Solana wallets
    const solanaWallets = wallets.filter(wallet => 
      wallet.supportedBlockchains.some(chain => chain.includes('solana'))
    )

    if (solanaWallets.length === 0) {
      return {
        value: '0',
        fiatCurrency: 'USD',
        groups: {}
      }
    }

    try {
      // Get token balances from all Solana wallets (similar to your Go code)
      const tokenBalanceMap = new Map<string, { 
        symbol: string, 
        totalAmount: Decimal, 
        totalValueUsd: Decimal,
        priceUsd: Decimal,
        priceChange24h?: number,
        icon?: string
      }>()

      let totalPortfolioValue = new Decimal(0)

      for (const wallet of solanaWallets) {
        try {
          // Get wallet balance using Helius (equivalent to your Solana RPC calls)
          const walletBalance = await this.portfolioService.getWalletBalance(organizationId, wallet.publicId)
          
          // Add SOL native balance
          if (walletBalance.nativeBalance && walletBalance.nativeBalance.valueUsd > 0) {
            const solAmount = new Decimal(walletBalance.nativeBalance.uiAmount)
            const solValueUsd = new Decimal(walletBalance.nativeBalance.valueUsd || 0)
            const solPriceUsd = new Decimal(walletBalance.nativeBalance.priceUsd || 0)
            
            this.aggregateTokenBalance(tokenBalanceMap, 'SOL', {
              symbol: 'SOL',
              amount: solAmount,
              valueUsd: solValueUsd,
              priceUsd: solPriceUsd,
              priceChange24h: walletBalance.nativeBalance.priceChange24h,
              icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' // Solana official icon
            })
            
            totalPortfolioValue = totalPortfolioValue.add(solValueUsd)
          }

          // Add token balances (equivalent to your program account parsing)
          walletBalance.tokenBalances?.forEach(token => {
            if (token.valueUsd && token.valueUsd > 0) {
              const tokenAmount = new Decimal(token.uiAmount)
              const tokenValueUsd = new Decimal(token.valueUsd)
              const tokenPriceUsd = new Decimal(token.priceUsd || 0)
              
              this.aggregateTokenBalance(tokenBalanceMap, token.symbol.toUpperCase(), {
                symbol: token.symbol.toUpperCase(),
                amount: tokenAmount,
                valueUsd: tokenValueUsd,
                priceUsd: tokenPriceUsd,
                priceChange24h: token.priceChange24h,
                icon: token.icon
              })
              
              totalPortfolioValue = totalPortfolioValue.add(tokenValueUsd)
            }
          })

        } catch (error) {
          this.logger.error(`Failed to get token balance for wallet ${wallet.publicId}`, error)
          continue
        }
      }

      // Build the response in token-grouped format (similar to EVM blockchain groups)
      const groups: Record<string, { value: string, fiatCurrency: string, imageUrl?: string }> = {}
      
      tokenBalanceMap.forEach((tokenData, symbol) => {
        // Use token symbol directly (sol, bonk, usdc, etc.) like EVM chain names
        groups[symbol.toLowerCase()] = {
          value: tokenData.totalValueUsd.toFixed(18), // Use high precision like EVM
          fiatCurrency: 'USD',
          imageUrl: tokenData.icon
        }
      })

      const response = {
        value: totalPortfolioValue.toFixed(2),
        fiatCurrency: 'USD',
        groups
      }

      this.logger.info('Token-level balance calculation completed', {
        totalValue: response.value,
        tokenCount: tokenBalanceMap.size,
        tokens: Array.from(tokenBalanceMap.keys())
      })

      return response

    } catch (error) {
      this.logger.error('Failed to get token-level balance', error)
      return {
        value: '0',
        fiatCurrency: 'USD',
        groups: {}
      }
    }
  }

  /**
   * Helper method to aggregate token balances across multiple wallets
   */
  private aggregateTokenBalance(
    tokenMap: Map<string, any>, 
    symbol: string, 
    tokenData: {
      symbol: string,
      amount: Decimal,
      valueUsd: Decimal,
      priceUsd: Decimal,
      priceChange24h?: number,
      icon?: string
    }
  ) {
    if (tokenMap.has(symbol)) {
      const existing = tokenMap.get(symbol)
      existing.totalAmount = existing.totalAmount.add(tokenData.amount)
      existing.totalValueUsd = existing.totalValueUsd.add(tokenData.valueUsd)
      // Keep the latest price data
      existing.priceUsd = tokenData.priceUsd
      existing.priceChange24h = tokenData.priceChange24h
      existing.icon = tokenData.icon || existing.icon // Keep icon if available
    } else {
      tokenMap.set(symbol, {
        symbol: tokenData.symbol,
        totalAmount: tokenData.amount,
        totalValueUsd: tokenData.valueUsd,
        priceUsd: tokenData.priceUsd,
        priceChange24h: tokenData.priceChange24h,
        icon: tokenData.icon
      })
    }
  }

  /**
   * Get balance grouped by walletId with nested grouping by blockchainId
   * Similar to EVM API: groupBy=walletId&secondGroupBy=blockchainId
   */
  async getWalletBlockchainNestedBalance(organizationId: string, wallets: Wallet[], params: AssetBalanceQueryParams) {
    this.logger.info('Getting wallet-blockchain nested balance', { 
      organizationId, 
      walletCount: wallets.length 
    })

    const organizationSetting = await this.organizationSettingsEntityService.getByOrganizationId(organizationId, {
      fiatCurrency: true
    })
    const fiatCurrency = organizationSetting.fiatCurrency.alphabeticCode || 'USD'

    const walletGroups: Record<string, { value: string, fiatCurrency: string, groups: Record<string, { value: string, fiatCurrency: string, imageUrl?: string }> }> = {}
    let totalOrganizationValue = new Decimal(0)

    // Process each wallet
    for (const wallet of wallets) {
      this.logger.debug('Processing wallet for nested balance', { 
        walletId: wallet.publicId, 
        walletName: wallet.name 
      })

      let walletTotalValue = new Decimal(0)
      const blockchainGroups: Record<string, { value: string, fiatCurrency: string, imageUrl?: string }> = {}

      try {
        // Get wallet balance from Helius
        const walletBalance = await this.portfolioService.getWalletBalance(organizationId, wallet.publicId)
        
        if (walletBalance) {
          // Add SOL native balance
          if (walletBalance.nativeBalance && walletBalance.nativeBalance.valueUsd > 0) {
            const solValue = new Decimal(walletBalance.nativeBalance.valueUsd)
            walletTotalValue = walletTotalValue.add(solValue)
          }

          // Add token balances
          if (walletBalance.tokenBalances && walletBalance.tokenBalances.length > 0) {
            walletBalance.tokenBalances.forEach(token => {
              if (token.valueUsd && token.valueUsd > 0) {
                const tokenValue = new Decimal(token.valueUsd)
                walletTotalValue = walletTotalValue.add(tokenValue)
              }
            })
          }
        }

        // For Solana, all balances go under 'solana' blockchain group
        blockchainGroups['solana'] = {
          value: walletTotalValue.toFixed(18),
          fiatCurrency,
          imageUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
        }

        totalOrganizationValue = totalOrganizationValue.add(walletTotalValue)

        this.logger.debug('Wallet balance calculated', {
          walletId: wallet.publicId,
          walletValue: walletTotalValue.toString()
        })

      } catch (error) {
        this.logger.error(`Failed to get balance for wallet ${wallet.publicId}`, error)
        
        // Set zero balance for this wallet
        blockchainGroups['solana'] = {
          value: '0',
          fiatCurrency,
          imageUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
        }
      }

      // Add wallet to groups
      walletGroups[wallet.publicId] = {
        value: walletTotalValue.toFixed(18),
        fiatCurrency,
        groups: blockchainGroups
      }
    }

    // Add empty wallets if they exist in the organization but have no Solana wallets
    // This ensures we return a consistent structure similar to EVM API
    const allWallets = await this.walletsService.getAllByOrganizationId(organizationId)
    for (const wallet of allWallets) {
      if (!walletGroups[wallet.publicId]) {
        walletGroups[wallet.publicId] = {
          value: '0',
          fiatCurrency,
          groups: {
            solana: {
              value: '0',
              fiatCurrency
            }
          }
        }
      }
    }

    const response = {
      value: totalOrganizationValue.toFixed(18),
      fiatCurrency,
      groups: walletGroups
    }

    this.logger.info('Wallet-blockchain nested balance completed', {
      totalValue: response.value,
      walletCount: Object.keys(walletGroups).length
    })

    return response
  }

  /**
   * Get human-readable token name from symbol
   */
  private getTokenName(symbol: string): string {
    const nameMap: Record<string, string> = {
      'SOL': 'Solana',
      'BONK': 'Bonk',
      'WIF': 'dogwifhat',
      'TRUMP': 'TRUMP',
      'USDC': 'USD Coin',
      'USDT': 'Tether',
      'JUP': 'Jupiter',
      'WSOL': 'Wrapped SOL'
    }

    return nameMap[symbol.toUpperCase()] || symbol
  }
}
