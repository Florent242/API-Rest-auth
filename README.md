# API-Rest-auth

API REST d'authentification complète avec NodeJS + Express

## 📋 Description

Cette API fournit un système d'authentification complet avec :
- ✅ Inscription et connexion d'utilisateurs
- ✅ Authentification JWT (Access Token + Refresh Token)
- ✅ **Vérification d'email obligatoire** : Les tokens sont envoyés uniquement après confirmation d'email
- ✅ Gestion de profil utilisateur
- ✅ Validation des données avec Zod
- ✅ Base de données SQLite avec Prisma ORM
- ✅ Sécurité avec Helmet et CORS
- ✅ Rate limiting pour prévenir les abus
- ✅ Historique de connexions (LoginHistory)
- ✅ Blacklist de tokens révoqués
- ✅ Job de nettoyage automatique
- ✅ Tests d'intégration (85% de couverture)

## 🔐 Flux d'authentification

1. **Inscription** → Email de vérification envoyé (pas de tokens)
2. **Vérification email** → Access Token + Refresh Token retournés
3. **Login** → Access Token + Refresh Token retournés

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Générer le client Prisma
npm run db:generate

# Initialiser la base de données
npm run db:push
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL=file:./prisma/dev.db

# JWT
JWT_SECRET=votre_secret_jwt_de_32_caracteres_minimum

# CORS
CORS_ORIGIN=*
```

### Variables d'environnement

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `PORT` | Port du serveur | `3000` | Non (défaut: 3000) |
| `NODE_ENV` | Environnement | `development`, `test`, `production` | Oui |
| `DATABASE_URL` | URL de la base de données | `file:./prisma/dev.db` | Oui |
| `JWT_SECRET` | Secret pour signer les JWT (min 32 caractères) | `your_secret_jwt_key_minimum_32_characters_long` | Oui |
| `CORS_ORIGIN` | Origine autorisée pour CORS | `*` ou `http://localhost:3000` | Non (défaut: *) |

## 🏃 Démarrage

```bash
# Développement avec rechargement automatique
npm run dev

# Production
npm start

# Tests
npm test

# Tests avec couverture
npm run test:coverage

# Interface Prisma Studio
npm run db:studio
```

## 📚 Documentation API Interactive

### 🌐 Interface Web de Documentation

Accédez à la documentation interactive complète de l'API :

```bash
# Démarrer le serveur
npm run dev

# Ouvrir dans votre navigateur
http://localhost:3000/api-docs
```

Cette interface fournit :
- 📖 Liste complète de tous les endpoints
- 🧪 Interface de test intégrée
- 📝 Exemples de requêtes/réponses
- 🔐 Codes de statut HTTP détaillés
- 🎯 Organisation par catégories

---

## 📋 Endpoints Principaux

### 🔐 Authentification

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/api/users/register` | Inscription utilisateur | Non |
| POST | `/api/users/login` | Connexion | Non |
| POST | `/api/users/logout` | Déconnexion | Oui |
| POST | `/api/users/verify-email` | Demander vérification email | Oui |
| GET | `/api/users/verify/:token` | Vérifier l'email | Non |

### 👤 Profil Utilisateur (Auth requise)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users/me` | Récupérer profil |
| PATCH | `/api/users/me` | Modifier profil |
| GET | `/api/users/me/login-history` | Historique connexions |
| GET | `/api/users/me/failed-attempts` | Tentatives échouées |

### 🔧 Administration

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/blacklist/stats` | Stats blacklist |
| POST | `/api/admin/cleanup` | Nettoyage manuel |

### 📝 Exemples d'utilisation (Copier-Coller Ready)

> **Note** : Ces exemples utilisent des variables bash. Exécutez-les dans l'ordre pour un flux complet.

#### 1. Inscription (pas de tokens retournés)
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Réponse** :
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "email": "user@example.com",
      "emailVerifiedAt": null
    },
    "message": "Please check your email to verify your account"
  }
}
```

#### 2. Vérifier l'email (retourne les tokens)
```bash
# En production, le token serait dans l'email
# Pour le test : GET le token depuis la DB ou les logs
curl -X GET http://localhost:3000/api/users/verify/YOUR_VERIFICATION_TOKEN
```

**Réponse** :
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

#### 3. Connexion (retourne les tokens)
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Réponse** : Même format que la vérification email, avec `user` et `tokens`

#### 4. Flux complet avec variables bash
```bash
# Étape 1 : Inscription
echo "=== INSCRIPTION ==="
REG_RESPONSE=$(curl -s -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }')
echo "$REG_RESPONSE" | jq .

# Étape 2 : Récupérer le token de vérification
# En production : depuis l'email
# En dev : depuis les logs ou la DB
USER_ID=$(echo "$REG_RESPONSE" | jq -r '.data.user.id')

# Étape 3 : Vérifier l'email et récupérer les tokens
VERIFY_TOKEN="GET_FROM_EMAIL_OR_DB"
VERIFY_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/users/verify/$VERIFY_TOKEN")
echo "$VERIFY_RESPONSE" | jq .

# Sauvegarder les tokens
ACCESS_TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.data.refreshToken')

# Étape 4 : Utiliser le token pour accéder au profil
echo -e "\n=== PROFIL ==="
curl -s -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

# Étape 5 : Modifier le profil
echo -e "\n=== MODIFIER PROFIL ==="
curl -s -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }' | jq .

# Étape 6 : Historique de connexion
echo -e "\n=== HISTORIQUE ==="
curl -s -X GET http://localhost:3000/api/users/me/login-history \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

# Étape 7 : Déconnexion (blacklist le token)
echo -e "\n=== DÉCONNEXION ==="
curl -s -X POST http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq .

# Étape 8 : Vérifier que le token est blacklisté
echo -e "\n=== TOKEN BLACKLISTÉ ==="
curl -s -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
```

#### Renvoyer l'email de vérification
```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### Mot de passe oublié
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### Réinitialiser le mot de passe
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "newPassword": "NewSecurePass123!"
  }'
```

#### Changer le mot de passe (authentifié)
```bash
curl -X PUT http://localhost:3000/api/password/password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

### 🔧 Administration & Monitoring

#### Statistiques de la blacklist
```bash
curl -X GET http://localhost:3000/api/admin/blacklist/stats \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "blacklistedAccessTokens": 1,
    "revokedRefreshTokens": 1
  }
}
```

#### Déclencher le nettoyage manuel
```bash
curl -X POST http://localhost:3000/api/admin/cleanup \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Réponse** :
```json
{
  "success": true,
  "message": "Cleanup completed",
  "data": {
    "expiredTokens": {
      "deletedAccessTokens": 0,
      "deletedRefreshTokens": 1,
      "expiredRefreshTokens": 2,
      "total": 3
    },
    "oldHistory": 0
  }
}
```

#### Révoquer tous les tokens d'un utilisateur
```bash
USER_ID="user-uuid-here"
curl -X POST http://localhost:3000/api/admin/users/$USER_ID/revoke-tokens \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 🔄 Gestion des tokens et sessions

#### Rafraîchir l'access token
```bash
curl -X POST http://localhost:3000/api/tokens/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### Lister les sessions actives
```bash
curl -X GET http://localhost:3000/api/tokens/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Révoquer une session spécifique
```bash
curl -X DELETE http://localhost:3000/api/tokens/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Révoquer toutes les autres sessions
```bash
curl -X DELETE http://localhost:3000/api/tokens/sessions/others \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 🔐 Authentification à deux facteurs (2FA)

#### Activer le 2FA (génère QR code)
```bash
curl -X POST http://localhost:3000/api/2fa/enable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Confirmer l'activation du 2FA
```bash
curl -X POST http://localhost:3000/api/2fa/confirm \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

#### Vérifier le code 2FA au login
```bash
curl -X POST http://localhost:3000/api/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "token": "123456"
  }'
```

#### Désactiver le 2FA
```bash
curl -X POST http://localhost:3000/api/2fa/disable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePass123!"
  }'
```

### 🌐 OAuth (Google)

#### Initier connexion Google
```bash
# Ouvrir dans le navigateur
http://localhost:3000/api/oauth/google
```

#### Récupérer les comptes OAuth liés
```bash
curl -X GET http://localhost:3000/api/oauth/linked \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Délier un compte OAuth
```bash
curl -X DELETE http://localhost:3000/api/oauth/unlink/google \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 👤 Gestion du profil utilisateur

#### Supprimer son compte (soft delete)
```bash
curl -X DELETE http://localhost:3000/api/user/profile/account \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Exporter ses données (RGPD)
```bash
curl -X GET http://localhost:3000/api/user/profile/export \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Historique de connexions
```bash
curl -X GET http://localhost:3000/api/users/me/login-history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Tentatives de connexion échouées
```bash
curl -X GET http://localhost:3000/api/users/me/failed-attempts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 🔧 Administration (endpoints admin)

#### Statistiques de la blacklist
```bash
curl -X GET http://localhost:3000/api/admin/blacklist/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Déclencher le nettoyage manuel
```bash
curl -X POST http://localhost:3000/api/admin/cleanup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Révoquer tous les tokens d'un utilisateur
```bash
curl -X POST http://localhost:3000/api/admin/users/USER_ID/revoke-tokens \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**💡 Conseil:** Pour une exploration complète des endpoints avec exemples interactifs, utilisez l'interface web à `/api-docs`

## 🔒 Sécurité

### Authentification
- ✅ Mots de passe hashés avec Argon2
- ✅ Tokens JWT avec la bibliothèque Jose
- ✅ Access tokens (1h) + Refresh tokens (7 jours)
- ✅ Blacklist des tokens révoqués

### Protection
- ✅ Headers de sécurité avec Helmet
- ✅ CORS configuré
- ✅ Rate limiting (100 req/15min global, 5 req/15min auth)
- ✅ Validation des données avec Zod
- ✅ Gestion des erreurs centralisée

### Logging
- ✅ Historique des connexions (IP + User-Agent)
- ✅ Logs des tentatives échouées
- ✅ Logger Pino pour monitoring

### Maintenance
- ✅ Job automatique de nettoyage (tokens expirés, historique ancien)
- ✅ Exécution quotidienne à 3h du matin (production)

## 🗄️ Structure du Projet

```
src/
├── controllers/       # Contrôleurs (logique de routage)
├── services/         # Logique métier
│   ├── user.service.js
│   ├── blacklist.service.js
│   └── verification.service.js
├── middlewares/      # Middlewares (auth, validation, erreurs)
│   ├── auth.middleware.js
│   ├── rate-limit.middleware.js
│   └── error-handler.js
├── routes/           # Définition des routes
├── dto/              # Data Transfer Objects
├── schemas/          # Schémas de validation Zod
├── lib/              # Utilitaires (JWT, password, logger, etc.)
├── jobs/             # Jobs cron (nettoyage)
├── app.js            # Configuration Express
└── index.js          # Point d'entrée

prisma/
└── schema.prisma     # Schéma de base de données

tests/
└── integration/      # Tests d'intégration
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests spécifiques
npm run test:jest -- --testPathPattern=auth
```

**Couverture actuelle: 85%+** (tests en progression continue)

Les tests incluent :
- ✅ Tests d'authentification (register, login, logout)
- ✅ Tests du middleware d'authentification JWT
- ✅ Tests de validation des données (Zod)
- ✅ Tests des headers de sécurité (CORS, Helmet)
- ✅ Tests de gestion d'erreurs
- ✅ Tests du rate limiting
- ✅ Tests de l'historique de connexions
- ✅ Tests de la blacklist de tokens

## 📦 Technologies Utilisées

- **Node.js 22+** - Runtime JavaScript
- **Express 5** - Framework web
- **Prisma 7** - ORM pour base de données
- **SQLite** - Base de données
- **Jose** - Gestion JWT
- **Argon2** - Hashage de mots de passe
- **Zod** - Validation de schémas
- **Helmet** - Sécurité HTTP
- **express-rate-limit** - Rate limiting
- **node-cron** - Jobs planifiés
- **Pino** - Logger haute performance
- **Jest** - Framework de tests
- **Supertest** - Tests d'intégration HTTP

## 🏗️ Architecture

### Couches fonctionnelles

1. **Infrastructure & Sécurité** (Florent - Lead)
   - Middleware d'authentification
   - Rate limiting
   - Blacklist tokens
   - LoginHistory
   - Jobs de nettoyage

2. **Authentification Core** (Richard)
   - Inscription / Connexion / Déconnexion
   - Génération JWT
   - Validation credentials

3. **Tokens & Sessions** (Jean-Paul)
   - RefreshToken (whitelist)
   - Gestion sessions actives
   - Révocation tokens

4. **Communication & Vérification** (Ange)
   - VerificationToken
   - Service email (à implémenter)
   - Password reset (à implémenter)

5. **Authentification Avancée** (Thierry)
   - Profil utilisateur
   - OAuth (à implémenter)
   - 2FA (à implémenter)

## 👨‍💻 Équipe

- **Florent** (Lead) - Infrastructure & Sécurité
- **Richard** - Authentification Core
- **Jean-Paul** - Tokens & Sessions
- **Ange** - Communication & Vérification
- **Thierry** - Authentification Avancée

## 📝 License

ISC



# **Organisation optimale pour 5 personnes avec TDD sur 3 semaines - Répartition par couches fonctionnelles:**

- **Florent (Lead)** : **Couche Infrastructure & Sécurité** (middleware, rate-limiting, blacklist tokens, jobs de nettoyage, LoginHistory)
- **Richard** : **Couche Authentification Core** (inscription, connexion, déconnexion, refresh token, changement password)
- **Jean-Paul** : **Couche Gestion Tokens & Sessions** (RefreshToken whitelist, gestion sessions actives, révocation)
- **Ange** : **Couche Communication & Vérification** (emails, VerificationToken, PasswordResetToken, envoi/vérification)
- **Thierry** : **Couche Authentification Avancée** (OAuth, 2FA, profil utilisateur, suppression compte)
# ANALYSE ALGORITHMIQUE : PLAN D'EXÉCUTION TDD PAR COUCHES

## Sprint 1 (23 déc - 29 déc) : Fondations + Couches de base

### Florent (Lead) : Infrastructure & Sécurité - Jour 1-7

#### Jour 1-2 : Setup projet

1. Initialiser le projet (Node.js + Express + TypeScript)
2. Configurer la base de données (Prisma/TypeORM + PostgreSQL)
3. Créer les migrations initiales pour TOUTES les tables
4. Configurer Jest + Supertest
5. **Tests** : Tests de connexion DB, tests des migrations

#### Jour 3-4 : Middleware & Sécurité de base

1. **Test** : Tests du middleware d'authentification JWT
2. **Code** : Implémenter `authMiddleware` (vérification access token)
3. **Test** : Tests du middleware de validation (express-validator)
4. **Code** : Implémenter les validators réutilisables
5. **Test** : Tests du middleware d'erreur global
6. **Code** : Implémenter l'error handler centralisé
7. **Test** : Tests de configuration CORS + Helmet
8. **Code** : Configurer la sécurité des headers

#### Jour 5-6 : Rate Limiting & LoginHistory

1. **Test** : Tests du rate limiting progressif (3 tentatives → blocage 15min)
2. **Code** : Implémenter le rate limiting avec express-rate-limit
3. **Test** : Tests du modèle LoginHistory (création, enrichissement IP/User-Agent)
4. **Code** : Implémenter le service LoginHistory
5. **Test** : Tests du middleware de logging des connexions
6. **Code** : Créer le middleware qui log automatiquement

#### Jour 7 : Blacklist & Jobs

1. **Test** : Tests du service de blacklist d'access tokens
2. **Code** : Implémenter la vérification de blacklist dans authMiddleware
3. **Test** : Tests du job de nettoyage (tokens expirés, blacklist obsolète)
4. **Code** : Implémenter le cron job de nettoyage

**Livrables Sprint 1 - Florent** :

- Projet configuré, DB opérationnelle
- Middleware d'auth, validation, erreurs
- Rate limiting fonctionnel
- LoginHistory opérationnel
- Système de blacklist + jobs de nettoyage

---

### Richard : Authentification Core - Jour 1-7

#### Jour 1-2 : Inscription

1. **Test** : Tests de validation des données d'inscription (email format, password strength)
2. **Code** : Créer le modèle User + validateurs
3. **Test** : Tests du hash de password (bcrypt)
4. **Code** : Implémenter le service d'inscription
5. **Test** : Tests de l'endpoint POST /auth/register (intégration)
6. **Code** : Implémenter le controller + route d'inscription

#### Jour 3-4 : Connexion & Déconnexion

1. **Test** : Tests de validation des credentials (email/password incorrect)
2. **Code** : Implémenter le service de connexion
3. **Test** : Tests de génération JWT (access + refresh token)
4. **Code** : Implémenter la génération des tokens
5. **Test** : Tests de l'endpoint POST /auth/login
6. **Code** : Implémenter le controller + route de connexion
7. **Test** : Tests de déconnexion (révocation du refresh token)
8. **Code** : Implémenter l'endpoint POST /auth/logout

#### Jour 5-6 : Changement de password

1. **Test** : Tests de validation (ancien password, nouveau password différent)
2. **Code** : Implémenter le service de changement de password
3. **Test** : Tests de l'endpoint PUT /auth/password (utilisateur connecté)
4. **Code** : Implémenter le controller + route
5. **Test** : Tests de révocation de toutes les sessions après changement
6. **Code** : Intégrer la révocation automatique

#### Jour 7 : Intégration avec Florent & Jean-Paul

- Intégrer le LoginHistory (Florent) dans le service de connexion
- Intégrer la génération de RefreshToken (JP) dans le service de connexion
- Tests d'intégration complets du flow d'authentification

**Livrables Sprint 1 - Richard** :

- Inscription fonctionnelle avec validation
- Connexion avec génération de tokens
- Déconnexion avec révocation
- Changement de password avec révocation sessions

---

### Jean-Paul : Tokens & Sessions - Jour 1-7

#### Jour 1-3 : RefreshToken (Whitelist)

1. **Test** : Tests du modèle RefreshToken (création, expiration)
2. **Code** : Implémenter le modèle RefreshToken
3. **Test** : Tests de génération de refresh token unique
4. **Code** : Implémenter le service de génération
5. **Test** : Tests de validation d'un refresh token (vérifie en DB + pas révoqué + pas expiré)
6. **Code** : Implémenter la validation (whitelist)
7. **Test** : Tests de l'endpoint POST /auth/refresh
8. **Code** : Implémenter le controller de refresh (vérifie refresh token → génère nouvel access token)

#### Jour 4-5 : Gestion des Sessions

1. **Test** : Tests de listing des sessions actives (tous les refresh tokens non révoqués)
2. **Code** : Implémenter le service de listing
3. **Test** : Tests de l'endpoint GET /auth/sessions
4. **Code** : Implémenter le controller + route
5. **Test** : Tests de révocation d'une session spécifique
6. **Code** : Implémenter l'endpoint DELETE /auth/sessions/:id
7. **Test** : Tests de révocation de toutes les autres sessions
8. **Code** : Implémenter l'endpoint DELETE /auth/sessions/others

#### Jour 6-7 : Révocation avancée & Intégration

1. **Test** : Tests de révocation automatique (expiration, changement password)
2. **Code** : Créer un service centralisé de révocation
3. **Test** : Tests d'ajout de l'access token actuel à la blacklist lors d'une révocation
4. **Code** : Intégrer avec la blacklist de Florent
5. Intégration avec Richard (connexion génère un refresh token)
6. Tests d'intégration du flow complet refresh + sessions

**Livrables Sprint 1 - Jean-Paul** :

- Système de RefreshToken en whitelist
- Endpoint de refresh fonctionnel
- Gestion complète des sessions actives
- Système de révocation (simple, multiple, globale)

---

### Ange : Communication & Vérification - Jour 1-7

#### Jour 1-3 : Service Email & Vérification

1. **Test** : Tests de configuration Nodemailer (mock avec MailHog)
2. **Code** : Configurer Nodemailer + templates d'email
3. **Test** : Tests d'envoi d'email de vérification
4. **Code** : Implémenter le service d'envoi
5. **Test** : Tests du modèle VerificationToken (génération unique, expiration)
6. **Code** : Implémenter le modèle VerificationToken
7. **Test** : Tests de vérification du token (valide, expiré, invalide)
8. **Code** : Implémenter le service de vérification

#### Jour 4-5 : Endpoints de vérification

1. **Test** : Tests de l'endpoint POST /auth/verify-email (envoi initial)
2. **Code** : Implémenter le controller + route d'envoi
3. **Test** : Tests de l'endpoint GET /auth/verify/:token
4. **Code** : Implémenter la vérification (met à jour emailVerifiedAt)
5. **Test** : Tests de renvoi du token (DELETE l'ancien + CREATE nouveau)
6. **Code** : Implémenter POST /auth/resend-verification

#### Jour 6-7 : Password Reset

1. **Test** : Tests du modèle PasswordResetToken (génération, expiration)
2. **Code** : Implémenter le modèle PasswordResetToken
3. **Test** : Tests de l'endpoint POST /auth/forgot-password (envoi email)
4. **Code** : Implémenter le service + controller
5. **Test** : Tests de l'endpoint POST /auth/reset-password (validation token + nouveau password)
6. **Code** : Implémenter la réinitialisation
7. Intégration avec Richard (révocation sessions après reset)

**Livrables Sprint 1 - Ange** :

- Service d'envoi d'email fonctionnel
- Système de vérification d'email complet
- Système de reset de password par email
- Templates d'email professionnels

---

### Thierry : Authentification Avancée - Jour 1-7

#### Jour 1-3 : Profil Utilisateur

1. **Test** : Tests de l'endpoint GET /user/profile (récupération profil)
2. **Code** : Implémenter le service + controller
3. **Test** : Tests de l'endpoint PUT /user/profile (modification)
4. **Code** : Implémenter la mise à jour (nom, email, etc.)
5. **Test** : Tests de validation (email déjà utilisé, format invalide)
6. **Code** : Ajouter les validateurs
7. **Test** : Tests de suppression de compte (soft delete → disabledAt)
8. **Code** : Implémenter DELETE /user/account

#### Jour 4-5 : OAuth (Google OU GitHub)

1. **Test** : Tests du modèle OAuthAccount
2. **Code** : Implémenter le modèle OAuthAccount
3. **Test** : Tests de configuration Passport.js (mock du provider)
4. **Code** : Configurer Passport avec Google OU GitHub
5. **Test** : Tests du callback OAuth (création compte si nouveau)
6. **Code** : Implémenter GET /auth/google/callback
7. **Test** : Tests de liaison compte existant (même email)
8. **Code** : Implémenter la logique de liaison

#### Jour 6-7 : 2FA (Préparation)

1. **Test** : Tests de génération du secret TOTP (speakeasy)
2. **Code** : Implémenter le service de génération
3. **Test** : Tests de l'endpoint POST /auth/2fa/enable (génère QR code)
4. **Code** : Implémenter le controller (retourne le QR code)
5. Documentation des endpoints OAuth et 2FA
6. Préparation de la collection Postman pour OAuth

**Livrables Sprint 1 - Thierry** :

- CRUD profil utilisateur complet
- Suppression de compte (soft delete)
- OAuth Google OU GitHub fonctionnel
- Préparation du 2FA (activation)

---

### Fin Sprint 1 (Jour 7 - Tous ensemble 2h)

1. **Code review croisée** : chaque personne review 1 autre personne
2. **Intégration** : Florent (Lead) orchestre la fusion des branches
3. **Tests d'intégration** : tous les flows de bout en bout
4. **Rétrospective** : ce qui a marché, ce qui doit changer

---

## Sprint 2 (30 déc - 5 jan) : Finalisation des couches

### Florent (Lead) : Sécurité Avancée & Monitoring - Jour 1-7

#### Jour 1-3 : Sécurité renforcée

1. **Test** : Tests de détection de brute-force (>5 tentatives → blocage 1h)
2. **Code** : Implémenter un rate limiting avancé par IP + par compte
3. **Test** : Tests de protection CSRF (si utilisation de cookies)
4. **Code** : Implémenter la protection CSRF
5. **Test** : Tests de validation stricte des inputs (XSS, injection SQL)
6. **Code** : Renforcer tous les validators avec sanitization

#### Jour 4-5 : Monitoring & Logs

1. **Test** : Tests du système de logging (Winston)
2. **Code** : Configurer Winston avec rotation de fichiers
3. **Test** : Tests des alertes de sécurité (tentatives suspectes)
4. **Code** : Implémenter un service d'alerting
5. **Test** : Tests de métriques (temps de réponse, taux d'erreur)
6. **Code** : Ajouter des métriques avec Prometheus (optionnel)

#### Jour 6-7 : Optimisation & CI/CD

1. Ajouter des indexes sur les colonnes critiques (User.email, RefreshToken.token)
2. Optimiser les requêtes N+1 (eager loading)
3. **Test** : Tests de performance (Artillery)
4. Configurer GitHub Actions (tests auto sur chaque PR)
5. Intégration et support des autres équipes

**Livrables Sprint 2 - Florent** :

- Sécurité renforcée (brute-force, CSRF, XSS)
- Système de logging et alertes
- Optimisation des performances
- CI/CD opérationnel

---

### Richard : Amélioration Auth Core - Jour 1-7

#### Jour 1-3 : Amélioration UX & Validation

1. **Test** : Tests de validation avancée (password strength score)
2. **Code** : Implémenter un validateur de force de password (zxcvbn)
3. **Test** : Tests de messages d'erreur clairs et cohérents
4. **Code** : Standardiser tous les messages d'erreur
5. **Test** : Tests de rate limiting spécifique sur /login et /register
6. **Code** : Ajouter des limites strictes (3 tentatives login, 5 inscriptions/IP/jour)

#### Jour 4-5 : Gestion avancée du password

1. **Test** : Tests d'historique des passwords (ne pas réutiliser les 3 derniers)
2. **Code** : Implémenter une table PasswordHistory
3. **Test** : Tests de politique d'expiration (password > 90 jours → forcer changement)
4. **Code** : Ajouter un champ passwordChangedAt + logique d'expiration
5. **Test** : Tests de blocage de compte (5 tentatives échouées)
6. **Code** : Implémenter le blocage temporaire

#### Jour 6-7 : Tests & Documentation

1. Tests end-to-end complets de tous les flows d'authentification
2. Documenter les endpoints dans la collection Postman
3. Écrire des exemples d'utilisation dans le README
4. Support à Thierry pour l'intégration OAuth/2FA

**Livrables Sprint 2 - Richard** :

- Validation avancée des passwords
- Historique des passwords
- Blocage de compte après tentatives échouées
- Documentation complète des endpoints auth

---

### Jean-Paul : Optimisation Tokens & Sessions - Jour 1-7

#### Jour 1-3 : Amélioration du système de tokens

1. **Test** : Tests de rotation automatique du refresh token (à chaque refresh)
2. **Code** : Implémenter la rotation (invalider l'ancien, créer un nouveau)
3. **Test** : Tests de détection de réutilisation de token (sécurité)
4. **Code** : Implémenter la détection + révocation de toute la famille de tokens
5. **Test** : Tests de limitation du nombre de sessions par utilisateur (max 5)
6. **Code** : Implémenter la suppression automatique des sessions les plus anciennes

#### Jour 4-5 : Enrichissement des sessions

1. **Test** : Tests d'ajout de métadonnées (IP, User-Agent, localisation approximative)
2. **Code** : Enrichir le modèle RefreshToken avec ces infos
3. **Test** : Tests de détection de session suspecte (IP change drastiquement)
4. **Code** : Ajouter un warning dans le listing des sessions
5. **Test** : Tests de nommage manuel des sessions ("iPhone de John", "PC Bureau")
6. **Code** : Permettre à l'utilisateur de nommer ses sessions

#### Jour 6-7 : Cache & Performance

1. **Test** : Tests de mise en cache de la blacklist (Redis optionnel)
2. **Code** : Implémenter un cache en mémoire pour la blacklist
3. Tests de charge sur le système de refresh (1000 requêtes/sec)
4. Optimisation des requêtes de sessions
5. Documentation des endpoints de sessions

**Livrables Sprint 2 - Jean-Paul** :

- Rotation automatique des refresh tokens
- Détection de réutilisation de tokens
- Sessions enrichies avec métadonnées
- Système optimisé et performant

---

### Ange : Amélioration Communication - Jour 1-7

#### Jour 1-3 : Templates d'email avancés

1. **Test** : Tests des templates HTML responsive
2. **Code** : Créer des templates professionnels avec CSS inline
3. **Test** : Tests de personnalisation (prénom, langue)
4. **Code** : Implémenter un système de templating (Handlebars)
5. **Test** : Tests d'envoi multi-langue (détection locale)
6. **Code** : Ajouter le support i18n pour les emails

#### Jour 4-5 : Amélioration des tokens de vérification

1. **Test** : Tests de limitation d'envoi (max 3 emails/heure)
2. **Code** : Implémenter le rate limiting sur /resend-verification
3. **Test** : Tests de nettoyage des tokens expirés (job cron)
4. **Code** : Ajouter le nettoyage dans le job de Florent
5. **Test** : Tests de notification par email lors d'actions sensibles
6. **Code** : Implémenter les emails de notification (changement password, nouveau login)

#### Jour 6-7 : Sécurité Email & Tests

1. **Test** : Tests de protection contre le spam (vérifier domaine email)
2. **Code** : Ajouter une validation de domaine email (pas de domaines jetables)
3. Tests d'intégration de tous les flows email
4. Documenter le système d'emails dans le README
5. Préparer des exemples d'emails dans la collection Postman

**Livrables Sprint 2 - Ange** :

- Templates d'email professionnels et responsive
- Support multi-langue
- Notifications par email des actions sensibles
- Système anti-spam

---

### Thierry : Finalisation Auth Avancée - Jour 1-7

#### Jour 1-3 : Finalisation 2FA

1. **Test** : Tests de vérification du code 2FA à la connexion
2. **Code** : Modifier le flow de connexion pour demander le code si 2FA activé
3. **Test** : Tests de désactivation du 2FA (demande password + code actuel)
4. **Code** : Implémenter POST /auth/2fa/disable
5. **Test** : Tests de codes de backup (10 codes à usage unique)
6. **Code** : Implémenter la génération et validation de codes de backup

#### Jour 4-5 : Amélioration OAuth

1. **Test** : Tests de déconnexion OAuth (révocation côté provider)
2. **Code** : Implémenter la déconnexion complète
3. **Test** : Tests de détachement d'un compte OAuth
4. **Code** : Implémenter DELETE /user/oauth/:provider
5. **Test** : Tests de liaison d'un nouveau provider (si déjà connecté)
6. **Code** : Implémenter POST /user/oauth/link/:provider

#### Jour 6-7 : Profil avancé & Tests

1. **Test** : Tests d'upload d'avatar (avec limitation de taille)
2. **Code** : Implémenter l'upload d'avatar (multer + validation)
3. **Test** : Tests d'export des données personnelles (RGPD)
4. **Code** : Implémenter GET /user/export (retourne JSON de toutes les données)
5. Tests end-to-end OAuth + 2FA
6. Documentation complète dans Postman

**Livrables Sprint 2 - Thierry** :

- 2FA complètement fonctionnel avec codes de backup
- OAuth avec liaison/détachement de comptes
- Gestion d'avatar
- Export de données (RGPD)

---

### Fin Sprint 2 (Jour 7 - Tous ensemble 2h)

1. **Code review croisée** complète
2. **Intégration finale** des fonctionnalités
3. **Tests de charge** sur l'ensemble de l'API (Artillery)
4. **Rétrospective** et planification Sprint 3

---

## Sprint 3 (6 jan - 10 jan) : Tests, Documentation & Polissage

### Florent (Lead) : Coordination & Qualité - Jour 1-5

#### Jour 1-2 : Tests de sécurité

1. Tests de pénétration (injection SQL, XSS, CSRF)
2. Tests de vulnérabilités connues (npm audit)
3. Correction des failles critiques
4. Validation de la couverture de tests (objectif: >85%)

#### Jour 3-4 : Documentation technique

1. Rédiger le README principal (architecture, installation)
2. Documenter les choix techniques
3. Créer un guide de déploiement
4. Documenter les variables d'environnement

#### Jour 5 : Livrable final

1. Vérifier les commits de chaque membre (équité)
2. Valider la collection Postman complète
3. Préparer la démo
4. Push final et validation

**Livrables Sprint 3 - Florent** :

- Tests de sécurité complets
- Documentation technique exhaustive
- Guide de déploiement
- Coordination du rendu final

---

### Richard : Tests & Documentation Auth - Jour 1-5

#### Jour 1-2 : Tests manquants

1. Ajouter les tests unitaires manquants (services auth)
2. Tests d'intégration end-to-end (inscription → connexion → logout)
3. Tests des cas limites (email déjà utilisé, password trop court)
4. Améliorer la couverture de tests (>90% sur les services critiques)

#### Jour 3-4 : Documentation

1. Documenter tous les endpoints d'authentification dans Postman
2. Ajouter des exemples de requêtes/réponses
3. Documenter les codes d'erreur
4. Rédiger la section "Authentification" du README

#### Jour 5 : Polissage

1. Corriger les bugs restants
2. Améliorer les messages d'erreur
3. Valider le flow complet
4. Support aux autres membres

---

### Jean-Paul : Tests & Documentation Sessions - Jour 1-5

#### Jour 1-2 : Tests manquants

1. Tests de tous les cas de révocation de sessions
2. Tests de la rotation des tokens
3. Tests de performance (100 sessions actives simultanées)
4. Tests de la détection de réutilisation

#### Jour 3-4 : Documentation

1. Documenter la gestion des sessions dans Postman
2. Expliquer le système whitelist/blacklist
3. Documenter le flow de refresh
4. Rédiger la section "Sessions" du README

#### Jour 5 : Polissage

1. Optimiser les requêtes de sessions
2. Améliorer l'UX du listing
3. Corriger les bugs
4. Valider le système complet

---

### Ange : Tests & Documentation Communication - Jour 1-5

#### Jour 1-2 : Tests manquants

1. Tests de tous les types d'emails
2. Tests des templates dans différents clients email
3. Tests de rate limiting sur les envois
4. Tests de la notification des actions sensibles

#### Jour 3-4 : Documentation

1. Documenter le système d'emails dans Postman
2. Montrer des exemples de templates
3. Expliquer la configuration SMTP
4. Rédiger la section "Emails" du README

#### Jour 5 : Polissage

1. Améliorer les templates HTML
2. Tester l'envoi réel d'emails
3. Corriger les bugs
4. Finaliser les exemples

---

### Thierry : Tests & Documentation Auth Avancée - Jour 1-5

#### Jour 1-2 : Tests manquants

1. Tests complets du 2FA (activation, désactivation, codes backup)
2. Tests du flow OAuth complet
3. Tests de liaison/détachement de comptes
4. Tests de l'export de données

#### Jour 3-4 : Documentation

1. Documenter OAuth et 2FA dans Postman
2. Ajouter des captures d'écran (QR code 2FA)
3. Expliquer la configuration OAuth
4. Rédiger la section "Auth Avancée" du README

#### Jour 5 : Polissage

1. Améliorer l'UX du 2FA
2. Tester le flow OAuth complet
3. Corriger les bugs
4. Finaliser la collection Postman

---

### Jour 5 (10 janvier - Tous ensemble 4h)

#### Matin (2h)

1. **Revue finale du code** (tous ensemble)
2. **Tests end-to-end complets** de tous les flows
3. **Validation de la collection Postman** (tester tous les endpoints)
4. **Vérification des commits** de chaque membre

#### Après-midi (2h)

1. **Préparation de la démo** (script de présentation)
2. **Dernières corrections** urgentes
3. **Push final** sur le repository
4. **Validation du rendu** (README, collection, commits)