export const CURRENCY_RELATED_CONSTANTS = {
  numToWordThreshold: 1000
}

const FEATURE_FLAG_ENABLED_ENVS = ['localhost', 'development', 'staging', 'production']
export const isFeatureEnabledForThisEnv = FEATURE_FLAG_ENABLED_ENVS.includes(process.env.NEXT_PUBLIC_ENVIRONMENT)

export const isMonetisationEnabled = ['localhost', 'development', 'staging', 'production'].includes(
  process.env.NEXT_PUBLIC_ENVIRONMENT
)
export const isQuickBooksEnabled = ['localhost', 'development', 'staging', 'production'].includes(
  process.env.NEXT_PUBLIC_ENVIRONMENT
)

export const CHAIN_COLORS = {
  ethereum: '#627EE9',
  sepolia: '#64668b',
  polygon: '#8345E5',
  bsc: '#F0B90C',
  arbitrum_one: '#2e3b4d',
  optimism: '#FF002F',
  gnosis_chain: '#3e6957',
  // Sample token chains for demo
  solana: '#9945FF',
  bonk: '#F3BA2F',
  wif: '#FF6B35',
  trump: '#FFD700',
  usdc: '#2775CA'
}

export const CHAIN_SHORT_NAMES = {
  ethereum: 'ethereum',
  sepolia: 'sepolia',
  polygon: 'polygon',
  bsc: 'bnb smart chain',
  arbitrum_one: 'arbitrum one',
  optimism: 'optimism',
  gnosis_chain: 'gnosis chain',
  // Sample token chains for demo
  solana: 'solana',
  bonk: 'bonk',
  wif: 'wif',
  trump: 'trump',
  usdc: 'usdc'
}

export const TRANSACTIONS_LIMIT = {
  starter: 10000,
  business: 10000
}

export const EXPIRE_SOON_DAY = 10
