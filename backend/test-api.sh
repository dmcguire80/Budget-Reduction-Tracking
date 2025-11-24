#!/bin/bash
# Budget Tracking API Test Script
# Tests all API endpoints with curl

set -e

BASE_URL="${API_URL:-http://localhost:3001}"
API_BASE="${BASE_URL}/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Storage for test data
TOKEN=""
REFRESH_TOKEN=""
ACCOUNT_ID=""
TRANSACTION_ID=""
SNAPSHOT_ID=""

# Function to print section header
print_header() {
  echo -e "\n${BLUE}============================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}============================================${NC}\n"
}

# Function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="${5:-200}"
  local headers="$6"

  echo -n "Testing: $name... "

  # Build curl command
  local curl_cmd="curl -s -w \"%{http_code}\" -X $method"

  # Add headers
  if [ -n "$headers" ]; then
    curl_cmd="$curl_cmd $headers"
  fi

  # Add authorization header if token exists
  if [ -n "$TOKEN" ]; then
    curl_cmd="$curl_cmd -H \"Authorization: Bearer $TOKEN\""
  fi

  # Add content-type for JSON
  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -H \"Content-Type: application/json\""
    curl_cmd="$curl_cmd -d '$data'"
  fi

  # Add endpoint
  curl_cmd="$curl_cmd -o /tmp/api_response.json \"$endpoint\""

  # Execute curl command
  HTTP_CODE=$(eval $curl_cmd)

  # Check status code
  if [ "$HTTP_CODE" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $HTTP_CODE)"
    ((TESTS_PASSED++))

    # Show response for debugging (optional)
    # cat /tmp/api_response.json | jq '.' 2>/dev/null || cat /tmp/api_response.json

    return 0
  else
    echo -e "${RED}✗ (HTTP $HTTP_CODE, expected $expected_status)${NC}"
    cat /tmp/api_response.json 2>/dev/null || echo ""
    ((TESTS_FAILED++))
    return 1
  fi
}

# Function to extract value from JSON response
extract_json_value() {
  local key="$1"
  cat /tmp/api_response.json | jq -r ".$key" 2>/dev/null || echo ""
}

#############################################
# START TESTING
#############################################

echo -e "${YELLOW}Budget Tracking API Test Suite${NC}"
echo -e "Testing API at: ${BLUE}$BASE_URL${NC}\n"

# Wait for API to be ready
echo -n "Checking if API is available... "
for i in {1..30}; do
  if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗${NC}"
    echo "API is not responding at $BASE_URL"
    exit 1
  fi
  sleep 1
done

#############################################
# 1. HEALTH CHECK
#############################################
print_header "1. Health Check Endpoint"

test_endpoint \
  "GET /health" \
  "GET" \
  "$BASE_URL/health" \
  "" \
  "200"

#############################################
# 2. AUTHENTICATION ENDPOINTS (5)
#############################################
print_header "2. Authentication Endpoints"

# Generate unique email for testing
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="SecurePass123!"

# 2.1 Register new user
test_endpoint \
  "POST /api/auth/register" \
  "POST" \
  "$API_BASE/auth/register" \
  "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Test User\"}" \
  "201"

# 2.2 Login
if test_endpoint \
  "POST /api/auth/login" \
  "POST" \
  "$API_BASE/auth/login" \
  "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  "200"; then

  # Extract tokens
  TOKEN=$(extract_json_value "accessToken")
  REFRESH_TOKEN=$(extract_json_value "refreshToken")

  if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to extract access token${NC}"
  fi
fi

# 2.3 Get current user
test_endpoint \
  "GET /api/auth/me" \
  "GET" \
  "$API_BASE/auth/me" \
  "" \
  "200"

# 2.4 Refresh token
if [ -n "$REFRESH_TOKEN" ]; then
  test_endpoint \
    "POST /api/auth/refresh" \
    "POST" \
    "$API_BASE/auth/refresh" \
    "{\"refreshToken\":\"$REFRESH_TOKEN\"}" \
    "200"
fi

# 2.5 Logout (will be tested at the end)

#############################################
# 3. ACCOUNT ENDPOINTS (6)
#############################################
print_header "3. Account Endpoints"

# 3.1 Get all accounts (should be empty)
test_endpoint \
  "GET /api/accounts" \
  "GET" \
  "$API_BASE/accounts" \
  "" \
  "200"

# 3.2 Create new account
if test_endpoint \
  "POST /api/accounts" \
  "POST" \
  "$API_BASE/accounts" \
  "{\"name\":\"Test Credit Card\",\"type\":\"CREDIT_CARD\",\"originalBalance\":5000.00,\"currentBalance\":5000.00,\"interestRate\":18.99,\"minimumPayment\":125.00}" \
  "201"; then

  # Extract account ID
  ACCOUNT_ID=$(extract_json_value "id")

  if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}Failed to extract account ID${NC}"
  else
    echo -e "  ${BLUE}→ Created account ID: $ACCOUNT_ID${NC}"
  fi
fi

# 3.3 Get account by ID
if [ -n "$ACCOUNT_ID" ]; then
  test_endpoint \
    "GET /api/accounts/:id" \
    "GET" \
    "$API_BASE/accounts/$ACCOUNT_ID" \
    "" \
    "200"
fi

# 3.4 Update account
if [ -n "$ACCOUNT_ID" ]; then
  test_endpoint \
    "PUT /api/accounts/:id" \
    "PUT" \
    "$API_BASE/accounts/$ACCOUNT_ID" \
    "{\"name\":\"Updated Test Credit Card\",\"minimumPayment\":150.00}" \
    "200"
fi

# 3.5 Get account summary
if [ -n "$ACCOUNT_ID" ]; then
  test_endpoint \
    "GET /api/accounts/:id/summary" \
    "GET" \
    "$API_BASE/accounts/$ACCOUNT_ID/summary" \
    "" \
    "200"
fi

# 3.6 Delete account (will be tested at the end)

#############################################
# 4. TRANSACTION ENDPOINTS (5)
#############################################
print_header "4. Transaction Endpoints"

# 4.1 Get all transactions (should be empty)
test_endpoint \
  "GET /api/transactions" \
  "GET" \
  "$API_BASE/transactions" \
  "" \
  "200"

# 4.2 Get account transactions
if [ -n "$ACCOUNT_ID" ]; then
  # Note: This endpoint path may need to be fixed based on routing issues
  # Current path: /api/transactions/accounts/:accountId/transactions
  # Should be: /api/accounts/:accountId/transactions
  test_endpoint \
    "GET /api/accounts/:accountId/transactions" \
    "GET" \
    "$API_BASE/accounts/$ACCOUNT_ID/transactions" \
    "" \
    "200" || true  # May fail due to routing issue
fi

# 4.3 Create transaction
if [ -n "$ACCOUNT_ID" ]; then
  if test_endpoint \
    "POST /api/accounts/:accountId/transactions" \
    "POST" \
    "$API_BASE/accounts/$ACCOUNT_ID/transactions" \
    "{\"type\":\"PAYMENT\",\"amount\":250.00,\"date\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",\"description\":\"Test payment\"}" \
    "201" || true; then  # May fail due to routing issue

    # Extract transaction ID
    TRANSACTION_ID=$(extract_json_value "id")

    if [ -n "$TRANSACTION_ID" ]; then
      echo -e "  ${BLUE}→ Created transaction ID: $TRANSACTION_ID${NC}"
    fi
  fi
fi

# 4.4 Update transaction
if [ -n "$TRANSACTION_ID" ]; then
  test_endpoint \
    "PUT /api/transactions/:id" \
    "PUT" \
    "$API_BASE/transactions/$TRANSACTION_ID" \
    "{\"description\":\"Updated test payment\",\"amount\":275.00}" \
    "200"
fi

# 4.5 Delete transaction (will be tested at the end)

#############################################
# 5. SNAPSHOT ENDPOINTS (4)
#############################################
print_header "5. Snapshot Endpoints"

# 5.1 Get account snapshots
if [ -n "$ACCOUNT_ID" ]; then
  test_endpoint \
    "GET /api/accounts/:accountId/snapshots" \
    "GET" \
    "$API_BASE/accounts/$ACCOUNT_ID/snapshots" \
    "" \
    "200"
fi

# 5.2 Get chart data
if [ -n "$ACCOUNT_ID" ]; then
  test_endpoint \
    "GET /api/accounts/:accountId/snapshots/chart-data" \
    "GET" \
    "$API_BASE/accounts/$ACCOUNT_ID/snapshots/chart-data" \
    "" \
    "200"
fi

# 5.3 Create snapshot
if [ -n "$ACCOUNT_ID" ]; then
  if test_endpoint \
    "POST /api/accounts/:accountId/snapshots" \
    "POST" \
    "$API_BASE/accounts/$ACCOUNT_ID/snapshots" \
    "{\"balance\":4750.00,\"snapshotDate\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}" \
    "201"; then

    # Extract snapshot ID
    SNAPSHOT_ID=$(extract_json_value "id")

    if [ -n "$SNAPSHOT_ID" ]; then
      echo -e "  ${BLUE}→ Created snapshot ID: $SNAPSHOT_ID${NC}"
    fi
  fi
fi

# 5.4 Delete snapshot (will be tested at the end)

#############################################
# 6. ANALYTICS ENDPOINTS (13)
#############################################
print_header "6. Analytics Endpoints"

# 6.1 Get overview
test_endpoint \
  "GET /api/analytics/overview" \
  "GET" \
  "$API_BASE/analytics/overview" \
  "" \
  "200"

# 6.2 Get trends
test_endpoint \
  "GET /api/analytics/trends" \
  "GET" \
  "$API_BASE/analytics/trends?period=month" \
  "" \
  "200"

# 6.3 Get multi-account balance chart
test_endpoint \
  "GET /api/analytics/chart/multi-account-balance" \
  "GET" \
  "$API_BASE/analytics/chart/multi-account-balance" \
  "" \
  "200"

if [ -n "$ACCOUNT_ID" ]; then
  # 6.4 Get account analytics
  test_endpoint \
    "GET /api/analytics/accounts/:id" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID" \
    "" \
    "200"

  # 6.5 Get account projection
  test_endpoint \
    "GET /api/analytics/accounts/:id/projection" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/projection" \
    "" \
    "200"

  # 6.6 Get interest forecast
  test_endpoint \
    "GET /api/analytics/accounts/:id/interest-forecast" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/interest-forecast?months=12" \
    "" \
    "200"

  # 6.7 Get payoff scenarios
  test_endpoint \
    "GET /api/analytics/accounts/:id/payoff-scenarios" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/payoff-scenarios" \
    "" \
    "200"

  # 6.8 Calculate custom projection
  test_endpoint \
    "POST /api/analytics/accounts/:id/calculate-projection" \
    "POST" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/calculate-projection" \
    "{\"monthlyPayment\":300.00}" \
    "200"

  # 6.9 Get required payment
  test_endpoint \
    "POST /api/analytics/accounts/:id/required-payment" \
    "POST" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/required-payment" \
    "{\"targetMonths\":24}" \
    "200"

  # 6.10 Get balance reduction chart
  test_endpoint \
    "GET /api/analytics/accounts/:id/chart/balance-reduction" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/chart/balance-reduction" \
    "" \
    "200"

  # 6.11 Get interest accumulation chart
  test_endpoint \
    "GET /api/analytics/accounts/:id/chart/interest-accumulation" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/chart/interest-accumulation?months=12" \
    "" \
    "200"

  # 6.12 Get payment distribution chart
  test_endpoint \
    "GET /api/analytics/accounts/:id/chart/payment-distribution" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/chart/payment-distribution" \
    "" \
    "200"

  # 6.13 Get projection comparison chart
  test_endpoint \
    "GET /api/analytics/accounts/:id/chart/projection-comparison" \
    "GET" \
    "$API_BASE/analytics/accounts/$ACCOUNT_ID/chart/projection-comparison" \
    "" \
    "200"
fi

#############################################
# 7. CLEANUP & FINAL TESTS
#############################################
print_header "7. Cleanup & Deletion Tests"

# Delete transaction
if [ -n "$TRANSACTION_ID" ]; then
  test_endpoint \
    "DELETE /api/transactions/:id" \
    "DELETE" \
    "$API_BASE/transactions/$TRANSACTION_ID" \
    "" \
    "200"
fi

# Delete snapshot
if [ -n "$SNAPSHOT_ID" ]; then
  test_endpoint \
    "DELETE /api/snapshots/:id" \
    "DELETE" \
    "$API_BASE/snapshots/$SNAPSHOT_ID" \
    "" \
    "200"
fi

# Delete account
if [ -n "$ACCOUNT_ID" ]; then
  test_endpoint \
    "DELETE /api/accounts/:id" \
    "DELETE" \
    "$API_BASE/accounts/$ACCOUNT_ID" \
    "" \
    "200"
fi

# Logout
test_endpoint \
  "POST /api/auth/logout" \
  "POST" \
  "$API_BASE/auth/logout" \
  "" \
  "200"

#############################################
# 8. ERROR HANDLING TESTS
#############################################
print_header "8. Error Handling Tests"

# Test with invalid token
TOKEN="invalid_token"
test_endpoint \
  "GET /api/accounts (invalid token)" \
  "GET" \
  "$API_BASE/accounts" \
  "" \
  "401"

# Test without token
TOKEN=""
test_endpoint \
  "GET /api/accounts (no token)" \
  "GET" \
  "$API_BASE/accounts" \
  "" \
  "401"

# Test invalid login
test_endpoint \
  "POST /api/auth/login (invalid credentials)" \
  "POST" \
  "$API_BASE/auth/login" \
  "{\"email\":\"nonexistent@example.com\",\"password\":\"wrongpassword\"}" \
  "401"

# Test validation error
test_endpoint \
  "POST /api/auth/register (validation error)" \
  "POST" \
  "$API_BASE/auth/register" \
  "{\"email\":\"invalid-email\",\"password\":\"weak\"}" \
  "400"

# Test 404
test_endpoint \
  "GET /api/nonexistent" \
  "GET" \
  "$API_BASE/nonexistent" \
  "" \
  "404"

#############################################
# SUMMARY
#############################################
print_header "Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed!${NC}\n"
  exit 1
fi
