# Chart Data API Summary

This document lists the existing endpoints that return chart-ready data, primarily in the Wallets module, plus several organization-level aggregation APIs (Balances).

- Base prefix: `/{organizationId}`
- Auth: `Authorization: Bearer <JWT>` (required for all endpoints below)

---

## 1) Wallet Dashboard / Chart APIs

Endpoints under `/{organizationId}/wallets/{publicId}`.

1. Dashboard Summary (KPIs)
   - Method: GET
   - Path: `/{organizationId}/wallets/{publicId}/dashboard-summary`
   - Params: `days?` (number, default 30)
   - Returns: KPIs for the dashboard (total transactions, last transaction date, SOL price in USD, total portfolio USD value)

2. Token Distribution (Donut/Bar)
   - Method: GET
   - Path: `/{organizationId}/wallets/{publicId}/token-distribution`
   - Returns: Token list with `usd_value` and `pct` for donut/bar charts

3. Monthly Transactions (Line)
   - Method: GET
   - Path: `/{organizationId}/wallets/{publicId}/monthly-transactions`
   - Params: `months?` (number, default 12)
   - Returns: Series `{ month: YYYY-MM, count }` for line chart

4. Price History (Line/Area) — powered by Birdeye
   - Method: GET
   - Path: `/{organizationId}/wallets/{publicId}/price-history`
   - Params:
     - `symbol?` (default `SOL`)
     - `fiat?` (default `USD`)
     - `days?` (default `90`)
     - `address?` (Solana token mint; when omitted and `chain=solana`, defaults to Wrapped SOL)
     - `chain?` (default `solana`)
     - `interval?` (default `1d`)
   - Required ENV: `BIRDEYE_API_KEY`
   - Returns: Points array `{ date, price }`

5. Insights (for transaction trend charts)
   - Method: GET
   - Path: `/{organizationId}/wallets/{publicId}/insights`
   - Params: `days?` (number, default 30)
   - Returns: `transaction_trends.daily_count` (series `{ date, count }`) and `weekly_volume` — suitable for line/area/bar charts

6. Enhanced Portfolio (for allocation/weights, extended PnL)
   - Method: GET
   - Path: `/{organizationId}/wallets/{publicId}/enhanced-portfolio`
   - Returns: `enhancedPortfolio.tokens[]` with `usd_value`, `percentage` — donut/bar-ready; includes `sync_status`, `last_updated`

7. Enhanced Transactions (for time-based activity charts)
   - Method: GET
   - Path: `/{organizationId}/wallets/{publicId}/enhanced-transactions`
   - Params: `page?`, `per_page?`, `symbol?`, `kind?`
   - Returns: Transactions list with `timestamp` — can be aggregated into daily/hourly series for charts

Note on `chain_id`: the system prefers `solana` if present in `wallet.supportedBlockchains`; otherwise uses the first element; default is `solana`.

---

## 2) Balance/Asset Aggregations (organization-level) — for aggregate charts

These endpoints provide aggregated metrics for organization-wide charts by blockchain, wallet, or token.

- Module: `balances`
- Base: `/{organizationId}/balances`
- Common query params:
  - `groupBy` (e.g., `blockchainId`, `walletId`, `tokenSymbol`)
  - `secondGroupBy` (optional for two-dimensional grouping: e.g., `walletId` + `blockchainId`)

Typical examples (see Balance-Asset-APIs-Testing Postman collection):

1. Get Balances (Group by Blockchain)
   - GET `/{organizationId}/balances?groupBy=blockchainId`
   - For pie/bar charts of distribution by blockchain

2. Get Balances (Group by Wallet & Blockchain)
   - GET `/{organizationId}/balances?groupBy=walletId&secondGroupBy=blockchainId`
   - For stacked bar charts by wallet and blockchain

3. Other variants are available in the collection for different aggregate visualizations.

---

## 3) Related Postman Collections

- `postman-collections/Solana Wallet Testing - Complete LedgerX Backend APIs.postman_collection.json`
  - Wallets section: includes the 4 primary chart requests: Dashboard Summary, Token Distribution, Monthly Transactions, Price History
- `postman-collections/Balance-Asset-APIs-Testing.postman_collection.json`
  - Lists balance aggregation calls for organization-level charts

---

## 4) Configuration Requirements

- `BIRDEYE_API_KEY` (for Price History)
- A valid JWT and access to Resource.WALLETS with Action.READ

---

If you need additional charts (e.g., token USD value time series per day), extend `WalletsController` with a new time series endpoint leveraging `DataOnchainQueryService` plus pricing via the Prices service or Birdeye.
