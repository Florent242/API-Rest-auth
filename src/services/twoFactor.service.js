import { prisma } from '#lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class TwoFactorService {
  /**
   * Enable 2FA for a user
   */
  static async enable2FA(userId) {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `API Auth (${userId})`,
      length: 32
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Update user with 2FA secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: backupCodes.join(',')
      }
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify 2FA code
   */
  static async verify2FA(userId, code) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.twoFactorSecret) {
      return { valid: false, reason: '2FA not enabled' };
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (verified) {
      return { valid: true };
    }

    // Check backup codes
    if (user.twoFactorBackupCodes) {
      const backupCodes = user.twoFactorBackupCodes.split(',');
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorBackupCodes: backupCodes.join(',') }
        });
        return { valid: true, usedBackupCode: true };
      }
    }

    return { valid: false, reason: 'Invalid code' };
  }

  /**
   * Confirm and activate 2FA
   */
  static async confirm2FA(userId, code) {
    const verification = await this.verify2FA(userId, code);
    
    if (!verification.valid) {
      throw new Error('Invalid verification code');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabledAt: new Date() }
    });

    return { success: true };
  }

  /**
   * Disable 2FA
   */
  static async disable2FA(userId, password) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password before disabling
    const { verifyPassword } = await import('#lib/password');
    const isValid = await verifyPassword(user.password, password);
    
    if (!isValid) {
      throw new Error('Invalid password');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
        twoFactorBackupCodes: null
      }
    });

    return { success: true };
  }
}
