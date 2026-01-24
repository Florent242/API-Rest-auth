import { Router } from "express";
import { TokenService } from "#services/token.service";
import { asyncHandler } from "#lib/async-handler";
import { authMiddleware } from "#middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Sessions]
 *     summary: Rafraîchir l'access token
 *     description: Génère un nouvel access token à partir d'un refresh token valide
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: abc123def456...
 *     responses:
 *       200:
 *         description: Access token rafraîchi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                 expiresIn:
 *                   type: integer
 *                   example: 900
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post("/refresh", asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: "Refresh token requis"
    });
  }
  
  const verification = await TokenService.verifyToken(refreshToken);
  
  if (!verification.valid) {
    return res.status(401).json({
      success: false,
      error: `Refresh token invalide: ${verification.reason}`
    });
  }
  
  // En production, on générerait un vrai JWT ici
  // Pour l'instant, on simule
  res.json({
    success: true,
    accessToken: "simulated_access_token_" + Date.now(),
    expiresIn: 900, // 15 minutes
    user: {
      id: verification.user.id,
      email: verification.user.email
    }
  });
}));

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     tags: [Sessions]
 *     summary: Lister les sessions actives
 *     description: Récupère toutes les sessions actives de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/sessions", authMiddleware, asyncHandler(async (req, res) => {
  const sessions = await TokenService.getUserSessions(req.user.id);
  
  res.json({
    success: true,
    count: sessions.length,
    sessions
  });
}));

/**
 * @swagger
 * /auth/sessions/{id}:
 *   delete:
 *     tags: [Sessions]
 *     summary: Révoquer une session
 *     description: Révoque une session spécifique par son ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la session à révoquer
 *     responses:
 *       200:
 *         description: Session révoquée
 *       400:
 *         description: Impossible de révoquer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete("/sessions/:id", authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await TokenService.revokeToken(id);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Impossible de révoquer la session"
    });
  }
  
  res.json({
    success: true,
    message: "Session révoquée avec succès"
  });
}));

/**
 * @swagger
 * /auth/sessions/others:
 *   delete:
 *     tags: [Sessions]
 *     summary: Révoquer les autres sessions
 *     description: Révoque toutes les sessions sauf la session courante
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Autres sessions révoquées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete("/sessions/others", authMiddleware, asyncHandler(async (req, res) => {
  const currentTokenId = req.currentRefreshTokenId; // À définir par le middleware
  
  const result = await TokenService.revokeAllUserTokens(req.user.id, currentTokenId);
  
  res.json({
    success: true,
    message: result.message,
    count: result.count
  });
}));

export default router;
