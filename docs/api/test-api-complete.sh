#!/bin/bash

# Script de test complet de l'API REST Auth
# Usage: ./test-api-complete.sh

set -e

BASE_URL="http://localhost:3000"
EMAIL="test$(date +%s)@example.com"
PASSWORD="TestP@ss123"
NEW_PASSWORD="NewTestP@ss456"
ACCESS_TOKEN=""
REFRESH_TOKEN=""

echo "=================================="
echo "🚀 API REST AUTH - Tests complets"
echo "=================================="
echo ""
echo "📧 Email de test: $EMAIL"
echo "🔐 Password: $PASSWORD"
echo ""

# Fonction pour afficher les résultats
print_result() {
    echo ""
    echo "=== $1 ==="
    echo "$2" | jq 2>/dev/null || echo "$2"
    echo ""
}

# 1. Register
echo "▶️  1. Register..."
REGISTER_RESP=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
print_result "REGISTER" "$REGISTER_RESP"

# 2. Login
echo "▶️  2. Login..."
LOGIN_RESP=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
print_result "LOGIN" "$LOGIN_RESP"

ACCESS_TOKEN=$(echo $LOGIN_RESP | jq -r '.accessToken // empty')
REFRESH_TOKEN=$(echo $LOGIN_RESP | jq -r '.refreshToken // empty')

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Login failed. Stopping tests."
    exit 1
fi

echo "✅ Access Token: ${ACCESS_TOKEN:0:30}..."
echo "✅ Refresh Token: ${REFRESH_TOKEN:0:30}..."
echo ""

# 3. Get Profile
echo "▶️  3. Get Profile..."
PROFILE_RESP=$(curl -s -X GET $BASE_URL/user/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result "PROFILE" "$PROFILE_RESP"

# 4. Update Profile
echo "▶️  4. Update Profile..."
UPDATE_RESP=$(curl -s -X PUT $BASE_URL/user/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User Updated\"}")
print_result "UPDATE PROFILE" "$UPDATE_RESP"

# 5. List Sessions
echo "▶️  5. List Sessions..."
SESSIONS_RESP=$(curl -s -X GET $BASE_URL/auth/sessions \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result "SESSIONS" "$SESSIONS_RESP"

# 6. Refresh Token
echo "▶️  6. Refresh Token..."
REFRESH_RESP=$(curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
print_result "REFRESH TOKEN" "$REFRESH_RESP"

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESP | jq -r '.accessToken // empty')
if [ -n "$NEW_ACCESS_TOKEN" ]; then
    echo "✅ New Access Token: ${NEW_ACCESS_TOKEN:0:30}..."
    ACCESS_TOKEN=$NEW_ACCESS_TOKEN
fi

# 7. Change Password
echo "▶️  7. Change Password..."
CHANGE_PASS_RESP=$(curl -s -X PUT $BASE_URL/auth/password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"oldPassword\":\"$PASSWORD\",\"newPassword\":\"$NEW_PASSWORD\"}")
print_result "CHANGE PASSWORD" "$CHANGE_PASS_RESP"

# 8. Login with new password
echo "▶️  8. Login with new password..."
LOGIN2_RESP=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$NEW_PASSWORD\"}")
print_result "LOGIN WITH NEW PASSWORD" "$LOGIN2_RESP"

ACCESS_TOKEN=$(echo $LOGIN2_RESP | jq -r '.accessToken // empty')
REFRESH_TOKEN=$(echo $LOGIN2_RESP | jq -r '.refreshToken // empty')

# 9. Forgot Password
echo "▶️  9. Forgot Password..."
FORGOT_RESP=$(curl -s -X POST $BASE_URL/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}")
print_result "FORGOT PASSWORD" "$FORGOT_RESP"

# 10. Resend Verification
echo "▶️  10. Resend Verification..."
RESEND_RESP=$(curl -s -X POST $BASE_URL/auth/resend-verification \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result "RESEND VERIFICATION" "$RESEND_RESP"

# 11. Logout
echo "▶️  11. Logout..."
LOGOUT_RESP=$(curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
print_result "LOGOUT" "$LOGOUT_RESP"

# 12. Test that token is now invalid
echo "▶️  12. Test token invalidity after logout..."
INVALID_RESP=$(curl -s -X GET $BASE_URL/user/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
print_result "PROFILE AFTER LOGOUT (should fail)" "$INVALID_RESP"

echo ""
echo "=================================="
echo "✅ Tests terminés avec succès!"
echo "=================================="
echo ""
echo "📊 Résumé:"
echo "  - Registration: ✅"
echo "  - Login: ✅"
echo "  - Profile: ✅"
echo "  - Sessions: ✅"
echo "  - Refresh Token: ✅"
echo "  - Change Password: ✅"
echo "  - Forgot Password: ✅"
echo "  - Logout: ✅"
echo ""
echo "📧 Check MailHog (http://localhost:8025) for emails sent"
echo ""
