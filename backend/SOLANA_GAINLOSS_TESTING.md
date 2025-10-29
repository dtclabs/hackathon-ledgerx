# Solana Gain/Loss Testing Guide

This guide helps you generate fake Solana transaction data to test gain/loss calculations.

## Prerequisites

1. **Setup Test Cryptocurrencies**
   ```bash
   psql -h 10.104.0.46 -U admin -d example -f setup-test-cryptocurrencies.sql
   ```

2. **Build and Start the Backend**
   ```bash
   cd backend
   yarn build
   yarn start:dev
   ```

## Available Test Scenarios

### 1. Simple Buy/Sell Scenario
Tests basic gain/loss calculation with one buy and one sell.

**Expected Flow:**
- Buy: 100k BONK for $50 USDC ($0.0005 per BONK)
- Sell: 60k BONK for $45 USDC ($0.00075 per BONK) 
- **Expected Gain:** $15 (sold 60k at $0.00075 = $45, cost basis was 60k * $0.0005 = $30)
- **Remaining:** 40k BONK with $20 cost basis

### 2. FIFO Test Scenario  
Tests First-In-First-Out accounting with multiple buys and sells.

**Expected Flow:**
- Buy #1: 100k BONK for $40 ($0.0004 per BONK)
- Buy #2: 150k BONK for $90 ($0.0006 per BONK)  
- Buy #3: 200k BONK for $160 ($0.0008 per BONK)
- Sell #1: 120k BONK for $120 ($0.0010 per BONK)
  - Should use: 100k from Buy #1 + 20k from Buy #2
  - Cost basis: $40 + $12 = $52
  - **Gain:** $68
- Sell #2: 80k BONK for $96 ($0.0012 per BONK)
  - Should use: 80k from remaining Buy #2  
  - Cost basis: $48
  - **Gain:** $48
- **Total Expected Gain:** $116

## API Endpoints

### Generate Test Data
```http
POST {{base_url}}/{{organization_id}}/financial-transactions/wallet/{{wallet_public_id}}/generate-test-data
Content-Type: application/json

{
  "scenario": "simple"
}
```

**Available scenarios:**
- `"simple"` - Basic buy/sell scenario
- `"fifo-test"` - Complex FIFO testing scenario
- `"complex"` - Same as fifo-test (alias)

### Debug Wallet Data
```http
GET {{base_url}}/{{organization_id}}/financial-transactions/wallet/{{wallet_public_id}}/debug
```
Shows what transaction data exists for the wallet.

### Check Wallet Balances
```http
GET {{base_url}}/{{organization_id}}/financial-transactions/wallet/{{wallet_public_id}}/balances
```
Returns calculated token balances from transactions.

### Get Transactions (Paginated)
```http
GET {{base_url}}/{{organization_id}}/financial-transactions/solana?page=0&size=10
```

## Testing Steps

1. **Generate Test Data**
   ```bash
   # Simple scenario
   curl -X POST "{{base_url}}/{{organization_id}}/financial-transactions/wallet/{{wallet_public_id}}/generate-test-data" \
     -H "Authorization: Bearer {{token}}" \
     -H "Content-Type: application/json" \
     -d '{"scenario": "simple"}'
   ```

2. **Verify Data Created**
   ```bash
   # Check debug info
   curl "{{base_url}}/{{organization_id}}/financial-transactions/wallet/{{wallet_public_id}}/debug" \
     -H "Authorization: Bearer {{token}}"
   ```

3. **Check Balances**
   ```bash
   curl "{{base_url}}/{{organization_id}}/financial-transactions/wallet/{{wallet_public_id}}/balances" \
     -H "Authorization: Bearer {{token}}"
   ```

4. **View Transactions**
   ```bash
   curl "{{base_url}}/{{organization_id}}/financial-transactions/solana?page=0&size=20" \
     -H "Authorization: Bearer {{token}}"
   ```

## Gain/Loss Calculation Process

After generating test data, you can implement/test gain/loss calculations:

1. **For each SELL transaction:**
   - Find all previous BUY transactions (FIFO order)
   - Calculate cost basis using oldest purchases first
   - Calculate gain/loss = Sale Proceeds - Cost Basis

2. **Expected Database Tables:**
   - `tax_lot` - Cost basis lots from purchases
   - `tax_lot_sale` - Gain/loss records from sales
   - `gains_losses` - Aggregated gain/loss data

## Data Structure

The fake data service creates realistic Solana transactions with:
- **Parent transactions** - Transaction hash, activity type, timestamp
- **Child transactions** - Individual token transfers (in/out)
- **Metadata** - Direction, type, status, fiat amounts
- **Proper addresses** - Realistic Solana addresses (case-sensitive)

## Troubleshooting

### Empty Balances Response
- Check if wallet address matches transaction addresses (case sensitivity)
- Use debug endpoint to verify transaction data exists
- Ensure cryptocurrencies are properly seeded

### Missing Cryptocurrencies
- Run the setup SQL script to create SOL, USDC, BONK tokens
- Verify blockchain 'solana' exists in blockchains table

### Compilation Errors
- Ensure all imports are correct
- Check TypeScript interfaces match entity definitions
- Verify enum values are defined in interfaces.ts

### Database Issues
- Verify foreign key relationships
- Check that organization_id exists
- Ensure wallet exists for the given wallet_public_id

## Example Expected Response

### Simple Scenario Response:
```json
{
  "scenario": "simple",
  "transactions": 2,
  "expectedGainLoss": {
    "description": "Sold 60k BONK for $45, cost basis was $30, so gain = $15",
    "soldAmount": "60000 BONK",
    "costBasis": "$30.00",
    "saleProceeds": "$45.00", 
    "expectedGain": "$15.00"
  },
  "remainingPosition": {
    "description": "Should have 40k BONK remaining with cost basis of $20",
    "amount": "40000 BONK",
    "costBasis": "$20.00"
  }
}
```

This provides you with realistic test data to implement and verify your gain/loss calculation logic!