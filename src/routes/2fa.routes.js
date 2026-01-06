import express from "express";
import { enable2FA, verify2FACode, disable2FA } from "#controllers/2fa.controller";
import authMiddleware from "#middlewares/auth";

const router = express.Router();

router.use(authMiddleware);

router.post("/enable", enable2FA);
router.post("/verify", verify2FACode);
router.post("/disable", disable2FA);

export default router;