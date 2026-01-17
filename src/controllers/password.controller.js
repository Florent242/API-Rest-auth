import { PasswordChangeService } from '#services/passwordChange.service';
import { asyncHandler } from '#lib/async-handler';

export class PasswordController {
    /**
     * Change user password
     * PUT /auth/password
     */
    static changePassword = asyncHandler(async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Old password and new password are required'
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                error: 'New password must be different from old password'
            });
        }

        await PasswordChangeService.changePassword(userId, oldPassword, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully. All other sessions have been revoked.'
        });
    });
}
