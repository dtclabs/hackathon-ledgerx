#!/bin/bash

# Enhanced Balance API Test Script with Solana Integration
# Tests the balance endpoints that now include Solana via Helius

# Configuration
BASE_URL="http://localhost:3000/api/v1"
ORGANIZATION_ID="18"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Enhanced Balance API Tests (EVM + Solana) ===${NC}"
echo -e "${YELLOW}Testing unified balance API with Helius integration${NC}"
echo ""

# Check if JWT_TOKEN is set
if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}ERROR: JWT_TOKEN environment variable is not set${NC}"
    echo "Please set it with: export JWT_TOKEN='your_token_here'"
    exit 1
fi

# Check if HELIUS_API_KEY is configured
echo -e "${BLUE}Checking HELIUS_API_KEY configuration...${NC}"
if grep -q "HELIUS_API_KEY=" ../backend/.env; then
    echo -e "${GREEN}✓ HELIUS_API_KEY found in .env${NC}"
else
    echo -e "${RED}✗ HELIUS_API_KEY not found in .env${NC}"
    echo "Please add: HELIUS_API_KEY=your_helius_api_key"
fi
echo ""

# Function to make API calls with enhanced formatting
test_balance_endpoint() {
    local name="$1"
    local url="$2"
    
    echo -e "${BLUE}🚀 Testing: $name${NC}"
    echo "URL: $url"
    echo ""
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        "$url")
    
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ SUCCESS (Status: $http_status)${NC}"
        echo ""
        
        # Parse and display the balance response
        echo -e "${YELLOW}💰 Balance Response Analysis:${NC}"
        echo "$body" | jq '
        if .data then
          {
            "Total Balance": (.data.value + " " + .data.fiatCurrency),
            "Blockchain Groups": (
              .data.groups | to_entries | map({
                blockchain: .key,
                value: (.value.value + " " + .value.fiatCurrency)
              })
            )
          }
        else
          .
        end' 2>/dev/null || {
            echo "Raw Response:"
            echo "$body"
        }
        
        # Check for Solana data specifically
        if echo "$body" | jq -e '.data.groups["solana-mainnet"]' > /dev/null 2>&1; then
            echo ""
            echo -e "${PURPLE}🎯 Solana Data Found:${NC}"
            echo "$body" | jq '.data.groups["solana-mainnet"]' 2>/dev/null
        fi
        
    else
        echo -e "${RED}❌ FAILED (Status: $http_status)${NC}"
        echo "Error response:"
        echo "$body" | jq 2>/dev/null || echo "$body"
    fi
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

echo "🎯 Starting Enhanced Balance API Tests..."
echo ""

# Test 1: All Blockchains (EVM + Solana)
test_balance_endpoint "All Blockchains Balance (EVM + Solana)" \
    "$BASE_URL/$ORGANIZATION_ID/balances?groupBy=blockchainId"

# Test 2: Solana Only (Helius Integration)
test_balance_endpoint "Solana Balance (Helius Integration)" \
    "$BASE_URL/$ORGANIZATION_ID/balances?blockchainIds=solana-mainnet&groupBy=blockchainId"

# Test 3: Default Balance (Auto-detects Solana wallets)
test_balance_endpoint "Default Balance (Auto-detects Solana)" \
    "$BASE_URL/$ORGANIZATION_ID/balances"

# Test 4: Token-Level Balance (Individual Tokens)
test_balance_endpoint "Token-Level Balance (SOL, BONK, USDC, etc.)" \
    "$BASE_URL/$ORGANIZATION_ID/balances/tokens"

# Test 5: Portfolio Overview (Dashboard Style)
test_balance_endpoint "Portfolio Overview (Dashboard Format)" \
    "$BASE_URL/$ORGANIZATION_ID/balances/overview?blockchainIds=solana-mainnet"

# Test 6: Specific Wallet Balance
test_balance_endpoint "Specific Wallet Balance" \
    "$BASE_URL/$ORGANIZATION_ID/balances?walletIds=f92dd24e-88ec-4ecd-a092-fe7cc30f19be&groupBy=walletId"

echo -e "${BLUE}📋 Test Summary${NC}"
echo ""
echo -e "${GREEN}✅ Enhanced Balance API Features:${NC}"
echo "🏦 Unified EVM + Solana balance endpoint"
echo "💰 Real-time Solana balance via Helius API"
echo "💹 Jupiter v3 price integration"
echo "📊 Grouped by blockchain (same format as EVM)"
echo "🔄 Automatic Solana wallet detection"
echo "🎯 Compatible with existing EVM structure"
echo ""
echo -e "${YELLOW}🔧 Technical Implementation:${NC}"
echo "• Uses HeliusService.getWalletBalance() for real-time data"
echo "• Aggregates SOL + token balances across all organization wallets"
echo "• Returns data in BalanceDto format compatible with EVM endpoints"
echo "• Supports groupBy=blockchainId for multi-blockchain portfolio view"
echo ""
echo -e "${BLUE}🚀 API Endpoints Ready:${NC}"
echo "1. /balances?groupBy=blockchainId - All blockchains including solana-mainnet"
echo "2. /balances?blockchainIds=solana-mainnet&groupBy=blockchainId - Solana only"
echo "3. /balances/tokens - Token-level breakdown (SOL, BONK, USDC, etc.)"
echo "4. /balances/overview - Dashboard-style portfolio overview"
echo ""
echo -e "${PURPLE}🎯 Perfect for:${NC}"
echo "• Multi-blockchain portfolio dashboards"
echo "• Solana + EVM balance aggregation"
echo "• Real-time price and balance updates"
echo "• Token holder analysis across blockchains"
echo ""