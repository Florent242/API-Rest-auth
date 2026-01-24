import { Router } from 'express';
import { asyncHandler } from '#lib/async-handler';
import { authMiddleware } from '#middlewares/auth.middleware';
import { PasswordController } from '#controllers/password.controller';

const router = Router();

// Change password (authenticated user)
router.put('/password', authMiddleware, asyncHandler(PasswordController.changePassword));

export default router;
