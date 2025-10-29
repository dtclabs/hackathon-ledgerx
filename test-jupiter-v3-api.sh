#!/bin/bash

# Jupiter v3 Price API Test Script
# Tests the Jupiter v3 price API with your example tokens

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Jupiter v3 Price API Test ===${NC}"
echo ""

# Test the exact API you provided
JUPITER_URL="https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112,JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"

echo -e "${YELLOW}Testing Jupiter v3 API:${NC}"
echo "URL: $JUPITER_URL"
echo ""

# Make the API call
echo -e "${BLUE}Making API request...${NC}"
response=$(curl -s "$JUPITER_URL")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ API call successful${NC}"
    echo ""
    echo -e "${BLUE}Raw Response:${NC}"
    echo "$response"
    echo ""
    
    # Parse and display prices nicely
    echo -e "${BLUE}Parsed Prices:${NC}"
    
    # Extract SOL price
    sol_price=$(echo "$response" | jq -r '.["So11111111111111111111111111111111111111112"].usdPrice // "N/A"')
    sol_change=$(echo "$response" | jq -r '.["So11111111111111111111111111111111111111112"].priceChange24h // "N/A"')
    
    # Extract JUP price  
    jup_price=$(echo "$response" | jq -r '.["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"].usdPrice // "N/A"')
    jup_change=$(echo "$response" | jq -r '.["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"].priceChange24h // "N/A"')
    
    echo -e "${GREEN}🟢 SOL Price: \$${sol_price} (24h: ${sol_change}%)${NC}"
    echo -e "${GREEN}🔵 JUP Price: \$${jup_price} (24h: ${jup_change}%)${NC}"
    echo ""
    
    # Validate response structure
    echo -e "${BLUE}Response Structure Validation:${NC}"
    
    # Check if SOL data exists
    if echo "$response" | jq -e '.["So11111111111111111111111111111111111111112"]' > /dev/null; then
        echo -e "${GREEN}✓ SOL data found${NC}"
        echo "$response" | jq '.["So11111111111111111111111111111111111111112"]'
    else
        echo -e "${RED}✗ SOL data missing${NC}"
    fi
    echo ""
    
    # Check if JUP data exists
    if echo "$response" | jq -e '.["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"]' > /dev/null; then
        echo -e "${GREEN}✓ JUP data found${NC}"
        echo "$response" | jq '.["JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"]'
    else
        echo -e "${RED}✗ JUP data missing${NC}"
    fi
    
else
    echo -e "${RED}✗ API call failed${NC}"
    echo "Error: Unable to reach Jupiter API"
fi

echo ""
echo -e "${BLUE}=== Test Summary ===${NC}"
echo ""
echo -e "${YELLOW}API Integration Notes:${NC}"
echo "• ✅ Using Jupiter v3 API (lite-api.jup.ag/price/v3)"
echo "• ✅ Response format: Direct object with mint addresses as keys"
echo "• ✅ Price field: usdPrice (not 'price')"
echo "• ✅ Additional fields: priceChange24h, decimals, blockId"
echo "• ✅ No nested 'data' object in v3 response"
echo ""
echo -e "${YELLOW}Known Token Mints:${NC}"
echo "• SOL: So11111111111111111111111111111111111111112"
echo "• JUP: JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"
echo "• USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
echo "• BONK: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
echo ""