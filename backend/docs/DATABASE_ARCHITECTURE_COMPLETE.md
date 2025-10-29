# LedgerX Database Architecture - Complete Guide

## 🏗️ **Database Overview**

LedgerX uses a PostgreSQL database with TypeORM as the ORM. The database is designed around multi-tenancy with organization-based data segregation, supporting both traditional accounting workflows and cryptocurrency transaction management.

## 📊 **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            LedgerX Database Architecture                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Management   │    │  Organization Core  │    │  Wallet & Crypto    │
│                     │    │                     │    │                     │
│ • Account           │    │ • Organization      │    │ • Wallet            │
│ • Member            │    │ • Member            │    │ • WalletGroup       │
│ • Role              │    │ • Role              │    │ • Cryptocurrency    │
│ • Permission        │    │ • Permission        │    │ • Blockchain        │
│ • Invitation        │    │ • OrganizationSetting│   │ • Token             │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Financial Txns     │    │  Accounting & Tax   │    │  Integration &      │
│                     │    │                     │    │  External APIs      │
│ • FinancialTxnParent│    │ • JournalEntry      │    │ • IntegrationSync   │
│ • FinancialTxnChild │    │ • ChartOfAccount    │    │ • BankFeedExport    │
│ • TxnMetadata       │    │ • TaxLotSale        │    │ • Payment           │
│ • Annotation        │    │ • Category          │    │ • Payout            │
│ • Invoice           │    │ • GainsLosses       │    │ • NFTSync           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 **Core Authentication & Authorization**

### **Account Entity** - User Authentication
```typescript
@Entity()
export class Account extends BaseEntity {
  @Column({ unique: true })
  email: string                    // User's email address

  @Column({ nullable: true })
  hashedPassword: string           // Password hash (nullable for OAuth users)

  @Column({ nullable: true })
  address: string                  // Wallet address for crypto authentication

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date            // Email verification timestamp

  @Column({ name: 'agreement_signed_at', nullable: true })
  agreementSignedAt: Date          // Terms acceptance timestamp

  @Column({ name: 'sign_in_count', default: 0 })
  signInCount: number              // Login counter

  @Column({ name: 'current_sign_in_at', nullable: true })
  currentSignInAt: Date            // Current session start

  @Column({ name: 'last_sign_in_at', nullable: true })
  lastSignInAt: Date               // Previous session

  @OneToMany(() => Member, (member) => member.account)
  members: Member[]                // Organization memberships
}
```

### **Organization Entity** - Multi-tenancy Core
```typescript
@Entity()
export class Organization extends BaseEntity {
  @Column()
  name: string                     // Organization name

  @Column({ type: 'enum', enum: OrganizationType })
  type: OrganizationType           // DAO, COMPANY, INDIVIDUAL

  @Column({ name: 'public_id', type: 'uuid', unique: true })
  @Generated('uuid')
  publicId: string                 // External identifier

  @OneToMany(() => Member, (member) => member.organization)
  members: Member[]                // Organization members

  @OneToMany(() => Wallet, (wallet) => wallet.organization)
  wallets: Wallet[]                // Organization wallets

  @OneToMany(() => FinancialTransactionParent, ...)
  financialTransactions: FinancialTransactionParent[]

  @OneToOne(() => OrganizationSetting)
  settings: OrganizationSetting    // Organization configuration
}
```

### **Member Entity** - Organization Membership
```typescript
@Entity()
export class Member extends BaseEntity {
  @Column({ name: 'public_id', type: 'uuid', unique: true })
  publicId: string

  @ManyToOne(() => Role)
  role: Role                       // User's role in organization

  @ManyToOne(() => Organization)
  organization: Organization       // Which organization

  @ManyToOne(() => Account)
  account: Account                 // Which user account

  @OneToOne(() => MemberProfile)
  profile: MemberProfile           // Additional profile info
}
```

### **Role & Permission System**
```typescript
@Entity()
export class Role extends BaseEntity {
  @Column()
  name: string                     // ADMIN, MEMBER, VIEWER, etc.

  @Column()
  description: string

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[]        // What this role can do
}

@Entity()
export class Permission extends BaseEntity {
  @Column()
  action: string                   // CREATE, READ, UPDATE, DELETE

  @Column()
  resource: string                 // WALLET, TRANSACTION, MEMBER, etc.
}
```

## 💰 **Cryptocurrency & Wallet Management**

### **Wallet Entity** - Crypto Wallets
```typescript
@Entity()
export class Wallet extends PublicEntity {
  @Column()
  name: string                     // User-defined wallet name

  @Column()
  address: string                  // Blockchain address (ETH/Solana)

  @ManyToOne(() => Organization)
  organization: Organization       // Which organization owns this

  @Column({ type: 'enum', enum: SourceType })
  sourceType: SourceType           // ETH, SOL, BTC, etc.

  @Column({ type: 'json', nullable: true })
  metadata: GnosisWalletMetadata[] // Gnosis Safe metadata

  @ManyToOne(() => WalletGroup)
  walletGroup: WalletGroup         // Logical grouping of wallets

  @Column({ type: 'json', nullable: true })
  balance: WalletBalance           // Current token balances

  @Column({ type: 'enum', enum: WalletStatusesEnum })
  status: WalletStatusesEnum       // SYNCED, SYNCING, ERROR

  @Column({ name: 'last_synced_at', nullable: true })
  lastSyncedAt: Date               // Last blockchain sync

  @OneToMany(() => WalletSync)
  walletSyncs: WalletSync[]        // Sync history
}
```

### **WalletGroup Entity** - Logical Wallet Grouping
```typescript
@Entity()
export class WalletGroup extends PublicEntity {
  @Column()
  name: string                     // Group name (e.g., "Trading Wallets")

  @Column({ type: 'text', nullable: true })
  description: string              // Group description

  @ManyToOne(() => Organization)
  organization: Organization

  @OneToMany(() => Wallet)
  wallets: Wallet[]                // Wallets in this group

  @Column({ type: 'enum', enum: WalletGroupStatusesEnum })
  status: WalletGroupStatusesEnum  // ACTIVE, INACTIVE
}
```

### **Cryptocurrency Entity** - Token/Coin Definitions
```typescript
@Entity()
export class Cryptocurrency extends BaseEntity {
  @Column()
  name: string                     // "Ethereum", "USD Coin"

  @Column()
  symbol: string                   // "ETH", "USDC"

  @Column({ name: 'contract_address', nullable: true })
  contractAddress: string          // Token contract address

  @Column({ name: 'blockchain_id' })
  blockchainId: string             // Which blockchain

  @Column()
  decimals: number                 // Token decimals (18 for ETH, 6 for USDC)

  @Column({ type: 'enum', enum: CryptocurrencyType })
  type: CryptocurrencyType         // NATIVE, ERC20, SPL_TOKEN, etc.

  @Column({ name: 'is_stablecoin', default: false })
  isStablecoin: boolean            // Price stability flag

  @Column({ name: 'external_id', nullable: true })
  externalId: string               // CoinGecko ID for pricing
}
```

### **Blockchain Entity** - Supported Networks
```typescript
@Entity()
export class Blockchain extends BaseEntity {
  @Column({ name: 'public_id', unique: true })
  publicId: string                 // "ethereum-mainnet", "solana-mainnet"

  @Column()
  name: string                     // "Ethereum Mainnet"

  @Column({ name: 'chain_id', nullable: true })
  chainId: number                  // EVM chain ID (1 for Ethereum)

  @Column({ name: 'native_currency_symbol' })
  nativeCurrencySymbol: string     // "ETH", "SOL"

  @Column({ name: 'block_explorer_url' })
  blockExplorerUrl: string         // Etherscan, Solscan URLs

  @Column({ name: 'is_testnet', default: false })
  isTestnet: boolean               // Production vs test network
}
```

## 🔄 **Financial Transaction System**

### **FinancialTransactionParent** - Main Transaction Record
```typescript
@Entity()
export class FinancialTransactionParent extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string                 // API identifier

  @Column()
  hash: string                     // Blockchain transaction hash

  @Column({ name: 'blockchain_id' })
  blockchainId: string             // Which blockchain

  @Column({ type: 'enum' })
  activity: FinancialTransactionParentActivity // TRANSFER, SWAP, etc.

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string           // Organization owner

  @Column({ type: 'enum' })
  status: FinancialTransactionParentStatus     // ACTIVE, INACTIVE

  @Column({ name: 'export_status', type: 'enum' })
  exportStatus: FinancialTransactionParentExportStatus // Accounting export

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date             // Transaction timestamp

  @OneToMany(() => FinancialTransactionChild)
  children: FinancialTransactionChild[]        // Individual token movements

  @OneToMany(() => JournalEntry)
  journalEntries: JournalEntry[]   // Accounting entries

  @OneToMany(() => Invoice)
  invoices: Invoice[]              // Related invoices
}
```

### **FinancialTransactionChild** - Individual Token Movements
```typescript
@Entity()
export class FinancialTransactionChild extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  hash: string                     // Same as parent hash

  @Column({ name: 'from_address', nullable: true })
  fromAddress: string              // Source address

  @Column({ name: 'to_address', nullable: true })
  toAddress: string                // Destination address

  @Column({ name: 'proxy_address', nullable: true })
  proxyAddress: string             // Contract proxy

  @ManyToOne(() => Cryptocurrency)
  cryptocurrency: Cryptocurrency   // Which token

  @Column({ name: 'cryptocurrency_amount' })
  cryptocurrencyAmount: string     // Amount (string for precision)

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date

  @ManyToOne(() => FinancialTransactionParent)
  parent: FinancialTransactionParent

  @OneToOne(() => FinancialTransactionChildMetadata)
  metadata: FinancialTransactionChildMetadata // Processing info
}
```

### **FinancialTransactionChildMetadata** - Processing & Categorization
```typescript
@Entity()
export class FinancialTransactionChildMetadata extends BaseEntity {
  @Column({ type: 'enum' })
  direction: FinancialTransactionChildMetadataDirection // INCOMING, OUTGOING

  @Column({ type: 'enum' })
  type: FinancialTransactionChildMetadataType          // DEPOSIT, WITHDRAWAL, FEE

  @Column({ type: 'enum' })
  status: FinancialTransactionChildMetadataStatus      // SYNCED, IGNORED, etc.

  @Column({ type: 'enum', nullable: true })
  substatus: FinancialTransactionChildMetadataSubstatus // MISSING_PRICE, etc.

  @Column({ name: 'gain_loss_inclusion_status', type: 'enum' })
  gainLossInclusionStatus: GainLossInclusionStatus     // Tax reporting

  @Column({ type: 'json', nullable: true })
  paymentMetadata: FinancialTransactionChildPaymentMetadata // Payment data

  @Column({ type: 'json', nullable: true })
  gnosisMetadata: FinancialTransactionChildGnosisMetadata   // Gnosis Safe data

  @OneToOne(() => FinancialTransactionChild)
  child: FinancialTransactionChild
}
```

## 📋 **Accounting & Tax Management**

### **JournalEntry** - Double-Entry Bookkeeping
```typescript
@Entity()
export class JournalEntry extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column({ name: 'entry_date' })
  entryDate: Date                  // Accounting date

  @Column()
  description: string              // Entry description

  @Column({ name: 'debit_amount', type: 'decimal', precision: 28, scale: 8 })
  debitAmount: string              // Debit amount

  @Column({ name: 'credit_amount', type: 'decimal', precision: 28, scale: 8 })
  creditAmount: string             // Credit amount

  @ManyToOne(() => ChartOfAccount)
  debitAccount: ChartOfAccount     // Debit account

  @ManyToOne(() => ChartOfAccount)
  creditAccount: ChartOfAccount    // Credit account

  @ManyToOne(() => FinancialTransactionParent)
  financialTransactionParent: FinancialTransactionParent // Source transaction

  @ManyToOne(() => Organization)
  organization: Organization
}
```

### **ChartOfAccount** - Accounting Structure
```typescript
@Entity()
export class ChartOfAccount extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  name: string                     // Account name

  @Column({ name: 'account_code' })
  accountCode: string              // Numeric code

  @Column({ type: 'enum' })
  type: ChartOfAccountType         // ASSET, LIABILITY, EQUITY, etc.

  @Column({ name: 'parent_id', nullable: true })
  parentId: string                 // Hierarchical structure

  @ManyToOne(() => Organization)
  organization: Organization

  @OneToMany(() => JournalEntry)
  journalEntries: JournalEntry[]   // Entries using this account
}
```

### **TaxLotSale** - Capital Gains Tracking
```typescript
@Entity()
export class TaxLotSale extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column({ name: 'sale_date' })
  saleDate: Date                   // Sale date

  @Column({ name: 'purchase_date' })
  purchaseDate: Date               // Original purchase date

  @Column({ name: 'quantity_sold', type: 'decimal' })
  quantitySold: string             // Amount sold

  @Column({ name: 'cost_basis', type: 'decimal' })
  costBasis: string                // Original cost

  @Column({ name: 'sale_proceeds', type: 'decimal' })
  saleProceeds: string             // Sale amount

  @Column({ name: 'gain_loss', type: 'decimal' })
  gainLoss: string                 // Calculated gain/loss

  @Column({ name: 'is_long_term' })
  isLongTerm: boolean              // > 1 year holding

  @ManyToOne(() => Cryptocurrency)
  cryptocurrency: Cryptocurrency

  @ManyToOne(() => FinancialTransactionChild)
  saleTransaction: FinancialTransactionChild
}
```

## 🏷️ **Organization & Categorization**

### **Category** - Transaction Categorization
```typescript
@Entity()
export class Category extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  name: string                     // "Trading", "DeFi", "Payroll"

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ name: 'color_code', nullable: true })
  colorCode: string                // UI color

  @ManyToOne(() => Organization)
  organization: Organization

  @ManyToOne(() => Category, { nullable: true })
  parent: Category                 // Hierarchical categories

  @OneToMany(() => Category)
  children: Category[]
}
```

### **Contact Management**
```typescript
@Entity()
export class Contact extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  name: string                     // Contact name

  @Column({ nullable: true })
  email: string                    // Contact email

  @Column({ name: 'wallet_address', nullable: true })
  walletAddress: string            // Associated wallet

  @Column({ type: 'enum' })
  type: ContactType                // INDIVIDUAL, BUSINESS, EXCHANGE

  @ManyToOne(() => Organization)
  organization: Organization
}

@Entity()
export class Recipient extends Contact {
  @OneToMany(() => RecipientBankAccount)
  bankAccounts: RecipientBankAccount[] // Bank account info
}
```

## 🔗 **Integration & External APIs**

### **Integration Management**
```typescript
@Entity()
export class OrganizationIntegration extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column({ type: 'enum' })
  provider: IntegrationProvider    // QUICKBOOKS, XERO, COINBASE, etc.

  @Column({ type: 'enum' })
  status: IntegrationStatus        // ACTIVE, INACTIVE, ERROR

  @ManyToOne(() => Organization)
  organization: Organization

  @OneToOne(() => OrganizationIntegrationAuth)
  auth: OrganizationIntegrationAuth // OAuth tokens

  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt: Date

  @OneToMany(() => IntegrationSyncRequest)
  syncRequests: IntegrationSyncRequest[] // Sync history
}

@Entity()
export class OrganizationIntegrationAuth extends BaseEntity {
  @Column({ name: 'access_token', nullable: true })
  accessToken: string              // OAuth access token

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string             // OAuth refresh token

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date                  // Token expiration

  @OneToOne(() => OrganizationIntegration)
  integration: OrganizationIntegration
}
```

### **Payment Processing**
```typescript
@Entity()
export class Payment extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column({ type: 'decimal', precision: 28, scale: 8 })
  amount: string                   // Payment amount

  @Column()
  currency: string                 // USD, EUR, etc.

  @Column({ type: 'enum' })
  status: PaymentStatus            // PENDING, COMPLETED, FAILED

  @Column({ type: 'enum' })
  method: PaymentMethod            // BANK_TRANSFER, CREDIT_CARD, CRYPTO

  @ManyToOne(() => Organization)
  organization: Organization

  @ManyToOne(() => Contact)
  recipient: Contact               // Who received payment

  @Column({ name: 'external_id', nullable: true })
  externalId: string               // Third-party payment ID
}

@Entity()
export class Payout extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column({ type: 'decimal', precision: 28, scale: 8 })
  amount: string

  @Column()
  currency: string

  @Column({ type: 'enum' })
  status: PayoutStatus             // PENDING, PROCESSING, COMPLETED

  @ManyToOne(() => Organization)
  organization: Organization

  @ManyToOne(() => RecipientBankAccount)
  bankAccount: RecipientBankAccount // Destination bank account
}
```

## 🎨 **NFT Management**

### **NFT Entities**
```typescript
@Entity()
export class Nft extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column({ name: 'token_id' })
  tokenId: string                  // NFT token ID

  @Column({ name: 'contract_address' })
  contractAddress: string          // NFT contract

  @Column({ name: 'blockchain_id' })
  blockchainId: string             // Which blockchain

  @Column()
  name: string                     // NFT name

  @Column({ type: 'text', nullable: true })
  description: string              // NFT description

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string                 // NFT image

  @Column({ name: 'metadata_url', nullable: true })
  metadataUrl: string              // Metadata URI

  @ManyToOne(() => NftCollection)
  collection: NftCollection        // NFT collection

  @ManyToOne(() => Organization)
  organization: Organization       // Current owner
}

@Entity()
export class NftCollection extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  name: string                     // Collection name

  @Column({ name: 'contract_address' })
  contractAddress: string          // Collection contract

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @OneToMany(() => Nft)
  nfts: Nft[]                      // NFTs in collection
}
```

### **NFT Sync Management**
```typescript
@Entity()
export class NftOrganizationSync extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: string

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ type: 'enum' })
  status: NftSyncStatus            // SYNCING, COMPLETED, ERROR

  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt: Date

  @OneToMany(() => NftAddressSync)
  addressSyncs: NftAddressSync[]   // Per-address sync status
}

@Entity()
export class NftAddressSync extends BaseEntity {
  @Column()
  address: string                  // Wallet address

  @Column({ name: 'blockchain_id' })
  blockchainId: string

  @Column({ type: 'enum' })
  status: NftSyncStatus

  @ManyToOne(() => NftOrganizationSync)
  organizationSync: NftOrganizationSync
}
```

## 💾 **Raw Data Storage (Blockchain Ingestion)**

### **EVM Transaction Data**
```typescript
// Ethereum/EVM specific entities for raw blockchain data
@Entity()
export class EvmTransaction extends BaseEntity {
  @Column()
  hash: string

  @Column({ name: 'block_number' })
  blockNumber: string

  @Column({ name: 'from_address' })
  fromAddress: string

  @Column({ name: 'to_address', nullable: true })
  toAddress: string

  @Column()
  value: string

  @Column()
  gas: string

  @Column({ name: 'gas_price' })
  gasPrice: string

  @Column({ name: 'gas_used', nullable: true })
  gasUsed: string

  @OneToMany(() => EvmLog)
  logs: EvmLog[]                   // Event logs

  @OneToMany(() => EvmTrace)
  traces: EvmTrace[]               // Internal transactions
}

@Entity()
export class EvmLog extends BaseEntity {
  @Column({ name: 'transaction_hash' })
  transactionHash: string

  @Column({ name: 'log_index' })
  logIndex: number

  @Column()
  address: string                  // Contract address

  @Column({ type: 'text', array: true })
  topics: string[]                 // Event topics

  @Column()
  data: string                     // Event data

  @ManyToOne(() => EvmTransaction)
  transaction: EvmTransaction
}
```

### **Price Data**
```typescript
@Entity()
export class Price extends BaseEntity {
  @Column({ name: 'cryptocurrency_id' })
  cryptocurrencyId: string

  @Column({ name: 'fiat_currency_id' })
  fiatCurrencyId: string           // USD, EUR, etc.

  @Column({ type: 'decimal', precision: 28, scale: 8 })
  price: string                    // Price value

  @Column({ name: 'price_date' })
  priceDate: Date                  // Price timestamp

  @Column({ name: 'data_source' })
  dataSource: string               // COINGECKO, COINBASE, etc.

  @ManyToOne(() => Cryptocurrency)
  cryptocurrency: Cryptocurrency

  @ManyToOne(() => FiatCurrency)
  fiatCurrency: FiatCurrency
}
```

## 🔄 **Export & Reporting**

### **Bank Feed Export**
```typescript
@Entity()
export class BankFeedExportWorkflow extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string

  @Column()
  name: string                     // Export name

  @Column({ type: 'enum' })
  provider: BankFeedProvider       // QUICKBOOKS, XERO

  @Column({ type: 'enum' })
  status: ExportStatus             // PENDING, COMPLETED, FAILED

  @ManyToOne(() => Organization)
  organization: Organization

  @OneToMany(() => BankFeedExportEntry)
  entries: BankFeedExportEntry[]   // Individual export entries
}
```

## 📋 **Base Entity Pattern**

All entities inherit from `BaseEntity`:

```typescript
@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number                       // Internal primary key

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date                  // Record creation

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date                  // Last modification

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date                  // Soft delete timestamp

  @Column({ name: 'created_by', nullable: true })
  createdBy: string                // Who created

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string                // Who updated
}
```

Many entities also inherit from `PublicEntity`:
```typescript
export abstract class PublicEntity extends BaseEntity {
  @Column({ name: 'public_id', type: 'uuid', unique: true })
  @Generated('uuid')
  publicId: string                 // External API identifier
}
```

## 🔍 **Database Indexes & Performance**

### **Key Indexes**
- **Organizations**: `organization_id` on most entities for multi-tenancy
- **Financial Transactions**: Composite indexes on addresses, hashes, timestamps
- **Wallets**: Address-based indexes for quick lookups
- **Members**: Account + Organization combinations
- **Prices**: Cryptocurrency + Date combinations

### **Performance Considerations**
- **Partitioning**: Large tables partitioned by organization or date
- **Archival**: Old transaction data moved to archive tables
- **Caching**: Frequently accessed data cached in Redis
- **Read Replicas**: Reporting queries use read replicas

## 🛡️ **Security & Compliance**

### **Data Protection**
- **Encryption**: Sensitive fields encrypted at rest
- **Audit Logs**: All changes tracked with timestamps and users
- **Soft Deletes**: Data marked as deleted but preserved
- **Backup**: Regular encrypted backups with point-in-time recovery

### **Compliance Features**
- **GDPR**: Data export and deletion capabilities
- **SOX**: Immutable audit trails for financial data
- **Tax Reporting**: Complete transaction history preservation
- **Multi-jurisdiction**: Support for different regulatory requirements

This comprehensive database architecture supports LedgerX's mission to provide enterprise-grade cryptocurrency accounting and financial management across multiple blockchains and traditional finance integrations.