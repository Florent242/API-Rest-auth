import { AuthService } from "#services/auth.service"


export class AuthController {
    static async  verifyEmailController(req, res) {
      const {token} = req.query

      await AuthService.verifyEmail(token)
      res.json({
        success: true,
        message: "Email verified successfully",
      })
    }
}