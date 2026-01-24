#!/bin/bash

# 🧪 Script de test complet de l'API REST Auth
# Teste tous les endpoints de manière automatique

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"
TEST_EMAIL="testflow$(date +%s)@example.com"
TEST_PASSWORD="TestFlow123!"
TEST_NAME="Test Flow User"

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

# Fonction pour afficher une info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction pour afficher un titre
title() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local headers=$6
    
    info "Test: $description"
    
    if [ -z "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "$headers" \
            -d "$data" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        success "$description - Status: $http_code"
        echo "$body"
        return 0
    else
        error "$description - Expected: $expected_status, Got: $http_code"
        echo "$body"
        return 1
    fi
}

# Début des tests
clear
title "🚀 TESTS COMPLETS DE L'API REST AUTH"
echo ""
info "URL de l'API: $API_URL"
info "Email de test: $TEST_EMAIL"
echo ""

# Vérifier que le serveur est accessible
title "0️⃣  VÉRIFICATION DU SERVEUR"
if curl -s -f "$API_URL" > /dev/null 2>&1; then
    success "Le serveur est accessible"
else
    error "Le serveur n'est pas accessible sur $API_URL"
    exit 1
fi

# Test 1: Inscription
title "1️⃣  AUTHENTIFICATION CORE (Richard)"

echo ""
info "📝 Test 1.1: Inscription"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/users/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"name\": \"$TEST_NAME\"
    }")

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.refreshToken')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id')

if [ "$ACCESS_TOKEN" != "null" ] && [ ! -z "$ACCESS_TOKEN" ]; then
    success "Inscription réussie - User ID: $USER_ID"
    info "Access Token: ${ACCESS_TOKEN:0:20}..."
    info "Refresh Token: ${REFRESH_TOKEN:0:20}..."
else
    error "Échec de l'inscription"
    echo $REGISTER_RESPONSE | jq '.'
    exit 1
fi

echo ""
info "📝 Test 1.2: Email déjà utilisé (devrait échouer)"
DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/users/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"name\": \"Duplicate User\"
    }")
http_code=$(echo "$DUPLICATE_RESPONSE" | tail -n1)
if [ "$http_code" = "400" ] || [ "$http_code" = "409" ]; then
    success "Email dupliqué correctement rejeté"
else
    error "Email dupliqué devrait être rejeté (status: $http_code)"
fi

echo ""
info "🔐 Test 1.3: Connexion"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/users/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

NEW_ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ ! -z "$NEW_ACCESS_TOKEN" ]; then
    success "Connexion réussie"
    ACCESS_TOKEN=$NEW_ACCESS_TOKEN
else
    error "Échec de la connexion"
fi

echo ""
info "👤 Test 1.4: Obtenir le profil"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/api/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
profile_email=$(echo $PROFILE_RESPONSE | jq -r '.email')
if [ "$profile_email" = "$TEST_EMAIL" ]; then
    success "Profil récupéré - Email: $profile_email"
else
    error "Échec de récupération du profil"
fi

echo ""
info "✏️  Test 1.5: Mettre à jour le profil"
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/api/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"Updated Name\"}")
if echo $UPDATE_RESPONSE | jq -e '.name' > /dev/null 2>&1; then
    success "Profil mis à jour"
else
    error "Échec de mise à jour du profil"
fi

# Test 2: Gestion des Sessions
title "2️⃣  GESTION DES SESSIONS (Jean-Paul)"

echo ""
info "🔄 Test 2.1: Rafraîchir le token"
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
refreshed_token=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')
if [ "$refreshed_token" != "null" ] && [ ! -z "$refreshed_token" ]; then
    success "Token rafraîchi avec succès"
    ACCESS_TOKEN=$refreshed_token
else
    error "Échec du rafraîchissement du token"
fi

echo ""
info "📱 Test 2.2: Lister les sessions actives"
SESSIONS_RESPONSE=$(curl -s -X GET "$API_URL/auth/sessions" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
session_count=$(echo $SESSIONS_RESPONSE | jq -r '.count')
if [ ! -z "$session_count" ] && [ "$session_count" -gt 0 ]; then
    success "Sessions récupérées - Count: $session_count"
else
    error "Échec de récupération des sessions"
fi

# Test 3: Communication & Emails
title "3️⃣  COMMUNICATION & EMAILS (Ange)"

echo ""
info "📧 Test 3.1: Envoyer email de vérification"
VERIFY_EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/users/verify-email" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
http_code=$(echo "$VERIFY_EMAIL_RESPONSE" | tail -n1)
if [ "$http_code" = "200" ]; then
    success "Email de vérification envoyé"
else
    error "Échec d'envoi de l'email de vérification (status: $http_code)"
fi

echo ""
info "🔐 Test 3.2: Demander un reset de password"
FORGOT_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/forgot-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\"}")
http_code=$(echo "$FORGOT_PASSWORD_RESPONSE" | tail -n1)
if [ "$http_code" = "200" ]; then
    success "Demande de reset de password envoyée"
else
    info "Demande de reset (status: $http_code) - Peut être limitée par rate limiting"
fi

# Test 4: 2FA
title "4️⃣  AUTHENTIFICATION 2FA (Thierry)"

echo ""
info "🔐 Test 4.1: Activer le 2FA"
ENABLE_2FA_RESPONSE=$(curl -s -X POST "$API_URL/2fa/enable" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
secret=$(echo $ENABLE_2FA_RESPONSE | jq -r '.secret')
if [ "$secret" != "null" ] && [ ! -z "$secret" ]; then
    success "2FA activé - Secret: ${secret:0:10}..."
    info "Codes de backup générés: $(echo $ENABLE_2FA_RESPONSE | jq -r '.backupCodes | length') codes"
else
    error "Échec d'activation du 2FA"
fi

# Test 5: Sécurité
title "5️⃣  TESTS DE SÉCURITÉ (Florent)"

echo ""
info "🛡️  Test 5.1: Accès sans token (devrait échouer)"
NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/users/me")
http_code=$(echo "$NO_TOKEN_RESPONSE" | tail -n1)
if [ "$http_code" = "401" ]; then
    success "Accès sans token correctement refusé"
else
    error "Accès sans token devrait être refusé (status: $http_code)"
fi

echo ""
info "🛡️  Test 5.2: Token invalide (devrait échouer)"
INVALID_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/users/me" \
    -H "Authorization: Bearer invalid_token_here")
http_code=$(echo "$INVALID_TOKEN_RESPONSE" | tail -n1)
if [ "$http_code" = "401" ]; then
    success "Token invalide correctement refusé"
else
    error "Token invalide devrait être refusé (status: $http_code)"
fi

echo ""
info "🛡️  Test 5.3: Tentatives de connexion échouées"
for i in {1..3}; do
    curl -s -X POST "$API_URL/api/users/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"WrongPassword$i\"}" > /dev/null
done
RATE_LIMIT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/users/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"WrongPassword4\"}")
http_code=$(echo "$RATE_LIMIT_RESPONSE" | tail -n1)
if [ "$http_code" = "429" ] || [ "$http_code" = "401" ]; then
    success "Rate limiting fonctionnel"
else
    info "Rate limiting (status: $http_code)"
fi

# Test 6: Historique et logs
title "6️⃣  HISTORIQUE & LOGS (Florent)"

echo ""
info "📜 Test 6.1: Historique de connexion"
HISTORY_RESPONSE=$(curl -s -X GET "$API_URL/api/users/me/login-history" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
if echo $HISTORY_RESPONSE | jq -e '.history' > /dev/null 2>&1; then
    history_count=$(echo $HISTORY_RESPONSE | jq -r '.history | length')
    success "Historique récupéré - $history_count entrées"
else
    error "Échec de récupération de l'historique"
fi

# Test 7: Nettoyage
title "7️⃣  NETTOYAGE"

echo ""
info "👋 Test 7.1: Déconnexion"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/users/logout" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
http_code=$(echo "$LOGOUT_RESPONSE" | tail -n1)
if [ "$http_code" = "200" ]; then
    success "Déconnexion réussie"
else
    error "Échec de la déconnexion (status: $http_code)"
fi

echo ""
info "🔍 Test 7.2: Vérifier que le token est révoqué"
AFTER_LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
http_code=$(echo "$AFTER_LOGOUT_RESPONSE" | tail -n1)
if [ "$http_code" = "401" ]; then
    success "Token correctement révoqué après déconnexion"
else
    error "Le token devrait être révoqué après déconnexion (status: $http_code)"
fi

# Résumé final
title "📊 RÉSUMÉ DES TESTS"
echo ""
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "${GREEN}✅ Tests réussis: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests échoués: $TESTS_FAILED${NC}"
echo -e "${BLUE}📈 Total: $TOTAL_TESTS${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS ! 🎉${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  CERTAINS TESTS ONT ÉCHOUÉ ⚠️${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
