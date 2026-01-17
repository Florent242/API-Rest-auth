import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/account', authMiddleware, userController.deleteAccount);
router.get('/export', authMiddleware, userController.exportData);

export default router;
