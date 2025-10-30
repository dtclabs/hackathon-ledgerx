# LedgerX Financial Transactions - Complete Guide

## Overview
LedgerX's Financial Transaction system is designed to handle complex blockchain transactions with a parent-child relationship model. This supports both simple transfers and complex multi-step transactions like swaps, contract interactions, and DeFi operations.

## Database Architecture

### 🏗️ **Core Entity Structure**

The system uses a **hierarchical structure** with two main entities:

```
FinancialTransactionParent (Transaction Hash Level)
├── FinancialTransactionChild (Individual Transfers)
│   ├── FinancialTransactionChildMetadata (Processing Info)
│   ├── FinancialTransactionChildAnnotation (User Notes)
│   └── Cryptocurrency (Token Information)
├── JournalEntry (Accounting Records)
└── Invoice (Related Invoices)
```

### 1. **FinancialTransactionParent Entity**

**Purpose**: Represents the main blockchain transaction (by hash)

```typescript
@Entity()
export class FinancialTransactionParent extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string                    // Unique identifier for API

  @Column()
  hash: string                        // Blockchain transaction hash

  @Column({ name: 'blockchain_id' })
  blockchainId: string               // Which blockchain (ethereum, solana, etc.)

  @Column()
  activity: FinancialTransactionParentActivity  // TRANSFER, SWAP, CONTRACT_INTERACTION, etc.

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string             // Which organization owns this

  @Column()
  status: FinancialTransactionParentStatus      // ACTIVE, INACTIVE

  @Column({ name: 'export_status' })
  exportStatus: FinancialTransactionParentExportStatus // UNEXPORTED, EXPORTED, etc.

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date               // When the transaction occurred

  // Relationships
  @OneToMany(() => FinancialTransactionChild, ...)
  financialTransactionChild: FinancialTransactionChild[]

  @OneToMany(() => JournalEntry, ...)
  journalEntries: JournalEntry[]

  @OneToMany(() => Invoice, ...)
  invoices: Invoice[]
}
```

**Key Properties**:
- `hash`: The actual blockchain transaction hash (e.g., `0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3`)
- `activity`: Transaction type (TRANSFER, SWAP, CONTRACT_INTERACTION, WRAP, UNWRAP)
- `blockchainId`: Supports both EVM chains and Solana
- `exportStatus`: Tracks accounting export status

### 2. **FinancialTransactionChild Entity**

**Purpose**: Represents individual token movements within a transaction

```typescript
@Entity()
export class FinancialTransactionChild extends BaseEntity {
  @Column({ name: 'public_id' })
  publicId: string                   // Unique identifier for API

  @Column()
  hash: string                       // Same as parent hash

  @Column({ name: 'blockchain_id' })
  blockchainId: string              // Same as parent blockchain

  @Column({ name: 'from_address', nullable: true })
  fromAddress: string               // Source address (null for block rewards)

  @Column({ name: 'to_address', nullable: true })
  toAddress: string                 // Destination address (null for fees)

  @Column({ name: 'proxy_address', nullable: true })
  proxyAddress: string              // Contract proxy address if applicable

  @ManyToOne(() => Cryptocurrency)
  cryptocurrency: Cryptocurrency     // Which token/coin was transferred

  @Column({ name: 'cryptocurrency_amount' })
  cryptocurrencyAmount: string      // Amount transferred (string for precision)

  @Column({ name: 'value_timestamp' })
  valueTimestamp: Date              // Same as parent timestamp

  @Column({ name: 'organization_id', type: 'bigint' })
  organizationId: string            // Same as parent organization

  // Relationships
  @ManyToOne(() => FinancialTransactionParent)
  financialTransactionParent: FinancialTransactionParent

  @OneToOne(() => FinancialTransactionChildMetadata)
  financialTransactionChildMetadata: FinancialTransactionChildMetadata
}
```

**Key Properties**:
- `fromAddress`/`toAddress`: Can be null for special cases (fees, block rewards)
- `cryptocurrencyAmount`: Stored as string to maintain precision
- `cryptocurrency`: Links to token/coin metadata

### 3. **FinancialTransactionChildMetadata Entity**

**Purpose**: Processing and categorization information for each child transaction

```typescript
@Entity()
export class FinancialTransactionChildMetadata extends BaseEntity {
  @Column()
  direction: FinancialTransactionChildMetadataDirection  // INCOMING, OUTGOING

  @Column()
  type: FinancialTransactionChildMetadataType           // DEPOSIT, WITHDRAWAL, FEE, etc.

  @Column()
  status: FinancialTransactionChildMetadataStatus       // SYNCED, INACTIVE, IGNORED, SYNCING

  @Column({ nullable: true })
  substatus: FinancialTransactionChildMetadataSubstatus // MISSING_COST_BASIS, MISSING_PRICE

  @Column({ name: 'gain_loss_inclusion_status' })
  gainLossInclusionStatus: GainLossInclusionStatus      // ALL, INTERNAL, NONE

  @Column({ nullable: true })
  paymentMetadata: FinancialTransactionChildPaymentMetadata // Payment-specific data

  @Column({ nullable: true })
  gnosisMetadata: FinancialTransactionChildGnosisMetadata   // Gnosis Safe data

  @OneToOne(() => FinancialTransactionChild)
  financialTransactionChild: FinancialTransactionChild
}
```

**Transaction Types**:
- **DEPOSIT**: Incoming token/coin
- **DEPOSIT_INTERNAL**: Internal transfer within organization
- **DEPOSIT_GROUP**: Transfer within wallet group
- **WITHDRAWAL**: Outgoing token/coin
- **WITHDRAWAL_INTERNAL**: Internal transfer within organization
- **WITHDRAWAL_GROUP**: Transfer within wallet group
- **FEE**: Transaction fee payment

## 📊 **Database Relationships**

### Entity Relationship Diagram
```
┌─────────────────────────────────┐
│     FinancialTransactionParent  │
│     ┌─────────────────────────┐ │
│     │ hash (PK)               │ │
│     │ blockchainId            │ │
│     │ activity                │ │
│     │ organizationId          │ │
│     │ status                  │ │
│     │ exportStatus            │ │
│     │ valueTimestamp          │ │
│     └─────────────────────────┘ │
└─────────────────────────────────┘
                │
                │ OneToMany
                ▼
┌─────────────────────────────────┐
│     FinancialTransactionChild   │
│     ┌─────────────────────────┐ │
│     │ publicId (PK)           │ │
│     │ hash                    │ │
│     │ fromAddress             │ │
│     │ toAddress               │ │
│     │ cryptocurrencyAmount    │ │
│     │ cryptocurrency_id (FK)  │ │
│     │ parent_id (FK)          │ │
│     └─────────────────────────┘ │
└─────────────────────────────────┘
                │
                │ OneToOne
                ▼
┌─────────────────────────────────┐
│ FinancialTransactionChildMeta   │
│     ┌─────────────────────────┐ │
│     │ direction               │ │
│     │ type                    │ │
│     │ status                  │ │
│     │ gainLossInclusionStatus │ │
│     └─────────────────────────┘ │
└─────────────────────────────────┘
```

### Index Strategy
- **Performance Indexes**:
  - `IDX_fin_txn_child_toAddr_fromAddr_orgId_blockchainId`: Fast address lookups
  - `IDX_fin_txn_child_hash`: Transaction hash searches
  - `IDX_fin_txn_child_parent_id`: Parent-child relationship queries

## 🔄 **How to Create Financial Transactions**

### Method 1: Manual Creation via API

#### Step 1: Create Parent Transaction
```typescript
POST /financial-transactions/parents

{
  "hash": "0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3",
  "blockchainId": "ethereum-mainnet",
  "activity": "SWAP",
  "status": "ACTIVE",
  "valueTimestamp": "2023-02-28T07:58:47.000Z"
}
```

#### Step 2: Create Child Transactions
```typescript
POST /financial-transactions/children

// First child: Outgoing token (what user sent)
{
  "hash": "0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3",
  "blockchainId": "ethereum-mainnet",
  "fromAddress": "0x742E4bD8F5D8F5D8F5D8F5D8F5D8F5D8F5D8F5D8",
  "toAddress": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "cryptocurrencyId": "ethereum-mainnet-usdc",
  "cryptocurrencyAmount": "1000000000", // 1000 USDC (6 decimals)
  "direction": "OUTGOING",
  "type": "WITHDRAWAL"
}

// Second child: Incoming token (what user received)
{
  "hash": "0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3",
  "blockchainId": "ethereum-mainnet",
  "fromAddress": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  "toAddress": "0x742E4bD8F5D8F5D8F5D8F5D8F5D8F5D8F5D8F5D8",
  "cryptocurrencyId": "ethereum-mainnet-uni",
  "cryptocurrencyAmount": "100000000000000000000", // 100 UNI (18 decimals)
  "direction": "INCOMING",
  "type": "DEPOSIT"
}

// Third child: Transaction fee
{
  "hash": "0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3",
  "blockchainId": "ethereum-mainnet",
  "fromAddress": "0x742E4bD8F5D8F5D8F5D8F5D8F5D8F5D8F5D8F5D8",
  "toAddress": null, // Fees go to validators
  "cryptocurrencyId": "ethereum-mainnet-eth",
  "cryptocurrencyAmount": "5000000000000000", // 0.005 ETH gas fee
  "direction": "OUTGOING",
  "type": "FEE"
}
```

### Method 2: Automatic Ingestion (Recommended)

LedgerX automatically ingests transactions from connected wallets:

#### For Ethereum/EVM Chains:
1. **Wallet Connection**: User adds wallet address
2. **Alchemy Integration**: System fetches transaction history via Alchemy API
3. **Transaction Parsing**: Automatic analysis of transaction data
4. **Entity Creation**: Automatic parent/child creation

#### For Solana Chains (New):
1. **Wallet Connection**: User adds Solana wallet address
2. **Helius Integration**: System fetches enhanced transaction data via Helius API
3. **SPL Token Support**: Automatic parsing of SOL and SPL token transfers
4. **Entity Creation**: Automatic parent/child creation with Solana-specific metadata

### Method 3: Bulk Import via CSV

```typescript
POST /financial-transactions/bulk-import
Content-Type: multipart/form-data

CSV Format:
hash,blockchain_id,activity,from_address,to_address,cryptocurrency_symbol,amount,timestamp
0x123...,ethereum-mainnet,TRANSFER,0xabc...,0xdef...,USDC,1000,2023-02-28T07:58:47.000Z
```

## 💰 **Transaction Types & Examples**

### 1. **Simple Transfer**
```json
{
  "parent": {
    "hash": "0x123...",
    "activity": "TRANSFER",
    "blockchainId": "ethereum-mainnet"
  },
  "children": [
    {
      "type": "WITHDRAWAL",
      "direction": "OUTGOING",
      "fromAddress": "0xuser...",
      "toAddress": "0xrecipient...",
      "cryptocurrency": "USDC",
      "amount": "1000000000"
    },
    {
      "type": "FEE",
      "direction": "OUTGOING",
      "fromAddress": "0xuser...",
      "toAddress": null,
      "cryptocurrency": "ETH",
      "amount": "21000000000000000"
    }
  ]
}
```

### 2. **Token Swap (DEX)**
```json
{
  "parent": {
    "hash": "0x456...",
    "activity": "SWAP",
    "blockchainId": "ethereum-mainnet"
  },
  "children": [
    {
      "type": "WITHDRAWAL",
      "direction": "OUTGOING",
      "cryptocurrency": "USDC",
      "amount": "1000000000"
    },
    {
      "type": "DEPOSIT",
      "direction": "INCOMING",
      "cryptocurrency": "UNI",
      "amount": "100000000000000000000"
    },
    {
      "type": "FEE",
      "direction": "OUTGOING",
      "cryptocurrency": "ETH",
      "amount": "5000000000000000"
    }
  ]
}
```

### 3. **Solana SPL Token Transfer**
```json
{
  "parent": {
    "hash": "5J8...",
    "activity": "TRANSFER",
    "blockchainId": "solana-mainnet"
  },
  "children": [
    {
      "type": "WITHDRAWAL",
      "direction": "OUTGOING",
      "fromAddress": "EPjF...",
      "toAddress": "11111...",
      "cryptocurrency": "USDC",
      "amount": "1000000"
    },
    {
      "type": "FEE",
      "direction": "OUTGOING",
      "cryptocurrency": "SOL",
      "amount": "5000"
    }
  ]
}
```

### 4. **Contract Interaction (DeFi)**
```json
{
  "parent": {
    "hash": "0x789...",
    "activity": "CONTRACT_INTERACTION",
    "blockchainId": "ethereum-mainnet"
  },
  "children": [
    {
      "type": "WITHDRAWAL",
      "direction": "OUTGOING",
      "cryptocurrency": "USDC",
      "amount": "10000000000",
      "proxyAddress": "0xcompound..."
    },
    {
      "type": "DEPOSIT",
      "direction": "INCOMING",
      "cryptocurrency": "cUSDC",
      "amount": "500000000000"
    },
    {
      "type": "FEE",
      "direction": "OUTGOING",
      "cryptocurrency": "ETH",
      "amount": "8000000000000000"
    }
  ]
}
```

## 🔍 **Query Patterns**

### Get Transactions for an Address
```typescript
GET /financial-transactions?addresses[]=0x742E4bD8F5D8F5D8F5D8F5D8F5D8F5D8F5D8F5D8
```

### Filter by Activity Type
```typescript
GET /financial-transactions?activities[]=SWAP&activities[]=TRANSFER
```

### Filter by Blockchain
```typescript
GET /financial-transactions?blockchainIds[]=ethereum-mainnet&blockchainIds[]=solana-mainnet
```

### Filter by Date Range
```typescript
GET /financial-transactions?fromDate=2023-01-01&toDate=2023-12-31
```

### Complex Query Example
```typescript
GET /financial-transactions?
  addresses[]=0x742E4bD8F5D8F5D8F5D8F5D8F5D8F5D8F5D8F5D8&
  activities[]=SWAP&
  blockchainIds[]=ethereum-mainnet&
  cryptocurrencySymbols[]=USDC&
  fromDate=2023-01-01&
  limit=50&
  offset=0&
  sortBy=valueTimestamp&
  sortDirection=DESC
```

## 🏷️ **Status Management**

### Parent Status Values
- **ACTIVE**: Normal, visible transaction
- **INACTIVE**: Hidden or archived transaction

### Child Status Values
- **SYNCED**: Successfully processed and categorized
- **INACTIVE**: Hidden child transaction
- **IGNORED**: Excluded from reports and calculations
- **SYNCING**: Currently being processed

### Export Status Values
- **UNEXPORTED**: Ready for accounting export
- **EXPORTING**: Currently being exported
- **EXPORTED**: Successfully exported to accounting system
- **FAILED**: Export failed, needs attention

## 📊 **Accounting Integration**

### Journal Entries
Financial transactions automatically generate journal entries for accounting:

```typescript
// Example journal entry for a token sale
{
  "debit": [
    {
      "account": "Cash",
      "amount": "1000.00",
      "currency": "USD"
    }
  ],
  "credit": [
    {
      "account": "Cryptocurrency Assets",
      "amount": "1000.00",
      "currency": "USD"
    }
  ]
}
```

### Tax Reporting
- **Cost Basis Tracking**: Automatic FIFO/LIFO calculations
- **Gain/Loss Calculation**: Capital gains reporting
- **Tax Lot Management**: Detailed purchase/sale matching

## 🔧 **API Endpoints Summary**

### Core CRUD Operations
- `GET /financial-transactions` - List/search transactions
- `GET /financial-transactions/:id` - Get specific transaction
- `POST /financial-transactions` - Create transaction
- `PUT /financial-transactions/:id` - Update transaction
- `DELETE /financial-transactions/:id` - Delete transaction

### Bulk Operations
- `POST /financial-transactions/bulk-import` - CSV import
- `POST /financial-transactions/bulk-export` - Export to CSV/Excel
- `POST /financial-transactions/sync` - Sync from blockchain

### Metadata Operations
- `PUT /financial-transactions/:id/categorize` - Update categorization
- `POST /financial-transactions/:id/annotations` - Add notes
- `PUT /financial-transactions/:id/ignore` - Ignore transaction

### Reporting
- `GET /financial-transactions/summary` - Transaction summary
- `GET /financial-transactions/export` - Accounting export
- `GET /financial-transactions/tax-report` - Tax calculations

## 🚀 **Best Practices**

### 1. **Data Integrity**
- Always create parent before children
- Ensure hash consistency across parent/children
- Validate address formats for blockchain
- Use string amounts for precision

### 2. **Performance**
- Use address-based indexes for queries
- Paginate large result sets
- Cache frequently accessed data
- Bulk operations for large imports

### 3. **Error Handling**
- Graceful handling of failed blockchain calls
- Retry mechanisms for temporary failures
- Comprehensive logging for debugging
- User-friendly error messages

### 4. **Security**
- Validate all input addresses
- Sanitize user-provided data
- Use parameterized queries
- Audit trail for all changes

This comprehensive guide covers the entire Financial Transaction system in LedgerX, from database structure to API usage and best practices.