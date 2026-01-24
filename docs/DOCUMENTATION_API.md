# 📚 Documentation API - Guide d'utilisation

## 🎯 Accès à la documentation

### Swagger UI (Recommandé)

La documentation interactive Swagger est accessible à l'adresse :

```
http://localhost:3000/api-docs
```

**Fonctionnalités Swagger :**
- ✅ Interface graphique pour tester tous les endpoints
- ✅ Authentification Bearer Token intégrée
- ✅ Validation automatique des paramètres
- ✅ Exemples de requêtes et réponses
- ✅ Codes d'erreur documentés
- ✅ Schémas de données détaillés

### Spécification OpenAPI JSON

Le fichier de spécification OpenAPI 3.0 est disponible à :

```
http://localhost:3000/api-docs.json
```

Vous pouvez l'importer dans :
- Postman
- Insomnia
- Swagger Editor
- Tout client supportant OpenAPI 3.0

---

## 🚀 Utilisation de Swagger UI

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Ouvrir Swagger UI

Naviguez vers `http://localhost:3000/api-docs` dans votre navigateur.

### 3. Tester un endpoint protégé

#### Étape 1 : S'inscrire ou se connecter

1. Déroulez la section **Authentication**
2. Cliquez sur `POST /api/users/register` ou `POST /api/users/login`
3. Cliquez sur "Try it out"
4. Remplissez le body :
   ```json
   {
     "email": "test@example.com",
     "password": "SecurePass123!",
     "name": "Test User"
   }
   ```
5. Cliquez sur "Execute"
6. **Copiez l'`accessToken`** de la réponse

#### Étape 2 : Autoriser avec le token

1. Cliquez sur le bouton **"Authorize"** 🔒 en haut à droite
2. Dans la popup, entrez : `Bearer YOUR_ACCESS_TOKEN`
   - Exemple : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Cliquez sur "Authorize"
4. Fermez la popup

#### Étape 3 : Tester les endpoints protégés

Vous pouvez maintenant tester tous les endpoints marqués avec 🔒 (ex: GET /api/users/me).

---

## 📖 Structure de la documentation

### Tags (Catégories)

| Tag | Description | Responsable |
|-----|-------------|-------------|
| **Authentication** | Inscription, connexion, déconnexion | Richard |
| **Sessions** | Gestion des sessions et refresh tokens | Jean-Paul |
| **Email** | Vérification email, reset password | Ange |
| **User** | Profil utilisateur, historique | Thierry |
| **2FA** | Authentification à deux facteurs | Thierry |

### Endpoints par catégorie

#### Authentication (Richard)
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `POST /api/users/logout` - Déconnexion 🔒

#### Sessions (Jean-Paul)
- `POST /auth/refresh` - Rafraîchir l'access token
- `GET /auth/sessions` - Lister les sessions actives 🔒
- `DELETE /auth/sessions/{id}` - Révoquer une session 🔒
- `DELETE /auth/sessions/others` - Révoquer les autres sessions 🔒

#### Email (Ange)
- `POST /api/users/verify-email` - Envoyer email de vérification 🔒
- `GET /auth/verify/{token}` - Vérifier l'email
- `POST /auth/resend-verification` - Renvoyer l'email 🔒
- `POST /auth/forgot-password` - Demander reset password
- `POST /auth/reset-password` - Réinitialiser le password

#### User (Thierry)
- `GET /api/users/me` - Obtenir le profil 🔒
- `PATCH /api/users/me` - Mettre à jour le profil 🔒
- `GET /api/users/me/login-history` - Historique de connexion 🔒
- `GET /api/users/me/failed-attempts` - Tentatives échouées 🔒

#### 2FA (Thierry)
- `POST /2fa/enable` - Activer le 2FA 🔒
- `POST /2fa/confirm` - Confirmer l'activation 🔒
- `POST /2fa/verify` - Vérifier un code 2FA 🔒
- `POST /2fa/disable` - Désactiver le 2FA 🔒

---

## 🧪 Tests avec cURL

Si vous préférez utiliser cURL, consultez le fichier détaillé :

```bash
cat TESTS_CURL_COMPLET.md
```

Ou exécutez le script de test automatique :

```bash
./scripts/test-complete-flow.sh
```

Ce script teste automatiquement :
- ✅ Inscription et connexion
- ✅ Gestion du profil
- ✅ Sessions et refresh tokens
- ✅ Emails de vérification
- ✅ 2FA
- ✅ Sécurité et rate limiting

---

## 📊 Schémas de données

### User
```typescript
{
  id: number
  email: string
  name: string
  emailVerifiedAt: Date | null
  twoFactorEnabled: boolean
  disabledAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### Session (RefreshToken)
```typescript
{
  id: number
  userId: number
  token: string
  ipAddress: string
  userAgent: string
  lastUsedAt: Date
  expiresAt: Date
  revokedAt: Date | null
}
```

### Error Response
```typescript
{
  error: string
  details?: string[]
}
```

---

## 🔐 Authentification

### Access Token (JWT)

- **Type :** Bearer Token
- **Durée de vie :** 15 minutes
- **Usage :** Toutes les requêtes protégées
- **Header :** `Authorization: Bearer <token>`

**Exemple :**
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3000/api/users/me
```

### Refresh Token

- **Durée de vie :** 7 jours
- **Usage :** Renouveler l'access token
- **Endpoint :** `POST /auth/refresh`

**Exemple :**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "abc123..."}'
```

---

## ⚠️ Codes d'erreur

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Erreur de validation |
| `401` | Non authentifié (token invalide/expiré) |
| `403` | Accès refusé |
| `404` | Ressource non trouvée |
| `429` | Trop de requêtes (rate limiting) |
| `500` | Erreur serveur |

---

## 🛡️ Sécurité et Rate Limiting

### Rate Limits

| Endpoint | Limite |
|----------|--------|
| `POST /api/users/register` | 5 inscriptions / IP / jour |
| `POST /api/users/login` | 3 tentatives / 15 minutes |
| `POST /auth/forgot-password` | 3 demandes / heure |
| `POST /auth/resend-verification` | 3 emails / heure |
| Tous les autres | 100 requêtes / 15 minutes |

### Réponse Rate Limit
```json
{
  "error": "Trop de tentatives. Réessayez dans 15 minutes."
}
```

---

## 🌐 Environnements

### Développement
```
http://localhost:3000
```

### Production (à configurer)
```
https://api.example.com
```

Pour changer d'environnement dans Swagger, utilisez le dropdown "Servers" en haut de la page.

---

## 💡 Conseils d'utilisation

### 1. Ordre recommandé des tests

1. **Inscription** → Créer un compte
2. **Connexion** → Obtenir les tokens
3. **Autorisation** → Configurer le Bearer token dans Swagger
4. **Profil** → Tester les endpoints protégés
5. **Sessions** → Gérer les sessions
6. **2FA** → Activer la sécurité renforcée

### 2. Gestion des tokens expirés

Si vous obtenez une erreur 401 :
1. Utilisez `POST /auth/refresh` avec votre refresh token
2. Mettez à jour le Bearer token dans l'autorisation
3. Réessayez votre requête

### 3. Debugging

- Vérifiez les **logs du serveur** pour les détails d'erreur
- Consultez la **console du navigateur** dans Swagger UI
- Utilisez le flag `-v` avec cURL pour voir les headers

---

## 📝 Exemples de flux complets

### Flux d'inscription complet

```bash
# 1. Inscription
POST /api/users/register
{
  "email": "new@example.com",
  "password": "SecurePass123!",
  "name": "New User"
}
# → Reçoit accessToken + refreshToken

# 2. Vérification email (optionnel)
POST /api/users/verify-email
Authorization: Bearer <accessToken>

# 3. Accéder au profil
GET /api/users/me
Authorization: Bearer <accessToken>
```

### Flux de connexion avec 2FA

```bash
# 1. Activer le 2FA
POST /2fa/enable
Authorization: Bearer <accessToken>
# → Reçoit secret + QR code

# 2. Scanner le QR code avec Google Authenticator

# 3. Confirmer avec un code
POST /2fa/confirm
Authorization: Bearer <accessToken>
{
  "code": "123456"
}

# 4. Déconnexion
POST /api/users/logout
Authorization: Bearer <accessToken>

# 5. Reconnexion (avec 2FA)
POST /api/users/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "twoFactorCode": "654321"
}
```

---

## 🆘 Support

- **Documentation Swagger :** `http://localhost:3000/api-docs`
- **Tests cURL :** `TESTS_CURL_COMPLET.md`
- **Script de test :** `./scripts/test-complete-flow.sh`
- **Logs serveur :** `logs/combined.log` et `logs/error.log`

---

## 📌 Ressources supplémentaires

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JWT.io](https://jwt.io/) - Décoder et vérifier les JWT
- [TOTP Guide](https://www.rfc-editor.org/rfc/rfc6238) - Spécification 2FA

---

**Version :** 1.0.0  
**Dernière mise à jour :** 2024-01-17  
**Génération automatique :** Swagger UI + OpenAPI 3.0
