# API-Rest-auth

API REST d'authentification complète avec NodeJS + Express

## 📋 Description

Cette API fournit un système d'authentification complet avec :
- ✅ Inscription et connexion d'utilisateurs
- ✅ Authentification JWT (Access Token + Refresh Token)
- ✅ Gestion de profil utilisateur
- ✅ Validation des données avec Zod
- ✅ Base de données SQLite avec Prisma ORM
- ✅ Sécurité avec Helmet et CORS
- ✅ Rate limiting pour prévenir les abus
- ✅ Historique de connexions (LoginHistory)
- ✅ Blacklist de tokens révoqués
- ✅ Vérification d'email par token
- ✅ Job de nettoyage automatique
- ✅ Tests d'intégration (85% de couverture)

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

## 📚 Endpoints API

### Authentification

#### POST /api/users/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST /api/users/login
Connexion d'un utilisateur existant.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### POST /api/users/logout
Déconnexion de l'utilisateur (révocation du refresh token).

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### POST /api/users/verify-email
Demander l'envoi d'un email de vérification.

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent",
  "data": { "token": "verification_token" }
}
```

#### GET /api/users/verify/:token
Vérifier l'email avec le token reçu.

### Profil Utilisateur (Authentifié)

Tous ces endpoints nécessitent le header: `Authorization: Bearer <access_token>`

#### GET /api/users/me
Récupérer le profil de l'utilisateur connecté.

#### PATCH /api/users/me
Mettre à jour le profil utilisateur.

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### GET /api/users/me/login-history
Obtenir l'historique des connexions.

**Query params:** `?limit=10`

#### GET /api/users/me/failed-attempts
Obtenir le nombre de tentatives échouées récentes.

### Admin

#### GET /api/admin/blacklist/stats
Statistiques de la blacklist (requiert authentification admin).

#### POST /api/admin/cleanup
Lancer un nettoyage manuel des tokens expirés.

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

**Couverture actuelle: 85%** (53/62 tests passent)

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
