# 🔐 LedgerX

**A comprehensive Solana portfolio management and financial tracking platform.**

LedgerX provides a complete ecosystem for tracking, managing, and analyzing Solana transactions and portfolios with real-time data ingestion, powerful APIs, and an intuitive PWA interface.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend PWA  │◄──►│   Backend API    │◄──►│ Data Ingestor   │
│  (Seeker PWA)   │    │   (NestJS)       │    │   (Python)      │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   LedgerX SDK   │    │   PostgreSQL     │    │ Solana Network  │
│ (TS/Go Client)  │    │   Database       │    │                 │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 📁 Project Structure

### 🔧 Backend (`/backend`)
**Core API and business logic layer**

- **Technology Stack**: NestJS 8, TypeScript, PostgreSQL, TypeORM
- **Authentication**: Passport.js integration
- **Testing**: Jest test framework
- **Features**:
  - Solana portfolio management and balance tracking
  - Financial transaction filtering and analytics
  - Solana wallet support with proper address handling
  - Gain/loss calculation engine
  - RESTful API with comprehensive endpoints

**Key Capabilities**:
- ✅ Real-time Solana portfolio balance calculation
- ✅ Advanced transaction filtering (wallet groups, tx hash, activity type)
- ✅ Solana address support with case preservation
- ✅ Integration with Jupiter V3 for Solana swaps
- ✅ Comprehensive financial reporting

### 🎨 Frontend (`/frontend`)
**Progressive Web Application with Seeker integration**

- **Technology Stack**: Next.js, React, TypeScript, TailwindCSS
- **Architecture**: PWA-enabled for mobile-first experience
- **Features**:
  - Responsive Solana portfolio dashboard
  - Real-time transaction monitoring
  - Multi-wallet management interface
  - Solana asset visualization
  - Seeker integration for enhanced UX

**Key Features**:
- 📱 Mobile-optimized PWA interface
- 🔄 Real-time Solana data synchronization
- 💼 Multi-wallet portfolio aggregation
- 📊 Interactive charts and analytics
- 🔗 Seamless Solana connectivity

### 🔄 Data On-Chain Ingestor (`/data-onchain-ingestor`)
**Real-time blockchain data processing engine**

- **Technology Stack**: Python 3.12, FastAPI, Temporal.io, SQLAlchemy
- **Data Processing**: Polars, DuckDB, Delta Lake
- **Monitoring**: Redis caching, Sentry error tracking

**Core Functions**:
- 🔍 **Backfill Operations**: Historical transaction data recovery
- 📡 **Real-time Tracking**: Live Solana on-chain event monitoring
- 💾 **Data Storage**: Structured financial transaction storage
- 🔄 **Event Processing**: Temporal workflow orchestration
- 📈 **Performance**: Optimized data pipelines with caching

### 📦 SDK (`/ledgerx-sdk`)
**Developer tools and client libraries**

- **Multi-language Support**: TypeScript & Go SDKs
- **OpenAPI Integration**: Auto-generated from API specification
- **Features**:
  - Type-safe API client generation
  - Comprehensive documentation
  - Easy integration for external developers
  - Cross-platform compatibility

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 14.x
- **Python** >= 3.12
- **PostgreSQL** >= 12
- **Go** >= 1.18 (for Go SDK)
- **Yarn** package manager

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-ledgerx
   ```

2. **Backend Setup**
   ```bash
   cd backend/backend
   yarn install
   
   # Setup environment variables
   cp .env.example .env
   # Configure your PostgreSQL credentials in .env
   
   # Run database migrations
   yarn migrate:up
   
   # Start development server
   yarn start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend/frontend
   yarn install
   
   # Start development server
   npm run dev
   ```

4. **Data Ingestor Setup**
   ```bash
   cd data-onchain-ingestor
   
   # Install dependencies with Poetry
   poetry install
   
   # Run the ingestor
   poetry run python -m data_onchain_ingestor.main
   ```

5. **SDK Generation**
   ```bash
   cd ledgerx-sdk
   
   # Generate TypeScript SDK
   npm run generate:ts
   
   # Generate Go SDK
   npm run generate:go
   ```

---

## 🌟 Key Features

### 💰 Solana Portfolio Management
- **Native Solana Support**: Seamlessly track SPL tokens and SOL across multiple wallets
- **Real-time Balances**: Live portfolio valuation and balance tracking
- **Gain/Loss Analytics**: Comprehensive P&L calculation with historical Solana data

### 🔄 Solana Transaction Processing
- **Advanced Filtering**: Filter by wallet groups, transaction signatures, activity type
- **Real-time Ingestion**: Live Solana blockchain event processing and storage
- **Historical Backfill**: Complete Solana transaction history recovery

### 🛠️ Developer Experience
- **RESTful APIs**: Comprehensive API endpoints with OpenAPI documentation
- **Multi-language SDKs**: TypeScript and Go client libraries
- **Postman Collections**: Pre-built API testing collections

### 🔐 Security & Performance
- **Solana Address Integrity**: Proper case preservation for Solana base58 addresses
- **Optimized Queries**: Efficient database operations with proper indexing
- **Error Handling**: Comprehensive error tracking with Sentry integration

---

## 📊 Data Flow

```
Solana Network → Data Ingestor → PostgreSQL → Backend API → Frontend PWA
       ↓              ↓              ↓           ↓            ↓
   Live Events   Process & Store   Structured   RESTful     User Interface
                                   Data         Endpoints
```

1. **Data Ingestion**: Python ingestor monitors Solana blockchain events in real-time
2. **Data Processing**: Solana transactions are processed and stored as structured financial data
3. **API Layer**: NestJS backend exposes Solana data via REST APIs
4. **User Interface**: Next.js PWA provides intuitive Solana portfolio management
5. **SDK Access**: Developers can integrate via TypeScript/Go SDKs

---

## 🧪 Testing

- **Backend**: Jest unit and integration tests
- **Frontend**: Cypress E2E testing
- **API Testing**: Comprehensive Postman collections available in `/backend/postman-collections/`

---

## 📚 Documentation

- **API Documentation**: Auto-generated OpenAPI specs available
- **SDK Documentation**: Comprehensive guides in `/ledgerx-sdk/`
- **Development Guides**: Component-specific READMEs in each directory

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request

---

## 📄 License

This project is licensed under the terms specified in the repository.

---

## 🎯 Project Goals

LedgerX aims to provide the most comprehensive and developer-friendly platform for Solana portfolio management, combining real-time data processing, powerful analytics, and seamless Solana ecosystem integration in a single, cohesive platform.
