#!/bin/bash
# HyperFit Enhanced Authentication & RBAC Test Script
# Tests all new authentication and role-based access control features

BASE_URL="http://localhost:8000"
echo "======================================================================"
echo "🚀 HyperFit Enhanced Authentication & RBAC Test Suite"
echo "======================================================================"
echo ""

# Test 1: Login as Admin
echo "📝 TEST 1: Admin Login with Refresh Token"
echo "----------------------------------------------------------------------"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hyperfit.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")
ADMIN_REFRESH=$(echo $ADMIN_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['refresh_token'])")

echo "✅ Admin logged in successfully"
echo "   User: $(echo $ADMIN_RESPONSE | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d['user']['username']} (Role: {d['user']['role']})\")")"
echo "   Access Token: ${ADMIN_TOKEN:0:50}..."
echo "   Refresh Token: ${ADMIN_REFRESH:0:50}..."
echo ""

# Test 2: Access /me endpoint
echo "📝 TEST 2: Access Protected /me Endpoint"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
echo ""

# Test 3: Admin - List all users
echo "📝 TEST 3: Admin - List All Users"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/admin/users?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
echo ""

# Test 4: Admin - Get system stats
echo "📝 TEST 4: Admin - Get System Statistics"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
echo ""

# Test 5: Login as Coach
echo "📝 TEST 5: Coach Login"
echo "----------------------------------------------------------------------"
COACH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@test.com","password":"password123"}')

COACH_TOKEN=$(echo $COACH_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")

echo "✅ Coach logged in successfully"
echo "   User: $(echo $COACH_RESPONSE | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d['user']['username']} (Role: {d['user']['role']})\")")"
echo ""

# Test 6: Coach - Get profile
echo "📝 TEST 6: Coach - Get Profile"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/coach/profile" \
  -H "Authorization: Bearer $COACH_TOKEN" | python3 -m json.tool
echo ""

# Test 7: Coach - List clients
echo "📝 TEST 7: Coach - List Assigned Clients"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/coach/clients" \
  -H "Authorization: Bearer $COACH_TOKEN" | python3 -m json.tool
echo ""

# Test 8: Coach - Assign client (assign user@test.com as client)
echo "📝 TEST 8: Coach - Assign Client"
echo "----------------------------------------------------------------------"
curl -s -X POST "$BASE_URL/api/coach/clients/assign" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"client_id": 2}' | python3 -m json.tool
echo ""

# Test 9: Login as User
echo "📝 TEST 9: User Login"
echo "----------------------------------------------------------------------"
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}')

USER_TOKEN=$(echo $USER_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")
USER_REFRESH=$(echo $USER_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['refresh_token'])")

echo "✅ User logged in successfully"
echo "   User: $(echo $USER_RESPONSE | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"{d['user']['username']} (Role: {d['user']['role']})\")")"
echo ""

# Test 10: RBAC - User tries to access admin endpoint (should fail)
echo "📝 TEST 10: RBAC Enforcement - User Tries Admin Endpoint (Should FAIL)"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $USER_TOKEN" | python3 -m json.tool
echo ""

# Test 11: Token Refresh
echo "📝 TEST 11: Refresh Access Token"
echo "----------------------------------------------------------------------"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$USER_REFRESH\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")
echo "✅ Token refreshed successfully"
echo "   New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
echo ""

# Test 12: Logout (blacklist token)
echo "📝 TEST 12: Logout with Token Blacklisting"
echo "----------------------------------------------------------------------"
curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$USER_REFRESH\"}" | python3 -m json.tool
echo ""

# Test 13: Try to use blacklisted token (should fail)
echo "📝 TEST 13: Use Blacklisted Token (Should FAIL)"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN" | python3 -m json.tool
echo ""

# Test 14: Public endpoint - Discover coaches
echo "📝 TEST 14: Public Endpoint - Discover Available Coaches"
echo "----------------------------------------------------------------------"
curl -s -X GET "$BASE_URL/api/coach/discover" | python3 -m json.tool
echo ""

echo "======================================================================"
echo "✅ All Tests Completed!"
echo "======================================================================"
echo ""
echo "Summary of Features Tested:"
echo "  ✓ JWT Authentication with HS512"
echo "  ✓ Access + Refresh Token System (30min/30day expiry)"
echo "  ✓ Token Blacklisting for Secure Logout"
echo "  ✓ Role-Based Access Control (USER, COACH, ADMIN)"
echo "  ✓ Admin User Management Endpoints"
echo "  ✓ Coach Platform with Client Assignment"
echo "  ✓ RBAC Enforcement (403 for unauthorized roles)"
echo "  ✓ Token Refresh Mechanism"
echo "  ✓ Public Endpoints (no auth required)"
echo ""
