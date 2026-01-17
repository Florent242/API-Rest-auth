import { Router } from "express"
import {asyncHandler} from "#lib/async-handler"
import {AuthController} from "#controllers/auth.controller"


const router = Router()

// Vérification d'email
router.post("/verify-email", asyncHandler(AuthController.verifyEmailController))
router.get("/verify/:token", asyncHandler(AuthController.verifyEmailByToken))

// Reset password
router.post("/forgot-password", asyncHandler(AuthController.forgotPassword))
router.post("/reset-password", asyncHandler(AuthController.resetPassword))

// Resend verification
router.post("/resend-verification", asyncHandler(AuthController.resendVerification))


export default router