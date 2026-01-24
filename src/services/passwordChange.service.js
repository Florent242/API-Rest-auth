import { prisma } from '#lib/prisma';
import { verifyPassword, hashPassword } from '#lib/password';
import { UnauthorizedException, BadRequestException } from '#lib/exceptions';

export class PasswordChangeService {
    /**
     * Change user password
     */
    static async changePassword(userId, oldPassword, newPassword) {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify old password
        const isValid = await verifyPassword(user.password, oldPassword);
        if (!isValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            throw new BadRequestException('New password must be at least 8 characters long');
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password and revoke all refresh tokens
        await prisma.$transaction(async (tx) => {
            // Update password
            await tx.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                    passwordChangedAt: new Date()
                }
            });

            // Revoke all refresh tokens for this user
            await tx.refreshToken.updateMany({
                where: {
                    userId: userId,
                    revokedAt: null
                },
                data: {
                    revokedAt: new Date()
                }
            });
        });

        return { success: true };
    }
}
