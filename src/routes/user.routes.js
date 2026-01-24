import { Router } from "express";
import { UserController } from "#controllers/user.controller";
import { authMiddleware } from "#middlewares/auth.middleware";
import { authLimiter, registerLimiter } from "#middlewares/rate-limit.middleware";

const router = Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Inscription d'un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur avec validation du password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/register', registerLimiter, UserController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Connexion utilisateur
 *     description: Authentifie un utilisateur et retourne les tokens JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               twoFactorCode:
 *                 type: string
 *                 description: Code 2FA si activé
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Identifiants invalides
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', authLimiter, UserController.login);

/**
 * @swagger
 * /api/users/verify/{token}:
 *   get:
 *     tags: [Email]
 *     summary: Vérifier l'email
 *     description: Vérifie l'adresse email avec le token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email vérifié
 *       400:
 *         description: Token invalide
 */
router.get('/verify/:token', UserController.verifyEmail);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [User]
 *     summary: Obtenir le profil utilisateur
 *     description: Récupère les informations du profil de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authMiddleware, UserController.getProfile);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     tags: [User]
 *     summary: Mettre à jour le profil
 *     description: Modifie les informations du profil utilisateur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/me', authMiddleware, UserController.updateProfile);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Déconnexion
 *     description: Déconnecte l'utilisateur et révoque les tokens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authMiddleware, UserController.logout);

/**
 * @swagger
 * /api/users/verify-email:
 *   post:
 *     tags: [Email]
 *     summary: Envoyer email de vérification
 *     description: Envoie un email de vérification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email envoyé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/verify-email', authMiddleware, UserController.sendVerificationEmail);

/**
 * @swagger
 * /api/users/me/login-history:
 *   get:
 *     tags: [User]
 *     summary: Historique des connexions
 *     description: Récupère l'historique des connexions de l'utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des connexions
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me/login-history', authMiddleware, UserController.getLoginHistory);

/**
 * @swagger
 * /api/users/me/failed-attempts:
 *   get:
 *     tags: [User]
 *     summary: Tentatives de connexion échouées
 *     description: Récupère les tentatives de connexion échouées
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tentatives échouées
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me/failed-attempts', authMiddleware, UserController.getFailedAttempts);

export default router;
