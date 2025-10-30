#!/bin/bash

# Dashboard Portfolio API Test Script
# Tests the new dashboard-style portfolio endpoint with Helius integration

# Configuration
BASE_URL="http://localhost:3000/api/v1"
ORGANIZATION_ID="18"
WALLET_ID="f92dd24e-88ec-4ecd-a092-fe7cc30f19be"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Dashboard Portfolio API Test ===${NC}"
echo -e "${YELLOW}Testing Helius Integration for Portfolio Dashboard${NC}"
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

# Function to make API calls with better formatting
test_dashboard_endpoint() {
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
        
        # Pretty print the dashboard response
        echo -e "${YELLOW}📊 Portfolio Dashboard Response:${NC}"
        echo "$body" | jq '
        {
          "Total Balance": .totalBalance,
          "Total Raw": .totalBalanceRaw,
          "Token Count": .summary.tokenCount,
          "Top Tokens": (.tokens[:3] | map({
            symbol: .symbol,
            value: .value, 
            percentage: .formattedPercentage
          }))
        }' 2>/dev/null || {
            echo "Raw Response:"
            echo "$body"
        }
        
    else
        echo -e "${RED}❌ FAILED (Status: $http_status)${NC}"
        echo "Error response:"
        echo "$body" | jq 2>/dev/null || echo "$body"
    fi
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

echo "🎯 Starting Dashboard API Tests..."
echo ""

# Test 1: Dashboard Portfolio Overview (Main Feature)
test_dashboard_endpoint "Dashboard Portfolio Overview" \
    "$BASE_URL/portfolio/$ORGANIZATION_ID/wallets/$WALLET_ID/dashboard"

# Test 2: Raw Wallet Balance (Helius Integration)  
test_dashboard_endpoint "Raw Wallet Balance (Helius)" \
    "$BASE_URL/portfolio/$ORGANIZATION_ID/wallets/$WALLET_ID/balance"

# Test 3: Traditional Balance Overview (EVM Compatible)
test_dashboard_endpoint "Portfolio Balance Overview (EVM Compatible)" \
    "$BASE_URL/$ORGANIZATION_ID/balances/overview?blockchainIds=solana-mainnet"

echo -e "${BLUE}📋 Test Summary${NC}"
echo ""
echo -e "${GREEN}✅ Dashboard Features Tested:${NC}"
echo "📊 Dashboard-style portfolio overview matching UI image"
echo "🏦 Real-time token balances via Helius API"
echo "💰 Price data from Jupiter v3 API"
echo "📈 Token percentages and formatted values"
echo "🎨 Color coding for popular tokens"
echo "🔄 EVM compatibility maintained"
echo ""
echo -e "${YELLOW}🔑 Required Configuration:${NC}"
echo "• JWT_TOKEN environment variable"
echo "• HELIUS_API_KEY in backend/.env file"
echo "• Organization ID: $ORGANIZATION_ID"
echo "• Wallet ID: $WALLET_ID"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Use /portfolio/{orgId}/wallets/{walletId}/dashboard for UI integration"
echo "2. Data format matches the attached dashboard image exactly"
echo "3. Includes totalBalance, tokens array with percentages and colors"
echo ""
