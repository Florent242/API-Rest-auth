import { Router } from 'express';
import { TwoFactorController } from '#controllers/twoFactor.controller';
import { authMiddleware } from '#middlewares/auth.middleware';
import { asyncHandler } from '#lib/async-handler';

const router = Router();

// All 2FA routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /2fa/enable:
 *   post:
 *     tags: [2FA]
 *     summary: Activer le 2FA
 *     description: Génère un secret TOTP et un QR code pour configurer l'authentification à deux facteurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Secret et QR code générés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                   example: JBSWY3DPEHPK3PXP
 *                 qrCode:
 *                   type: string
 *                   description: URL du QR code en base64
 *                 backupCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["ABC123", "DEF456"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/enable', TwoFactorController.enable);

/**
 * @swagger
 * /2fa/confirm:
 *   post:
 *     tags: [2FA]
 *     summary: Confirmer l'activation du 2FA
 *     description: Vérifie le code 2FA et active définitivement le 2FA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA activé avec succès
 *       400:
 *         description: Code invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/confirm', TwoFactorController.confirm);

/**
 * @swagger
 * /2fa/verify:
 *   post:
 *     tags: [2FA]
 *     summary: Vérifier un code 2FA
 *     description: Vérifie un code 2FA ou un code de backup
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code valide
 *       400:
 *         description: Code invalide
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/verify', TwoFactorController.verify);

/**
 * @swagger
 * /2fa/disable:
 *   post:
 *     tags: [2FA]
 *     summary: Désactiver le 2FA
 *     description: Désactive l'authentification à deux facteurs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MyPassword123!
 *     responses:
 *       200:
 *         description: 2FA désactivé
 *       400:
 *         description: Mot de passe incorrect
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/disable', TwoFactorController.disable);

export default router;
