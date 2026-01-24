import { Router } from "express"
import {asyncHandler} from "#lib/async-handler"
import {AuthController} from "#controllers/auth.controller"


const router = Router()

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags: [Email]
 *     summary: Envoyer un email de vérification
 *     description: Envoie un email de vérification à l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email envoyé avec succès
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/verify-email", asyncHandler(AuthController.verifyEmailController))

/**
 * @swagger
 * /auth/verify/{token}:
 *   get:
 *     tags: [Email]
 *     summary: Vérifier l'email avec le token
 *     description: Vérifie l'email de l'utilisateur avec le token reçu par email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de vérification reçu par email
 *     responses:
 *       200:
 *         description: Email vérifié avec succès
 *       400:
 *         description: Token invalide ou expiré
 */
router.get("/verify/:token", asyncHandler(AuthController.verifyEmailByToken))

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Email]
 *     summary: Demander un reset de password
 *     description: Envoie un email avec un lien pour réinitialiser le mot de passe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email de reset envoyé
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/forgot-password", asyncHandler(AuthController.forgotPassword))

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Email]
 *     summary: Réinitialiser le mot de passe
 *     description: Réinitialise le mot de passe avec le token reçu par email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass123!
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré
 */
router.post("/reset-password", asyncHandler(AuthController.resetPassword))

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags: [Email]
 *     summary: Renvoyer l'email de vérification
 *     description: Renvoie un nouvel email de vérification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email renvoyé avec succès
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/resend-verification", asyncHandler(AuthController.resendVerification))


export default router