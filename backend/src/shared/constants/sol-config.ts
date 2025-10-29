/**
 * SOL Configuration
 * 
 * This file contains configuration optimized for Solana operations
 * while maintaining minimal EVM support for legacy compatibility.
 */

import { SupportedBlockchains } from '../entity-services/blockchains/interfaces'

// SOL-First blockchain priority order
export const SOL_FOCUSED_BLOCKCHAIN_PRIORITY = [
  SupportedBlockchains.SOLANA_MAINNET,
  SupportedBlockchains.SOLANA_DEVNET,
  // EVM chains for legacy support only
  SupportedBlockchains.ETHEREUM_MAINNET,
  SupportedBlockchains.GOERLI
]

// Solana-specific configurations
export const SOLANA_CONFIG = {
  DEFAULT_COMMITMENT: 'confirmed' as const,
  MAX_RETRIES: 3,
  TRANSACTION_TIMEOUT: 30000, // 30 seconds
  HELIUS_API_TIMEOUT: 15000,  // 15 seconds
  RPC_TIMEOUT: 10000,         // 10 seconds
  
  // SPL Token specific
  SPL_TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  
  // Common Solana addresses to prioritize
  WELL_KNOWN_PROGRAMS: [
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token
    '11111111111111111111111111111111',             // System Program
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'  // Associated Token Program
  ]
}

// SOL feature flags
export const SOL_FEATURES = {
  DISABLE_EVM_BACKGROUND_SYNC: true,
  PRIORITIZE_SOLANA_WALLETS: true,
  SKIP_GNOSIS_OPERATIONS: true,
  ENABLE_HELIUS_ENHANCED_DATA: true,
  AUTO_DETECT_SPL_TOKENS: true
}

// Performance optimizations for SOL
export const SOL_PERFORMANCE = {
  WALLET_SIZE_UNLIMITED_FOR_SOLANA: true,
  SKIP_EVM_TRANSACTION_COUNT_CHECKS: true,
  BATCH_SIZE_SOLANA_OPERATIONS: 50,
  CONCURRENT_SOLANA_REQUESTS: 10
}

// Logging preferences for SOL environment
export const SOL_LOGGING = {
  LOG_SKIPPED_EVM_OPERATIONS: true,
  LOG_SOLANA_PERFORMANCE_METRICS: true,
  LOG_BLOCKCHAIN_PRIORITY_DECISIONS: true
}

export default {
  BLOCKCHAIN_PRIORITY: SOL_FOCUSED_BLOCKCHAIN_PRIORITY,
  SOLANA: SOLANA_CONFIG,
  FEATURES: SOL_FEATURES,
  PERFORMANCE: SOL_PERFORMANCE,
  LOGGING: SOL_LOGGING
}