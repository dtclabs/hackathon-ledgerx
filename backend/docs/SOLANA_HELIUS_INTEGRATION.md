# Solana Helius Integration

## Overview
LedgerX now supports Solana blockchain integration with enhanced transaction history and balance fetching through **Helius API**. This provides much richer data compared to basic Solana RPC endpoints.

## Why Helius?
- **Enhanced Transaction Data**: Detailed transaction parsing with token transfers and balance changes
- **Better Performance**: Faster and more reliable than standard RPC
- **Rich Metadata**: Transaction types, account changes, and event data
- **Comprehensive Token Support**: Full SPL token support with metadata

## Configuration

### Environment Variables
Add to your `.env` file:
```bash
# Helius API Key for enhanced Solana data
HELIUS_API_KEY=your_helius_api_key_here
```

### Getting Helius API Key
1. Visit [Helius Dashboard](https://dev.helius.xyz/)
2. Sign up for a free account
3. Create a new project
4. Copy your API key

## Features

### ✅ Enhanced Transaction History
- **Rich Transaction Data**: Detailed parsing of Solana transactions
- **Token Transfer Tracking**: Automatic detection of SPL token transfers
- **Balance Changes**: Track SOL and token balance changes per transaction
- **Transaction Types**: Categorized transaction types (swap, transfer, etc.)

### ✅ Comprehensive Balance Fetching
- **Native SOL Balance**: Real-time SOL balance
- **SPL Token Balances**: All token holdings with metadata
- **Zero Balance Filtering**: Only shows tokens with positive balances
- **Fast Response**: Optimized API calls

### ✅ Fallback Support
- **Graceful Degradation**: Falls back to basic RPC if Helius is unavailable
- **Error Handling**: Robust error handling with automatic fallbacks
- **No Breaking Changes**: Existing functionality preserved

## API Endpoints Used

### Transactions
```
GET https://api.helius.xyz/v0/addresses/{address}/transactions
Parameters:
- api_key: Your Helius API key
- limit: Number of transactions (default: 100)
- before: Cursor for pagination
- source: HELIUS_ENHANCED
```

### Balances
```
GET https://api.helius.xyz/v0/addresses/{address}/balances
Parameters:
- api_key: Your Helius API key
```

## Transaction Data Structure

### Helius Enhanced Transaction
```typescript
interface HeliusTransactionResponse {
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
```

## Implementation Details

### Adapter Pattern
The `SolanaAdapter` implements the same interface as `AlchemyAdapter`:
- `getBalance(address: string): Promise<AddressBalance[]>`
- `getTransactionsByAddress(address, meta, validatorFn): Promise<TransactionResponsePaginated>`
- `getTransactionReceiptViaAPI(txHash: string): Promise<any>`

### Network Support
- **Mainnet**: Production Solana network
- **Devnet**: Development/testing network
- **Automatic Detection**: Uses mainnet by default

### Error Handling
- **API Rate Limits**: Automatic retry and fallback
- **Network Issues**: Graceful degradation to RPC
- **Invalid Responses**: Safe error handling with empty results

## Usage Examples

### Fetch Transaction History
```typescript
const adapter = blockExplorerFactory.getSolanaAdapter('solana-mainnet')
const transactions = await adapter.getTransactionsByAddress(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  { direction: 'both', nextPageId: undefined },
  async (hash) => ({ loadInternal: true, loadReceipt: true })
)
```

### Fetch Wallet Balances
```typescript
const adapter = blockExplorerFactory.getSolanaAdapter('solana-mainnet')
const balances = await adapter.getBalance('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
// Returns: [{ tokenAddress: 'SOL', balance: '1000000000' }, ...]
```

## Benefits for LedgerX

### 🚀 **Enhanced User Experience**
- **Rich Transaction History**: Users see detailed transaction data with token transfers
- **Real-time Balances**: Accurate and fast balance updates
- **Better Transaction Categorization**: Clear transaction types and purposes

### 🔧 **Technical Advantages**
- **Reduced RPC Calls**: More efficient data fetching
- **Better Error Handling**: Robust fallback mechanisms
- **Consistent Interface**: Same API patterns as EVM chains

### 📊 **Data Quality**
- **Accurate Token Metadata**: Proper token names and decimals
- **Complete Transaction Parsing**: Full understanding of complex transactions
- **Historical Data**: Comprehensive transaction history

## Monitoring and Maintenance

### Health Checks
- Monitor Helius API response times
- Track fallback usage rates
- Log API errors for debugging

### Rate Limits
- Helius free tier: 100 requests/second
- Paid tiers: Higher limits available
- Automatic rate limiting in adapter

### Troubleshooting
1. **No transaction data**: Check HELIUS_API_KEY configuration
2. **Slow responses**: Monitor Helius API status
3. **Missing balances**: Verify wallet address format

## Future Enhancements
- **WebSocket Support**: Real-time transaction notifications
- **NFT Integration**: Solana NFT support through Helius
- **DeFi Analytics**: Enhanced DeFi transaction parsing
- **Historical Price Data**: Token price history integration