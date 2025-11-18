#!/bin/bash

# SalonMind API Quick Test Script
# Run this to test all built APIs

BASE_URL="http://localhost:5000"
TOKEN=""
SALON_ID=""

echo "🧪 SalonMind API Testing Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
RESPONSE=$(curl -s $BASE_URL/health)
if echo $RESPONSE | grep -q "Server is running"; then
    echo -e "${GREEN}✅ Health Check PASSED${NC}"
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}❌ Health Check FAILED${NC}"
    exit 1
fi
echo ""

# Test 2: Register User
echo "2️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser'$(date +%s)'@salonmind.com",
    "password": "Test@12345",
    "phoneNumber": "+91987654'$(date +%s | tail -c 5)'",
    "firstName": "Test",
    "lastName": "User"
  }')

if echo $REGISTER_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Registration PASSED${NC}"
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Registration FAILED${NC}"
    echo "   Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 3: Get Current User
if [ ! -z "$TOKEN" ]; then
    echo "3️⃣  Testing Get Current User (Protected)..."
    ME_RESPONSE=$(curl -s $BASE_URL/api/auth/me \
      -H "Authorization: Bearer $TOKEN")
    
    if echo $ME_RESPONSE | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Get Current User PASSED${NC}"
        echo "   User: $(echo $ME_RESPONSE | grep -o '"email":"[^"]*' | sed 's/"email":"//')"
    else
        echo -e "${RED}❌ Get Current User FAILED${NC}"
        echo "   Response: $ME_RESPONSE"
    fi
    echo ""
fi

# Test 4: Send OTP
echo "4️⃣  Testing Send OTP..."
OTP_PHONE="+919876543210"
SEND_OTP_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$OTP_PHONE\"}")

if echo $SEND_OTP_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Send OTP PASSED${NC}"
    OTP=$(echo $SEND_OTP_RESPONSE | grep -o '"otp":"[^"]*' | sed 's/"otp":"//')
    echo "   OTP Code: $OTP"
else
    echo -e "${RED}❌ Send OTP FAILED${NC}"
    echo "   Response: $SEND_OTP_RESPONSE"
fi
echo ""

# Test 5: Verify OTP
if [ ! -z "$OTP" ]; then
    echo "5️⃣  Testing Verify OTP..."
    VERIFY_OTP_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/verify-otp \
      -H "Content-Type: application/json" \
      -d "{\"phoneNumber\": \"$OTP_PHONE\", \"otp\": \"$OTP\"}")
    
    if echo $VERIFY_OTP_RESPONSE | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Verify OTP PASSED${NC}"
        OTP_TOKEN=$(echo $VERIFY_OTP_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
        echo "   New Token: ${OTP_TOKEN:0:50}..."
    else
        echo -e "${RED}❌ Verify OTP FAILED${NC}"
        echo "   Response: $VERIFY_OTP_RESPONSE"
    fi
    echo ""
fi

# Test 6: Complete Onboarding
if [ ! -z "$TOKEN" ]; then
    echo "6️⃣  Testing Complete Onboarding..."
    ONBOARDING_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/complete-onboarding \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "firstName": "Test",
        "lastName": "Owner",
        "email": "owner'$(date +%s)'@salonmind.com",
        "salonName": "Test Salon '$(date +%s)'",
        "salonAddress": "123 Test Street",
        "salonCity": "Mumbai",
        "salonState": "Maharashtra",
        "salonZipCode": "400001",
        "salonCountry": "India",
        "salonPhoneNumber": "+919876543210",
        "salonEmail": "test'$(date +%s)'@salon.com",
        "currency": "INR",
        "timezone": "Asia/Kolkata"
      }')
    
    if echo $ONBOARDING_RESPONSE | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Complete Onboarding PASSED${NC}"
        SALON_ID=$(echo $ONBOARDING_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)
        echo "   Salon Created: $SALON_ID"
    else
        echo -e "${RED}❌ Complete Onboarding FAILED${NC}"
        echo "   Response: $ONBOARDING_RESPONSE"
    fi
    echo ""
fi

# Test 7: Get All Salons
if [ ! -z "$TOKEN" ]; then
    echo "7️⃣  Testing Get All Salons..."
    SALONS_RESPONSE=$(curl -s $BASE_URL/api/salons \
      -H "Authorization: Bearer $TOKEN")
    
    if echo $SALONS_RESPONSE | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Get All Salons PASSED${NC}"
        COUNT=$(echo $SALONS_RESPONSE | grep -o '"count":[0-9]*' | sed 's/"count"://')
        echo "   Total Salons: $COUNT"
    else
        echo -e "${RED}❌ Get All Salons FAILED${NC}"
        echo "   Response: $SALONS_RESPONSE"
    fi
    echo ""
fi

# Test 8: Update Profile
if [ ! -z "$TOKEN" ]; then
    echo "8️⃣  Testing Update Profile..."
    UPDATE_RESPONSE=$(curl -s -X PATCH $BASE_URL/api/auth/update-profile \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "firstName": "Updated",
        "lastName": "Name"
      }')
    
    if echo $UPDATE_RESPONSE | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Update Profile PASSED${NC}"
    else
        echo -e "${RED}❌ Update Profile FAILED${NC}"
        echo "   Response: $UPDATE_RESPONSE"
    fi
    echo ""
fi

# Summary
echo "================================"
echo "✨ Test Summary"
echo "================================"
echo -e "${GREEN}Backend is running and responding!${NC}"
echo ""
echo "📊 APIs Tested: 8"
echo "🔑 Auth APIs: 6"
echo "🏢 Salon APIs: 2"
echo ""
echo -e "${YELLOW}💡 Tip: Use Postman or Thunder Client for detailed testing${NC}"
echo ""
echo "📖 Full API documentation: API_TESTS.md"
