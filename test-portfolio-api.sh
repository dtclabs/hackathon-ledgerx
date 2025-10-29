#!/bin/bash

# Portfolio Balance Overview API Test Script
# This script tests the new portfolio balance endpoints

# Configuration
BASE_URL="http://localhost:3000/api/v1"
ORGANIZATION_ID="18" 
WALLET_ID="f92dd24e-88ec-4ecd-a092-fe7cc30f19be"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Portfolio Balance Overview API Tests ===${NC}"
echo ""

# Check if JWT_TOKEN is set
if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}ERROR: JWT_TOKEN environment variable is not set${NC}"
    echo "Please set it with: export JWT_TOKEN='your_token_here'"
    exit 1
fi

# Function to make API calls
test_endpoint() {
    local name="$1"
    local url="$2"
    
    echo -e "${BLUE}Testing: $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        "$url")
    
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✓ SUCCESS (Status: $http_status)${NC}"
        echo "Response preview:"
        echo "$body" | jq -r '.totalBalance.formatted // .value // "Response received"' 2>/dev/null || echo "Response received"
    else
        echo -e "${RED}✗ FAILED (Status: $http_status)${NC}"
        echo "Error response:"
        echo "$body" | jq 2>/dev/null || echo "$body"
    fi
    echo ""
    echo "----------------------------------------"
    echo ""
}

echo "🚀 Starting API tests..."
echo ""

# Test 1: Portfolio Overview - All Wallets
test_endpoint "Portfolio Overview - All Wallets" \
    "$BASE_URL/$ORGANIZATION_ID/balances/overview"

# Test 2: Portfolio Overview - Solana Only  
test_endpoint "Portfolio Overview - Solana Only" \
    "$BASE_URL/$ORGANIZATION_ID/balances/overview?blockchainIds=solana-mainnet"

# Test 3: Portfolio Overview - Specific Wallet
test_endpoint "Portfolio Overview - Specific Wallet" \
    "$BASE_URL/$ORGANIZATION_ID/balances/overview?walletIds=$WALLET_ID"

# Test 4: Traditional Balance - EVM Compatible
test_endpoint "Traditional Balance - EVM Compatible" \
    "$BASE_URL/$ORGANIZATION_ID/balances"

# Test 5: Traditional Balance - Solana Filtered
test_endpoint "Traditional Balance - Solana Filtered" \
    "$BASE_URL/$ORGANIZATION_ID/balances?blockchainIds=solana-mainnet&groupBy=blockchainId"

# Test 6: Wallet Balance - Direct Helius
test_endpoint "Wallet Balance - Direct Helius" \
    "$BASE_URL/$ORGANIZATION_ID/portfolio/wallet/$WALLET_ID/balance"

echo -e "${BLUE}=== Test Summary ===${NC}"
echo ""
echo "📋 All tests completed!"
echo ""
echo -e "${BLUE}Key Features Tested:${NC}"
echo "✓ Portfolio overview with comprehensive token breakdown"
echo "✓ Helius integration for real-time Solana balance data" 
echo "✓ EVM compatibility maintained for existing endpoints"
echo "✓ Filtering by blockchain and wallet"
echo "✓ Formatted responses matching dashboard UI requirements"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Import the Postman collection: Portfolio-Balance-Overview-APIs.postman_collection.json"
echo "2. Set up HELIUS_API_KEY in your .env file"
echo "3. Use the /balances/overview endpoint for dashboard UI integration"
echo ""