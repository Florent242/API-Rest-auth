import { TwoFactorService } from '#services/twoFactor.service';
import { asyncHandler } from '#lib/async-handler';

export class TwoFactorController {
  /**
   * Enable 2FA - Generate secret and QR code
   */
  static enable = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    
    const result = await TwoFactorService.enable2FA(userId);
    
    res.json({
      success: true,
      message: 'Scan the QR code with your authenticator app and verify with a code',
      data: {
        secret: result.secret,
        qrCode: result.qrCode,
        backupCodes: result.backupCodes
      }
    });
  });

  /**
   * Verify and confirm 2FA activation
   */
  static confirm = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required'
      });
    }

    await TwoFactorService.confirm2FA(userId, code);
    
    res.json({
      success: true,
      message: '2FA enabled successfully'
    });
  });

  /**
   * Verify 2FA code
   */
  static verify = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }

    const result = await TwoFactorService.verify2FA(userId, code);
    
    res.json({
      success: result.valid,
      message: result.valid ? 'Code valid' : result.reason,
      usedBackupCode: result.usedBackupCode
    });
  });

  /**
   * Disable 2FA
   */
  static disable = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required to disable 2FA'
      });
    }

    await TwoFactorService.disable2FA(userId, password);
    
    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  });
}
