## PnL Calculation Strategy

### Current State
- **PnL Logic Location**: LedgerX backend
- **Service**: `GainsLossesEntityService` in `/backend/src/shared/entity-services/gains-losses/`
- **Entities**: `TaxLot` and `TaxLotSale` for tracking cost basis and realized gains/losses

### Data Sources
1. LedgerX backend (Current):
   - Tax lot accounting (FIFO/LIFO)
   - Realized gains/losses calculations
   - Integration with financial transactions
   - Cost basis tracking

2. **data-onchain-ingestor (New)**:
   - Enhanced transaction data with USD values
   - Real-time price information
   - More comprehensive transaction indexing
   - Better balance tracking

### Integration Approach

#### Phase 1: UI-Compatible Enhancement (Current)
- Keep existing PnL calculations in LedgerX backend
- Add enhanced transaction/portfolio data from `data-onchain-ingestor`
- Maintain UI compatibility with existing response formats

#### Phase 2: Hybrid PnL Calculation (Future)
```typescript
// Enhanced PnL calculation combining both sources
async calculateEnhancedPnL(wallet: Wallet) {
  // 1. Get tax lots from LedgerX backend (existing logic)
  const taxLots = await this.gainsLossesService.getTaxLotsByWallet(wallet.id)

  // 2. Get enhanced transaction data from data-onchain-ingestor
  const enhancedTransactions = await this.dataOnchainQueryService.getWalletTransactionHistory(...)

  // 3. Calculate unrealized PnL with current prices from data-onchain-ingestor
  const currentPrices = await this.dataOnchainQueryService.getCurrentPrices(...)

  // 4. Combine for comprehensive PnL
  return {
    realized_pnl: calculateRealizedPnL(taxLots),
    unrealized_pnl: calculateUnrealizedPnL(taxLots, currentPrices),
    total_pnl: realized_pnl + unrealized_pnl
  }
}
```

#### Phase 3: Full Migration (Optional)
- Migrate PnL calculation logic to `data-onchain-ingestor`
- Use enhanced transaction data for more accurate calculations
- Maintain backward compatibility

### Current Implementation
- Enhanced endpoints: `/enhanced-transactions`, `/enhanced-portfolio`, `/insights`
- Preserve existing UI structure
- Add enhanced data without breaking changes
- PnL calculation remains in LedgerX backend for now

### Benefits
1. **Immediate**: Enhanced data without breaking UI
2. **Future**: More accurate PnL with better data sources
3. **Flexible**: Can choose best calculation method per use case
