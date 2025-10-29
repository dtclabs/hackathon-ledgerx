# LedgerX Database Entities - Detailed Analysis

## 🏗️ **Specific Entity Breakdown**

This document provides detailed analysis of key LedgerX database entities, focusing on their structure, relationships, and business purposes.

## 📊 **Export & Integration Entities**

### **BankFeedExportWorkflow Entity** - Financial Export Management
```typescript
@Entity()
export class BankFeedExportWorkflow extends PublicEntity {
  @Column({ name: 'organization_id' })
  organizationId: string           // Multi-tenant isolation

  @Column()
  name: string                     // User-defined export name

  @Column()
  status: BankFeedExportStatus     // PENDING, PROCESSING, COMPLETED, FAILED

  @Column({ name: 'integration_name' })
  integrationName: IntegrationName // QUICKBOOKS, XERO, SAGE, etc.

  @Column({ type: 'json', nullable: true })
  error: any                       // Error details if failed

  @Column({ name: 'requested_by', nullable: true })
  requestedBy: string              // Who initiated the export

  @Column({ name: 'total_count', nullable: true })
  totalCount: number               // Number of transactions to export

  @Column({ name: 'last_executed_at', nullable: true })
  lastExecutedAt: Date             // Last processing timestamp

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date                // Completion timestamp

  @Column({ name: 's3_file_path', nullable: true })
  s3FilePath: string               // Generated file location

  @Column({ nullable: true })
  filename: string                 // Download filename

  @Column({ name: 'file_type' })
  fileType: BankFeedExportFileType // CSV, QBO, IIF, etc.

  @Column({ type: 'json' })
  metadata: BankFeedExportWorkflowMetadata // Export configuration
}
```

**Purpose**: Manages the export of financial transaction data to external accounting systems.

**Business Logic**:
- **Export Workflows**: Creates formatted files for accounting software import
- **Status Tracking**: Monitors export progress and errors
- **File Generation**: Stores generated files in S3 for download
- **Integration Support**: Supports multiple accounting platforms

**Usage Patterns**:
```typescript
// Create export workflow
const workflow = BankFeedExportWorkflow.create({
  name: "Q1 2024 Export",
  integrationName: IntegrationName.QUICKBOOKS,
  organizationId: "org-123",
  fileType: BankFeedExportFileType.QBO,
  metadata: {
    dateRange: { from: "2024-01-01", to: "2024-03-31" },
    accounts: ["cash", "crypto-assets"]
  }
});

// Track progress
workflow.status = BankFeedExportStatus.PROCESSING;
workflow.lastExecutedAt = new Date();
```

## ⚙️ **Organization Configuration**

### **OrganizationSetting Entity** - Organization Preferences
```typescript
@Entity()
export class OrganizationSetting extends BaseEntity {
  @OneToOne(() => Organization)
  organization: Organization       // 1:1 relationship with Organization

  @ManyToOne(() => Country)
  country: Country                 // Legal jurisdiction

  @ManyToOne(() => Timezone)
  timezone: Timezone               // Default timezone for operations

  @ManyToOne(() => FiatCurrency)
  fiatCurrency: FiatCurrency       // Base currency (USD, EUR, etc.)

  @Column({ type: 'enum', default: CostBasisCalculationMethod.FIFO })
  costBasisMethod: CostBasisCalculationMethod // FIFO, LIFO, HIFO, SPECIFIC_ID
}
```

**Purpose**: Stores organization-wide configuration and preferences.

**Key Features**:
- **Tax Configuration**: Cost basis calculation method for tax reporting
- **Localization**: Country, timezone, and currency preferences
- **Compliance**: Jurisdiction-specific accounting rules
- **Default Settings**: Organization-wide defaults for all operations

**Cost Basis Methods**:
- **FIFO** (First In, First Out): Sell oldest tokens first
- **LIFO** (Last In, First Out): Sell newest tokens first
- **HIFO** (Highest In, First Out): Sell highest cost basis first
- **SPECIFIC_ID**: Manually specify which tokens to sell

## 💳 **Payment Processing**

### **Payment Entity** - Transaction Payments
```typescript
@Entity()
export class Payment extends PublicEntity {
  @Column({ name: 'blockchain_id', nullable: true })
  blockchainId: string             // Which blockchain (if crypto payment)

  @ManyToOne(() => Organization)
  organization: Organization       // Payment owner

  @Column({ name: 'type', nullable: true })
  type: PaymentType               // CRYPTO_TRANSFER, BANK_TRANSFER, etc.

  @Column({ name: 'hash', nullable: true })
  hash: string                    // Blockchain transaction hash

  @Column({ name: 'safe_hash', nullable: true })
  safeHash: string                // Gnosis Safe transaction hash

  @ManyToOne(() => Wallet)
  sourceWallet: Wallet            // Source wallet for crypto payments

  @Column({ name: 'destination_address', nullable: true })
  destinationAddress: string      // Recipient address

  @Column({ name: 'destination_name', nullable: true })
  destinationName: string         // Recipient name/label

  @ManyToOne(() => Cryptocurrency)
  cryptocurrency: Cryptocurrency   // Token/coin used for payment

  @Column({ name: 'amount', type: 'decimal' })
  amount: string                  // Payment amount

  @Column({ name: 'currency_type' })
  currencyType: CurrencyType      // FIAT, CRYPTO

  @Column()
  status: PaymentStatus           // PENDING, COMPLETED, FAILED

  @Column({ name: 'provider' })
  provider: PaymentProvider       // GNOSIS_SAFE, METAMASK, COINBASE

  @Column({ type: 'json', nullable: true })
  metadata: PaymentMetadata       // Additional payment data

  @Column({ type: 'json', nullable: true })
  destinationMetadata: DestinationMetadata // Recipient details
}
```

**Purpose**: Tracks outgoing payments in both crypto and fiat currencies.

**Payment Types**:
- **CRYPTO_TRANSFER**: Direct blockchain transfers
- **BANK_TRANSFER**: Traditional bank payments
- **INVOICE_PAYMENT**: Invoice settlement
- **SALARY_PAYMENT**: Payroll payments

**Status Flow**:
```
PENDING → PROCESSING → COMPLETED
   ↓
FAILED (with error details)
```

## 📊 **Accounting Structure**

### **ChartOfAccount Entity** - Accounting Framework
```typescript
@Entity()
export class ChartOfAccount extends PublicEntity {
  @Column()
  name: string                    // Account name ("Cash", "Accounts Payable")

  @Column({ nullable: true })
  code: string                    // Numeric account code (1000, 2000, etc.)

  @Column()
  type: COAType                   // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE

  @Column({ nullable: true })
  description: string             // Account description

  @Column({ name: 'remote_id', nullable: true })
  remoteId: string                // External system ID (QuickBooks ID)

  @Column({ name: 'rootfi_id', nullable: true })
  rootfiId: string                // RootFi integration ID

  @ManyToOne(() => Integration)
  integration: Integration        // Which external system

  @ManyToOne(() => Organization)
  organization: Organization      // Account owner

  @Column()
  source: COASource              // LEDGERX, QUICKBOOKS, XERO, MANUAL

  @Column()
  status: COASourceStatus        // ACTIVE, INACTIVE, SYNCED, ERROR
}
```

**Purpose**: Defines the accounting structure for double-entry bookkeeping.

**Account Types**:
- **ASSET**: Cash, crypto holdings, accounts receivable
- **LIABILITY**: Accounts payable, loans, accrued expenses
- **EQUITY**: Owner's equity, retained earnings
- **REVENUE**: Sales, trading gains, staking rewards
- **EXPENSE**: Fees, salaries, operating costs

**Integration Features**:
- **Sync with External Systems**: QuickBooks, Xero, Sage integration
- **Mapping**: Maps LedgerX accounts to external system accounts
- **Status Tracking**: Monitors sync status with external systems

## 💰 **Price Management**

### **Price Entity** - Historical Pricing Data
```typescript
@Entity()
@Unique('UQ_price_cryptocurrency_date_fiatCurrency', ['cryptocurrency', 'date', 'fiatCurrency'])
export class Price extends BaseEntity {
  @ManyToOne(() => Cryptocurrency)
  cryptocurrency: Cryptocurrency   // Which token/coin

  @Column({ type: 'date' })
  date: string                    // Price date (YYYY-MM-DD)

  @Column({ name: 'fiat_currency' })
  fiatCurrency: string            // USD, EUR, GBP, etc.

  @Column({ type: 'numeric', nullable: true })
  price: number                   // Price value

  @Column({ nullable: true })
  tokenId: string                 // Legacy field for backward compatibility
}
```

**Purpose**: Stores historical cryptocurrency prices for valuation and tax calculations.

**Key Features**:
- **Daily Prices**: One price per cryptocurrency per day per fiat currency
- **Multiple Currencies**: Support for USD, EUR, GBP, etc.
- **Tax Calculations**: Used for cost basis and gain/loss calculations
- **Data Sources**: CoinGecko, CoinMarketCap, exchange APIs

**Usage**:
```typescript
// Get price for specific date
const ethPrice = await Price.findOne({
  where: {
    cryptocurrency: { symbol: 'ETH' },
    date: '2024-01-15',
    fiatCurrency: 'USD'
  }
});

// Calculate transaction value
const transactionValue = ethAmount * ethPrice.price;
```

## 🔧 **Blockchain Data Ingestion**

### **EvmTransactionDetail Entity** - EVM Transaction Analysis
```typescript
export abstract class EvmTransactionDetail extends BaseEntity {
  @Column()
  hash: string                    // Transaction hash

  @Column({ name: 'blockchain_id' })
  blockchainId: string            // ethereum-mainnet, polygon, etc.

  @Column({ name: 'method_id', nullable: true })
  methodId: string                // Contract method selector (0x12345678)

  @Column({ name: 'function_name', nullable: true })
  functionName: string            // Human-readable function name

  @Column({ name: 'error_description', nullable: true })
  errorDescription: string        // Error details if transaction failed
}
```

**Purpose**: Base class for storing detailed EVM transaction analysis across multiple chains.

**Concrete Implementations**:
- **EthereumTransactionDetail**: Ethereum mainnet
- **PolygonTransactionDetail**: Polygon network
- **ArbitrumTransactionDetail**: Arbitrum L2
- **OptimismTransactionDetail**: Optimism L2
- **BscTransactionDetail**: Binance Smart Chain
- **GnosisTransactionDetail**: Gnosis Chain

**Smart Contract Analysis**:
```typescript
// Example contract interaction analysis
{
  hash: "0x123...",
  blockchainId: "ethereum-mainnet",
  methodId: "0xa9059cbb",
  functionName: "transfer",
  errorDescription: null  // Successful transaction
}

// Failed transaction example
{
  hash: "0x456...",
  blockchainId: "ethereum-mainnet", 
  methodId: "0x7ff36ab5",
  functionName: "swapExactETHForTokens",
  errorDescription: "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT"
}
```

## 🎨 **NFT Synchronization**

### **NftOrganizationSync Entity** - NFT Collection Management
```typescript
@Entity()
export class NftOrganizationSync extends PublicEntity {
  @Column()
  status: NftSyncStatus           // PENDING, SYNCING, COMPLETED, ERROR

  @Column({ name: 'organization_id' })
  organizationId: string          // Which organization

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date               // Sync completion time

  @Column({ type: 'json', nullable: true })
  error: any                      // Error details if sync failed

  @Column({ name: 'operational_remark', nullable: true })
  operationalRemark: string       // Admin notes

  @OneToMany(() => NftAddressSync)
  nftAddressSyncs: NftAddressSync[] // Per-wallet sync status
}
```

### **NftAddressSync Entity** - Per-Wallet NFT Sync
```typescript
@Entity()
export class NftAddressSync extends PublicEntity {
  @Column()
  address: string                 // Wallet address

  @Column({ name: 'blockchain_id' })
  blockchainId: string            // ethereum-mainnet, polygon, etc.

  @Column()
  status: NftSyncStatus           // Individual wallet sync status

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date

  @Column({ type: 'json', nullable: true })
  error: any

  @ManyToOne(() => NftOrganizationSync)
  nftOrganizationSync: NftOrganizationSync // Parent sync job
}
```

**Purpose**: Manages NFT collection synchronization across multiple blockchains and wallets.

**Sync Process**:
1. **Organization Level**: Initiate sync for all wallets in organization
2. **Address Level**: Sync each wallet individually
3. **Collection Discovery**: Find NFT collections in wallet
4. **Metadata Fetching**: Get NFT metadata and images
5. **Database Storage**: Store NFT data with ownership tracking

**NFT Sync Status Flow**:
```
PENDING → SYNCING → COMPLETED
    ↓
   ERROR (with error details and retry logic)
```

## 🔄 **Blockchain-Specific Entities**

### **Per-Chain Transaction Storage**
Each EVM-compatible blockchain has its own set of entities for raw data storage:

#### **Ethereum Mainnet**:
- `EthereumTransactionDetail`
- `EthereumReceipt`
- `EthereumLog`
- `EthereumTrace`
- `EthereumAddressTransaction`

#### **Layer 2 Networks**:
- **Arbitrum**: `ArbitrumTransactionDetail`, `ArbitrumReceipt`, `ArbitrumLog`, `ArbitrumTrace`
- **Optimism**: `OptimismTransactionDetail`, `OptimismReceipt`, `OptimismLog`, `OptimismTrace`
- **Polygon**: `PolygonTransactionDetail`, `PolygonReceipt`, `PolygonLog`, `PolygonTrace`

#### **Other EVM Chains**:
- **BSC**: `BscTransactionDetail`, `BscReceipt`, `BscLog`, `BscTrace`
- **Gnosis**: `GnosisTransactionDetail`, `GnosisReceipt`, `GnosisLog`, `GnosisTrace`

**Data Storage Pattern**:
```typescript
// Common pattern across all chains
@Entity()
export class [Chain]TransactionDetail extends EvmTransactionDetail {
  // Chain-specific fields if needed
}

@Entity()  
export class [Chain]Receipt extends EvmReceipt {
  // Chain-specific receipt data
}

@Entity()
export class [Chain]Log extends EvmLog {
  // Chain-specific event log data
}
```

## 🗂️ **Additional Supporting Entities**

### **WalletContractConfigurationLog Entity** - Wallet Configuration Tracking
```typescript
@Entity()
export class WalletContractConfigurationLog extends PublicEntity {
  @Column({ name: 'wallet_id' })
  walletId: string                // Which wallet was configured

  @Column({ name: 'configuration_type' })
  configurationType: string       // GNOSIS_SAFE, MULTISIG, etc.

  @Column({ type: 'json' })
  configuration: any              // Configuration details

  @Column({ name: 'applied_at' })
  appliedAt: Date                 // When configuration was applied

  @Column({ name: 'applied_by' })
  appliedBy: string               // Who applied the configuration
}
```

**Purpose**: Tracks changes to wallet configurations, especially for smart contract wallets like Gnosis Safe.

### **IntegrationRetryRequest Entity** - Integration Error Handling
```typescript
@Entity()
export class IntegrationRetryRequest extends PublicEntity {
  @Column({ name: 'integration_name' })
  integrationName: string         // Which integration failed

  @Column({ name: 'request_type' })
  requestType: string             // SYNC, EXPORT, IMPORT

  @Column({ name: 'retry_count' })
  retryCount: number              // How many retries attempted

  @Column({ name: 'max_retries' })
  maxRetries: number              // Maximum retry attempts

  @Column({ type: 'json' })
  requestData: any                // Original request data

  @Column({ type: 'json', nullable: true })
  lastError: any                  // Last error encountered

  @Column({ name: 'next_retry_at', nullable: true })
  nextRetryAt: Date               // When to retry next

  @Column()
  status: string                  // PENDING, RETRYING, EXHAUSTED, RESOLVED
}
```

**Purpose**: Manages retry logic for failed integration requests with exponential backoff.

## 🎯 **Entity Relationship Summary**

### **Core Relationships**:
```
Organization (1) ←→ (1) OrganizationSetting
Organization (1) ←→ (*) BankFeedExportWorkflow  
Organization (1) ←→ (*) Payment
Organization (1) ←→ (*) ChartOfAccount
Organization (1) ←→ (*) NftOrganizationSync

Cryptocurrency (*) ←→ (*) Price
Wallet (1) ←→ (*) Payment (source)
Integration (1) ←→ (*) ChartOfAccount

NftOrganizationSync (1) ←→ (*) NftAddressSync
```

### **Data Flow Patterns**:
1. **Transaction Ingestion**: Raw blockchain data → Processed financial transactions
2. **Price Updates**: External APIs → Price entities → Transaction valuations
3. **Export Workflows**: Financial transactions → Export formats → External systems
4. **NFT Discovery**: Wallet addresses → NFT sync → Collection metadata
5. **Integration Sync**: External systems → Chart of accounts → Journal entries

This entity structure provides comprehensive support for multi-blockchain financial management, automated accounting, and enterprise-grade reporting capabilities.