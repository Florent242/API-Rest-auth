#!/bin/bash

# =============================================================================
# SCRIPT DE TEST COMPLET DE L'API - TOUS LES ENDPOINTS
# =============================================================================

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables globales
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_EMAIL="test$(date +%s)@example.com"
USER_PASSWORD="Test@1234567890"
RESET_TOKEN=""
VERIFICATION_TOKEN=""

echo "=================================================="
echo "🚀 TEST COMPLET DE L'API REST - AUTHENTIFICATION"
echo "=================================================="
echo ""

# =============================================================================
# 1. INSCRIPTION (RICHARD)
# =============================================================================
echo -e "${YELLOW}📝 1. TEST INSCRIPTION${NC}"
echo "---------------------------------------------------"

REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"${USER_EMAIL}\",
    \"password\": \"${USER_PASSWORD}\"
  }")

echo "Request: POST /api/users/register"
echo "Body: {name: 'Test User', email: '${USER_EMAIL}', password: '${USER_PASSWORD}'}"
echo "Response: ${REGISTER_RESPONSE}"

if echo "$REGISTER_RESPONSE" | grep -q "utilisateur créé"; then
    echo -e "${GREEN}✅ Inscription réussie${NC}"
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    echo "Access Token: ${ACCESS_TOKEN:0:50}..."
    echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Échec inscription${NC}"
fi
echo ""

# =============================================================================
# 2. CONNEXION (RICHARD)
# =============================================================================
echo -e "${YELLOW}🔐 2. TEST CONNEXION${NC}"
echo "---------------------------------------------------"

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${USER_EMAIL}\",
    \"password\": \"${USER_PASSWORD}\"
  }")

echo "Request: POST /api/users/login"
echo "Response: ${LOGIN_RESPONSE}"

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Connexion réussie${NC}"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Échec connexion${NC}"
fi
echo ""

# =============================================================================
# 3. PROFIL UTILISATEUR (THIERRY)
# =============================================================================
echo -e "${YELLOW}👤 3. TEST RÉCUPÉRATION PROFIL${NC}"
echo "---------------------------------------------------"

PROFILE_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/user/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Request: GET /api/user/profile"
echo "Response: ${PROFILE_RESPONSE}"

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✅ Récupération profil réussie${NC}"
else
    echo -e "${RED}❌ Échec récupération profil${NC}"
fi
echo ""

# =============================================================================
# 4. MODIFICATION PROFIL (THIERRY)
# =============================================================================
echo -e "${YELLOW}✏️ 4. TEST MODIFICATION PROFIL${NC}"
echo "---------------------------------------------------"

UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/user/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User Updated\"
  }")

echo "Request: PUT /api/user/profile"
echo "Response: ${UPDATE_PROFILE_RESPONSE}"

if echo "$UPDATE_PROFILE_RESPONSE" | grep -q "Updated"; then
    echo -e "${GREEN}✅ Modification profil réussie${NC}"
else
    echo -e "${RED}❌ Échec modification profil${NC}"
fi
echo ""

# =============================================================================
# 5. GESTION SESSIONS (JEAN-PAUL)
# =============================================================================
echo -e "${YELLOW}📋 5. TEST LISTE DES SESSIONS${NC}"
echo "---------------------------------------------------"

SESSIONS_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/auth/sessions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Request: GET /api/auth/sessions"
echo "Response: ${SESSIONS_RESPONSE}"

if echo "$SESSIONS_RESPONSE" | grep -q "sessions"; then
    echo -e "${GREEN}✅ Liste sessions récupérée${NC}"
else
    echo -e "${RED}❌ Échec liste sessions${NC}"
fi
echo ""

# =============================================================================
# 6. REFRESH TOKEN (JEAN-PAUL)
# =============================================================================
echo -e "${YELLOW}🔄 6. TEST REFRESH TOKEN${NC}"
echo "---------------------------------------------------"

REFRESH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

echo "Request: POST /api/auth/refresh"
echo "Response: ${REFRESH_RESPONSE}"

if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ Refresh token réussi${NC}"
    ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Échec refresh token${NC}"
fi
echo ""

# =============================================================================
# 7. FORGOT PASSWORD (ANGE)
# =============================================================================
echo -e "${YELLOW}📧 7. TEST FORGOT PASSWORD${NC}"
echo "---------------------------------------------------"

FORGOT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${USER_EMAIL}\"
  }")

echo "Request: POST /api/auth/forgot-password"
echo "Response: ${FORGOT_RESPONSE}"

if echo "$FORGOT_RESPONSE" | grep -q "envoyé"; then
    echo -e "${GREEN}✅ Email de reset envoyé${NC}"
else
    echo -e "${RED}❌ Échec forgot password${NC}"
fi
echo ""

# =============================================================================
# 8. VERIFY EMAIL (ANGE)
# =============================================================================
echo -e "${YELLOW}✉️ 8. TEST RESEND VERIFICATION EMAIL${NC}"
echo "---------------------------------------------------"

RESEND_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/resend-verification" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Request: POST /api/auth/resend-verification"
echo "Response: ${RESEND_RESPONSE}"

if echo "$RESEND_RESPONSE" | grep -q "envoyé"; then
    echo -e "${GREEN}✅ Email de vérification renvoyé${NC}"
else
    echo -e "${RED}❌ Échec resend verification${NC}"
fi
echo ""

# =============================================================================
# 9. CHANGEMENT PASSWORD (RICHARD)
# =============================================================================
echo -e "${YELLOW}🔑 9. TEST CHANGEMENT PASSWORD${NC}"
echo "---------------------------------------------------"

CHANGE_PASSWORD_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/auth/change-password" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentPassword\": \"${USER_PASSWORD}\",
    \"newPassword\": \"NewTest@1234567890\"
  }")

echo "Request: PUT /api/auth/change-password"
echo "Response: ${CHANGE_PASSWORD_RESPONSE}"

if echo "$CHANGE_PASSWORD_RESPONSE" | grep -q "modifié"; then
    echo -e "${GREEN}✅ Changement password réussi${NC}"
    USER_PASSWORD="NewTest@1234567890"
else
    echo -e "${RED}❌ Échec changement password${NC}"
fi
echo ""

# =============================================================================
# 10. 2FA SETUP (THIERRY)
# =============================================================================
echo -e "${YELLOW}🔐 10. TEST 2FA SETUP${NC}"
echo "---------------------------------------------------"

TWOFA_SETUP_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/2fa/setup" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Request: POST /api/auth/2fa/setup"
echo "Response: ${TWOFA_SETUP_RESPONSE}"

if echo "$TWOFA_SETUP_RESPONSE" | grep -q "secret"; then
    echo -e "${GREEN}✅ 2FA setup réussi${NC}"
else
    echo -e "${RED}❌ Échec 2FA setup${NC}"
fi
echo ""

# =============================================================================
# 11. RÉVOCATION SESSION (JEAN-PAUL)
# =============================================================================
echo -e "${YELLOW}🚫 11. TEST RÉVOCATION AUTRES SESSIONS${NC}"
echo "---------------------------------------------------"

REVOKE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/api/auth/sessions/others" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Request: DELETE /api/auth/sessions/others"
echo "Response: ${REVOKE_RESPONSE}"

if echo "$REVOKE_RESPONSE" | grep -q "révoquées"; then
    echo -e "${GREEN}✅ Révocation sessions réussie${NC}"
else
    echo -e "${RED}❌ Échec révocation sessions${NC}"
fi
echo ""

# =============================================================================
# 12. EXPORT DONNÉES (THIERRY - RGPD)
# =============================================================================
echo -e "${YELLOW}📦 12. TEST EXPORT DONNÉES${NC}"
echo "---------------------------------------------------"

EXPORT_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/user/export" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Request: GET /api/user/export"
echo "Response: ${EXPORT_RESPONSE}"

if echo "$EXPORT_RESPONSE" | grep -q "email"; then
    echo -e "${GREEN}✅ Export données réussi${NC}"
else
    echo -e "${RED}❌ Échec export données${NC}"
fi
echo ""

# =============================================================================
# 13. HEALTH CHECK (FLORENT)
# =============================================================================
echo -e "${YELLOW}💚 13. TEST HEALTH CHECK${NC}"
echo "---------------------------------------------------"

HEALTH_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/health")

echo "Request: GET /api/health"
echo "Response: ${HEALTH_RESPONSE}"

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check OK${NC}"
else
    echo -e "${RED}❌ Échec health check${NC}"
fi
echo ""

# =============================================================================
# 14. SWAGGER DOCS (FLORENT)
# =============================================================================
echo -e "${YELLOW}📚 14. TEST SWAGGER DOCS${NC}"
echo "---------------------------------------------------"

SWAGGER_RESPONSE=$(curl -s -X GET "${BASE_URL}/api-docs/")

echo "Request: GET /api-docs/"

if echo "$SWAGGER_RESPONSE" | grep -q "swagger"; then
    echo -e "${GREEN}✅ Swagger accessible${NC}"
else
    echo -e "${RED}❌ Échec Swagger${NC}"
fi
echo ""

# =============================================================================
# 15. DÉCONNEXION (RICHARD)
# =============================================================================
echo -e "${YELLOW}🚪 15. TEST DÉCONNEXION${NC}"
echo "---------------------------------------------------"

LOGOUT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/logout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Request: POST /api/auth/logout"
echo "Response: ${LOGOUT_RESPONSE}"

if echo "$LOGOUT_RESPONSE" | grep -q "déconnecté"; then
    echo -e "${GREEN}✅ Déconnexion réussie${NC}"
else
    echo -e "${RED}❌ Échec déconnexion${NC}"
fi
echo ""

# =============================================================================
# 16. TEST ACCÈS NON AUTORISÉ (FLORENT - SÉCURITÉ)
# =============================================================================
echo -e "${YELLOW}🛡️ 16. TEST ACCÈS NON AUTORISÉ${NC}"
echo "---------------------------------------------------"

UNAUTHORIZED_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/user/profile")

echo "Request: GET /api/user/profile (sans token)"
echo "Response: ${UNAUTHORIZED_RESPONSE}"

if echo "$UNAUTHORIZED_RESPONSE" | grep -q "Unauthorized\|Token\|401"; then
    echo -e "${GREEN}✅ Protection authentification OK${NC}"
else
    echo -e "${RED}❌ Faille de sécurité détectée${NC}"
fi
echo ""

# =============================================================================
# RÉSUMÉ FINAL
# =============================================================================
echo "=================================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=================================================="
echo ""
echo "Tests exécutés: 16"
echo "✅ Endpoints testés:"
echo "   - Inscription (Richard)"
echo "   - Connexion (Richard)"
echo "   - Déconnexion (Richard)"
echo "   - Profil utilisateur (Thierry)"
echo "   - Sessions actives (Jean-Paul)"
echo "   - Refresh token (Jean-Paul)"
echo "   - Forgot password (Ange)"
echo "   - Verify email (Ange)"
echo "   - Changement password (Richard)"
echo "   - 2FA Setup (Thierry)"
echo "   - Export données (Thierry)"
echo "   - Health check (Florent)"
echo "   - Swagger docs (Florent)"
echo "   - Sécurité (Florent)"
echo ""
echo "=================================================="
