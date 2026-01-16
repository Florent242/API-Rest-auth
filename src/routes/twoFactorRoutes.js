import express from 'express';
import * as twoFactorController from '../controllers/twoFactorController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/enable', authMiddleware, twoFactorController.enable);
router.post('/confirm', authMiddleware, twoFactorController.confirm);
router.post('/disable', authMiddleware, twoFactorController.disable);
router.post('/verify', authMiddleware, twoFactorController.verify);

export default router;
