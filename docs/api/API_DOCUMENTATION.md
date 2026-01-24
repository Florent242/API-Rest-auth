# API REST Auth - Documentation complète et Tests CURL

## Configuration

Base URL: `http://localhost:3000`

## 📋 Table des matières

1. [Authentification Core](#authentification-core)
2. [Gestion des tokens & sessions](#gestion-des-tokens-sessions)
3. [Communication & Vérification](#communication-verification)
4. [Profil utilisateur](#profil-utilisateur)
5. [2FA](#2fa)

---

## 🔐 Authentification Core

### 1. Inscription (Register)

**Endpoint:** `POST /auth/register`

**Description:** Créer un nouveau compte utilisateur

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecureP@ss123"
  }'
```

**Réponse Success (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "emailVerifiedAt": null
  },
  "message": "User registered successfully. Please verify your email."
}
```

**Erreurs possibles:**
- `400`: Données invalides (email mal formaté, password trop faible)
- `409`: Email déjà utilisé

---

### 2. Connexion (Login)

**Endpoint:** `POST /auth/login`

**Description:** Se connecter et obtenir des tokens JWT

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecureP@ss123"
  }'
```

**Réponse Success (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Erreurs possibles:**
- `401`: Email ou mot de passe incorrect
- `429`: Trop de tentatives (rate limiting)

**Notifications:**
- ✅ **Email envoyé:** Notification de connexion suspecte si IP/User-Agent différent

---

### 3. Déconnexion (Logout)

**Endpoint:** `POST /auth/logout`

**Description:** Se déconnecter et révoquer le refresh token

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Réponse Success (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Rafraîchir le token (Refresh)

**Endpoint:** `POST /auth/refresh`

**Description:** Obtenir un nouveau access token avec le refresh token

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Réponse Success (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "NEW_REFRESH_TOKEN_IF_ROTATION_ENABLED"
}
```

**Features avancées (Jean-Paul):**
- ✅ **Rotation automatique:** Ancien refresh token révoqué, nouveau généré
- ✅ **Détection de réutilisation:** Si un token révoqué est réutilisé, toute la famille de tokens est révoquée

---

### 5. Changer le mot de passe (Change Password)

**Endpoint:** `PUT /auth/password`

**Description:** Changer son mot de passe (nécessite authentification)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "oldPassword": "SecureP@ss123",
  "newPassword": "NewSecureP@ss456"
}
```

**Test CURL:**
```bash
curl -X PUT http://localhost:3000/auth/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecureP@ss123",
    "newPassword": "NewSecureP@ss456"
  }'
```

**Réponse Success (200):**
```json
{
  "message": "Password changed successfully. All sessions have been revoked."
}
```

**Effets secondaires:**
- 🔒 **Toutes les sessions révoquées** (sauf la session actuelle)
- ✅ **Email envoyé:** Notification de changement de mot de passe

**Validations avancées (Richard - Sprint 2):**
- ❌ Ne pas réutiliser les 3 derniers mots de passe (PasswordHistory)
- ❌ Score de force du mot de passe (zxcvbn)

---

## 🎫 Gestion des tokens & sessions

### 6. Lister les sessions actives

**Endpoint:** `GET /auth/sessions`

**Description:** Voir toutes ses sessions actives (refresh tokens non révoqués)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Test CURL:**
```bash
curl -X GET http://localhost:3000/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Success (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "createdAt": "2024-01-15T10:30:00Z",
      "expiresAt": "2024-02-15T10:30:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "isCurrent": true
    },
    {
      "id": "uuid2",
      "createdAt": "2024-01-10T08:00:00Z",
      "expiresAt": "2024-02-10T08:00:00Z",
      "ipAddress": "192.168.1.50",
      "userAgent": "PostmanRuntime/7.32.0",
      "isCurrent": false
    }
  ]
}
```

**Features avancées (Jean-Paul - Sprint 2):**
- ❌ Métadonnées enrichies (localisation approximative)
- ❌ Détection de sessions suspectes (IP change drastiquement)
- ❌ Nommage manuel des sessions

---

### 7. Révoquer une session spécifique

**Endpoint:** `DELETE /auth/sessions/:id`

**Description:** Révoquer une session (refresh token) spécifique

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Test CURL:**
```bash
curl -X DELETE http://localhost:3000/auth/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Success (200):**
```json
{
  "message": "Session revoked successfully"
}
```

---

### 8. Révoquer toutes les autres sessions

**Endpoint:** `DELETE /auth/sessions/others`

**Description:** Révoquer toutes les sessions sauf la session actuelle

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Test CURL:**
```bash
curl -X DELETE http://localhost:3000/auth/sessions/others \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Success (200):**
```json
{
  "message": "All other sessions revoked",
  "revokedCount": 3
}
```

---

## 📧 Communication & Vérification

### 9. Vérifier son email

**Endpoint:** `GET /auth/verify/:token`

**Description:** Vérifier son email avec le token reçu par email

**Test CURL:**
```bash
curl -X GET http://localhost:3000/auth/verify/TOKEN_FROM_EMAIL
```

**Réponse Success (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Erreurs:**
- `400`: Token invalide ou expiré

---

### 10. Renvoyer l'email de vérification

**Endpoint:** `POST /auth/resend-verification`

**Description:** Renvoyer un email de vérification

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/resend-verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Success (200):**
```json
{
  "message": "Verification email sent"
}
```

**Rate limiting:**
- ❌ Max 3 emails/heure (Ange - Sprint 2)

---

### 11. Demander un reset de mot de passe (Forgot Password)

**Endpoint:** `POST /auth/forgot-password`

**Description:** Recevoir un email pour réinitialiser son mot de passe

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Réponse Success (200):**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

**Note:** Retourne toujours 200 même si l'email n'existe pas (sécurité)

---

### 12. Réinitialiser le mot de passe (Reset Password)

**Endpoint:** `POST /auth/reset-password`

**Description:** Définir un nouveau mot de passe avec le token reçu par email

**Body:**
```json
{
  "token": "TOKEN_FROM_EMAIL",
  "newPassword": "NewSecureP@ss789"
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "newPassword": "NewSecureP@ss789"
  }'
```

**Réponse Success (200):**
```json
{
  "message": "Password reset successfully. All sessions have been revoked."
}
```

**Effets secondaires:**
- 🔒 **Toutes les sessions révoquées**

---

## 👤 Profil utilisateur

### 13. Récupérer son profil

**Endpoint:** `GET /user/profile`

**Description:** Voir les informations de son profil

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Test CURL:**
```bash
curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Success (200):**
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "emailVerifiedAt": "2024-01-15T10:30:00Z",
  "twoFactorEnabled": false,
  "createdAt": "2024-01-10T08:00:00Z"
}
```

---

### 14. Modifier son profil

**Endpoint:** `PUT /user/profile`

**Description:** Modifier son nom, email, etc.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Test CURL:**
```bash
curl -X PUT http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'
```

**Réponse Success (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john.updated@example.com",
    "name": "John Updated"
  },
  "message": "Profile updated. Please verify your new email."
}
```

**Note:** Si l'email change, `emailVerifiedAt` est remis à `null`

---

### 15. Supprimer son compte (Soft Delete)

**Endpoint:** `DELETE /user/account`

**Description:** Désactiver son compte (soft delete)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "password": "SecureP@ss123"
}
```

**Test CURL:**
```bash
curl -X DELETE http://localhost:3000/user/account \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecureP@ss123"
  }'
```

**Réponse Success (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Effets:**
- Le champ `disabledAt` est rempli
- L'utilisateur ne peut plus se connecter

---

## 🔐 Authentification à deux facteurs (2FA)

### 16. Activer le 2FA

**Endpoint:** `POST /auth/2fa/enable`

**Description:** Générer un secret TOTP et un QR code pour activer le 2FA

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Success (200):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "backupCodes": [
    "12345678",
    "87654321",
    "11223344",
    ...
  ]
}
```

**Instructions:**
1. Scanner le QR code avec une app (Google Authenticator, Authy)
2. Sauvegarder les codes de backup
3. Valider avec un code TOTP

---

### 17. Vérifier et finaliser l'activation du 2FA

**Endpoint:** `POST /auth/2fa/verify`

**Description:** Vérifier le code TOTP pour finaliser l'activation

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "token": "123456"
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

**Réponse Success (200):**
```json
{
  "message": "2FA enabled successfully"
}
```

---

### 18. Connexion avec 2FA

**Flow modifié du login:**

Quand le 2FA est activé, le login normal retourne :

```json
{
  "requiresTwoFactor": true,
  "tempToken": "TEMP_TOKEN_FOR_2FA"
}
```

Ensuite, faire une requête à `POST /auth/2fa/verify-login`:

**Body:**
```json
{
  "tempToken": "TEMP_TOKEN_FROM_LOGIN",
  "token": "123456"
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "TEMP_TOKEN",
    "token": "123456"
  }'
```

**Réponse Success (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

### 19. Désactiver le 2FA

**Endpoint:** `POST /auth/2fa/disable`

**Description:** Désactiver le 2FA

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "password": "SecureP@ss123",
  "token": "123456"
}
```

**Test CURL:**
```bash
curl -X POST http://localhost:3000/auth/2fa/disable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecureP@ss123",
    "token": "123456"
  }'
```

**Réponse Success (200):**
```json
{
  "message": "2FA disabled successfully"
}
```

---

## 🔒 Sécurité & Rate Limiting

### Rate Limiting (Florent)

| Endpoint | Limite | Fenêtre | Blocage |
|----------|--------|---------|---------|
| `/auth/login` | 5 tentatives | 15 min | 15 min |
| `/auth/register` | 3 tentatives | 1 heure | 1 heure |
| `/auth/forgot-password` | 3 tentatives | 1 heure | - |
| `/auth/resend-verification` | 3 tentatives | 1 heure | - |
| **Global** | 100 req/min | 1 min | 1 min |

**Test rate limiting:**
```bash
# Faire 6 tentatives de login rapides
for i in {1..6}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\n%{http_code}\n"
done
```

**Réponse après limite (429):**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

---

## 📊 État d'implémentation

### ✅ Implémenté (Sprint 1)

**Florent (Infrastructure):**
- ✅ Setup projet, DB, migrations
- ✅ Middleware d'authentification JWT
- ✅ Middleware de validation
- ✅ Error handler centralisé
- ✅ CORS + Helmet
- ✅ Rate limiting basique
- ✅ LoginHistory
- ✅ Blacklist de tokens
- ✅ Job de nettoyage (cron)

**Richard (Auth Core):**
- ✅ Inscription avec validation
- ✅ Connexion avec JWT
- ✅ Déconnexion avec révocation
- ✅ Changement de password
- ✅ Refresh token

**Jean-Paul (Tokens & Sessions):**
- ✅ RefreshToken en whitelist
- ✅ Endpoint de refresh
- ✅ Listing des sessions
- ✅ Révocation de session spécifique
- ✅ Révocation de toutes les autres sessions

**Ange (Communication):**
- ✅ Service d'email (Nodemailer)
- ✅ Templates HTML professionnels
- ✅ Vérification d'email
- ✅ Renvoi de vérification
- ✅ Reset de password par email

**Thierry (Auth Avancée):**
- ✅ Profil utilisateur (GET/PUT)
- ✅ Suppression de compte (soft delete)
- ⚠️ 2FA (structure de base, à finaliser)
- ❌ OAuth (pas implémenté)

---

### ❌ À implémenter (Sprints 2-3)

**Florent (Sprint 2):**
- ❌ Rate limiting avancé (par IP + par compte)
- ❌ Winston logging avec rotation
- ❌ Alertes de sécurité
- ❌ Protection CSRF
- ❌ Tests de sécurité (XSS, injection SQL)
- ❌ CI/CD (GitHub Actions)

**Richard (Sprint 2):**
- ❌ Validation avancée (zxcvbn pour password strength)
- ❌ PasswordHistory (ne pas réutiliser les 3 derniers)
- ❌ Politique d'expiration (password > 90 jours)
- ❌ Blocage de compte (5 tentatives échouées)
- ❌ Tests complets

**Jean-Paul (Sprint 2):**
- ❌ Rotation automatique du refresh token
- ❌ Détection de réutilisation de token
- ❌ Limitation du nombre de sessions (max 5)
- ❌ Métadonnées enrichies (IP, User-Agent, localisation)
- ❌ Détection de sessions suspectes
- ❌ Nommage manuel des sessions
- ❌ Cache en mémoire pour la blacklist

**Ange (Sprint 2):**
- ✅ **Templates HTML responsive** (fait)
- ✅ **Notification de connexion** (fait)
- ✅ **Notification de changement de password** (fait)
- ❌ Rate limiting sur resend-verification
- ❌ Support multi-langue (i18n)
- ❌ Validation anti-spam (domaines jetables)

**Thierry (Sprint 2):**
- ❌ 2FA complet au login
- ❌ Désactivation du 2FA
- ❌ Codes de backup
- ❌ OAuth Google ou GitHub
- ❌ Liaison/détachement de comptes OAuth
- ❌ Upload d'avatar
- ❌ Export de données (RGPD)

---

## 🚀 Script de test complet

Créer un fichier `test-api-complete.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
EMAIL="test$(date +%s)@example.com"
PASSWORD="TestP@ss123"
ACCESS_TOKEN=""
REFRESH_TOKEN=""

echo "=== 1. Register ==="
REGISTER_RESP=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $REGISTER_RESP | jq

echo -e "\n=== 2. Login ==="
LOGIN_RESP=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $LOGIN_RESP | jq

ACCESS_TOKEN=$(echo $LOGIN_RESP | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESP | jq -r '.refreshToken')

echo -e "\n=== 3. Get Profile ==="
curl -s -X GET $BASE_URL/user/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq

echo -e "\n=== 4. List Sessions ==="
curl -s -X GET $BASE_URL/auth/sessions \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq

echo -e "\n=== 5. Refresh Token ==="
REFRESH_RESP=$(curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
echo $REFRESH_RESP | jq

echo -e "\n=== 6. Change Password ==="
curl -s -X PUT $BASE_URL/auth/password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"oldPassword\":\"$PASSWORD\",\"newPassword\":\"NewP@ss456\"}" | jq

echo -e "\n=== 7. Logout ==="
curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | jq

echo -e "\n✅ Tests terminés"
```

**Exécuter:**
```bash
chmod +x test-api-complete.sh
./test-api-complete.sh
```

---

## 📝 Notes importantes

1. **Emails en développement:** Utiliser MailHog (port 1025) ou Mailtrap
2. **Base de données:** PostgreSQL ou SQLite (test.db)
3. **Variables d'environnement:** Voir `.env.example`
4. **Tests:** `npm test` pour lancer la suite de tests Jest
5. **Linter:** `npm run lint` pour vérifier le code

---

**Dernière mise à jour:** 17 janvier 2026  
**Version API:** 1.0.0  
**Auteurs:** Florent, Richard, Jean-Paul, Ange, Thierry
