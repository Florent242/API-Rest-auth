import { Router } from 'express';
import { TwoFactorController } from '#controllers/twoFactor.controller';
import { authMiddleware } from '#middlewares/auth.middleware';
import { asyncHandler } from '#lib/async-handler';

const router = Router();

// All 2FA routes require authentication
router.use(authMiddleware);

// Enable 2FA - Generate secret and QR code
router.post('/enable', TwoFactorController.enable);

// Confirm 2FA activation with verification code
router.post('/confirm', TwoFactorController.confirm);

// Verify a 2FA code
router.post('/verify', TwoFactorController.verify);

// Disable 2FA
router.post('/disable', TwoFactorController.disable);

export default router;
