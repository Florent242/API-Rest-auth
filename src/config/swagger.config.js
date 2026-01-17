import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST Authentication - Documentation',
      version: '1.0.0',
      description: `
        API REST complète d'authentification avec gestion des tokens, sessions, emails et 2FA.
        
        ## Fonctionnalités principales
        
        ### Authentification Core (Richard)
        - Inscription avec validation
        - Connexion avec JWT (access + refresh token)
        - Déconnexion avec révocation
        - Changement de password
        - Validation avancée (force du password)
        - Blocage de compte après tentatives échouées
        
        ### Gestion Tokens & Sessions (Jean-Paul)
        - Refresh token (whitelist)
        - Listing des sessions actives
        - Révocation de sessions
        - Rotation automatique des tokens
        - Limitation du nombre de sessions
        
        ### Communication & Vérification (Ange)
        - Envoi d'emails (vérification, reset password)
        - Vérification d'email
        - Reset de password par email
        - Templates HTML professionnels
        - Notifications email des actions sensibles
        
        ### Authentification Avancée (Thierry)
        - 2FA (TOTP avec codes backup)
        - Profil utilisateur
        - Suppression de compte
        - OAuth (préparation)
        
        ### Infrastructure & Sécurité (Florent)
        - Rate limiting progressif
        - Blacklist des tokens
        - LoginHistory avec IP/User-Agent
        - Jobs de nettoyage
        - Logging avec Winston
        - Protection CORS et Helmet
      `,
      contact: {
        name: 'Équipe de développement',
        email: 'support@api-auth.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.example.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre access token JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            emailVerifiedAt: { type: 'string', format: 'date-time', nullable: true },
            twoFactorEnabled: { type: 'boolean', example: false },
            disabledAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Session: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            token: { type: 'string', example: 'abc123...' },
            ipAddress: { type: 'string', example: '192.168.1.1' },
            userAgent: { type: 'string', example: 'Mozilla/5.0...' },
            lastUsedAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            revokedAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Message d\'erreur' },
            details: { type: 'array', items: { type: 'string' } }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Opération réussie' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token manquant ou invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Token invalide ou expiré' }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { 
                error: 'Validation échouée',
                details: ['Le champ email est requis', 'Le mot de passe doit contenir au moins 8 caractères']
              }
            }
          }
        },
        RateLimitError: {
          description: 'Trop de requêtes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification (inscription, connexion, déconnexion)'
      },
      {
        name: 'Sessions',
        description: 'Gestion des sessions et tokens de rafraîchissement'
      },
      {
        name: 'Email',
        description: 'Vérification d\'email et reset de password'
      },
      {
        name: 'User',
        description: 'Gestion du profil utilisateur'
      },
      {
        name: '2FA',
        description: 'Authentification à deux facteurs'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
