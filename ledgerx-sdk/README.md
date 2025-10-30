# LedgerX SDK Generator

Generate **TypeScript** and **Golang SDKs** from the **LedgerX OpenAPI specification**.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Generate SDKs](#generate-sdks)
- [Usage](#usage)
    - [TypeScript SDK](#typescript-sdk)
    - [Go SDK](#go-sdk)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)

---

## 🔧 Prerequisites

- Node.js >= 14.x
- npm or yarn
- Go >= 1.18 (for Go SDK)

---

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd sdk

# Install dependencies
npm install
```

---

## 🚀 Generate SDKs

### Generate TypeScript SDK

```bash
npm run generate:ts
```

### Generate Go SDK

```bash
npm run generate:go
```

### Generate Both SDKs

```bash
npm run generate:all
```

---

## 💻 Usage

### TypeScript SDK

#### Installation

```bash
cd typescript-sdk
npm install
```

#### Example

```typescript
import { Configuration, SyncApi, WalletsApi, FinancialTransactionsApi } from './typescript-sdk';

// Initialize configuration with API key
const config = new Configuration({
  apiKey: 'YOUR_API_KEY',
  basePath: 'https://api.ledgerx.finance'
});

// Create API instances
const syncApi = new SyncApi(config);
const walletsApi = new WalletsApi(config);
const txApi = new FinancialTransactionsApi(config);

// Example: Create sync job
async function syncWallet() {
  try {
    const response = await syncApi.createSyncJob({ walletId: 'your-wallet-id' });
    console.log('Job ID:', response.data.jobId);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example: Get wallets
async function getWallets() {
  try {
    const response = await walletsApi.listWallets(0, 20);
    console.log('Wallets:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example: Get financial transactions
async function getTransactions() {
  try {
    const response = await txApi.listFinancialTransactions(0, 20);
    console.log('Transactions:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

### Go SDK

#### Installation

```bash
cd go-sdk
go mod tidy
```

#### Example

```go
package main

import (
    "context"
    "fmt"
    "log"

    ledgerx "your-module-path/go-sdk"
)

func main() {
    // Initialize configuration
    cfg := ledgerx.NewConfiguration()
    cfg.AddDefaultHeader("API_KEY", "your-api-key-here")
    cfg.Servers = ledgerx.ServerConfigurations{
        {
            URL: "https://api.ledgerx.finance",
            Description: "Production",
        },
    }

    // Create API client
    client := ledgerx.NewAPIClient(cfg)
    ctx := context.Background()

    // Example: Create sync job
    syncReq := *ledgerx.NewSyncPostRequest("your-wallet-id")
    syncResp, _, err := client.SyncAPI.CreateSyncJob(ctx).
        SyncPostRequest(syncReq).
        Execute()

    if err != nil {
        log.Fatalf("Error creating sync job: %v", err)
    }

    fmt.Printf("Job ID: %s\n", syncResp.GetJobId())

    // Example: Get wallets
    wallets, _, err := client.WalletsAPI.ListWallets(ctx).
        Page(0).
        Limit(20).
        Execute()

    if err != nil {
        log.Fatalf("Error getting wallets: %v", err)
    }

    fmt.Printf("Wallets: %+v\n", wallets)

    // Example: Get financial transactions
    txs, _, err := client.FinancialTransactionsAPI.ListFinancialTransactions(ctx).
        Page(0).
        Limit(20).
        Execute()

    if err != nil {
        log.Fatalf("Error getting transactions: %v", err)
    }

    fmt.Printf("Transactions: %+v\n", txs)
}
```

---

## 📁 Project Structure

```
sdk/
├── typescript-sdk/          # Generated TypeScript SDK
│   ├── api/                 # API endpoints
│   ├── model/               # Data models
│   └── index.ts             # Main entry point
├── go-sdk/                  # Generated Go SDK
│   ├── api/                 # API endpoints
│   ├── model/               # Data models
│   ├── client.go            # Client implementation
│   └── configuration.go     # Configuration
├── openapi.yaml             # OpenAPI specification (source)
├── openapitools.json        # OpenAPI Generator config
├── package.json             # npm scripts
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

---

## 📚 API Documentation

### Available APIs

- **Sync API** – Synchronize wallets and check sync status
- **Financial Transactions API** – Retrieve normalized financial transactions
- **Wallets API** – Manage wallets
- **Wallet Groups API** – Manage wallet groups
- **Members API** – Manage organization members
- **Chart of Accounts API** – Manage chart of accounts and mappings

### Authentication

All endpoints require an **API_KEY** header:

```bash
API_KEY: your-api-key-here
```

Get your API key from **User Dashboard → API**

### Environments

| Environment | Base URL |
|--------------|-----------|
| **Production** | https://api.ledgerx.finance |
| **Sandbox** | https://sandbox.api.ledgerx.finance |

### Rate Limits

Rate limits depend on your subscription plan. See:  
👉 [https://ledgerx.finance/subscriptions](https://ledgerx.finance/subscriptions)

---

## 🛠️ Development

### Modify OpenAPI Spec

1. Edit `openapi.yaml`
2. Regenerate SDKs:

```bash
npm run generate:all
```

### Available Scripts

```bash
npm run generate:ts   # Generate TypeScript SDK only
npm run generate:go   # Generate Go SDK only
npm run generate:all  # Generate both SDKs
```

### Customize Generation

Modify `openapitools.json` or `package.json` to adjust generator options.

#### TypeScript Options

```bash
--additional-properties=\
npmName=@ledgerx/sdk,\
npmVersion=1.0.0,\
supportsES6=true,\
withSeparateModelsAndApi=true
```

#### Go Options

```bash
--additional-properties=\
packageName=ledgerx,\
packageVersion=1.0.0,\
goModulePath=github.com/yourusername/ledgerx-sdk
```

---

## 📖 Links

- [LedgerX API Documentation](https://ledgerx.finance/docs)
- [OpenAPI Generator](https://openapi-generator.tech)
- [Rate Limits & Pricing](https://ledgerx.finance/subscriptions)

---

## 📄 License

See `LICENSE` file for details.

---

## 🤝 Support

For API support, contact: **support@ledgerx.finance**

Made with ❤️ by **LedgerX Team**
