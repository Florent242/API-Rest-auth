import express from 'express';
import * as oauthController from '../controllers/oauthController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/google', oauthController.googleAuth);
router.get('/google/callback', oauthController.googleCallback);
router.delete('/unlink/:provider', authMiddleware, oauthController.unlinkProvider);
router.get('/linked', authMiddleware, oauthController.getLinkedAccounts);

export default router;
