import prisma from "#lib/prisma";
import { verify2FA, generate2FASecret } from "#services/2fa.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST /auth/2fa/enable
export const enable2FA = async (req, res) => {
  const userId = req.user.id;
  const secret = await generate2FASecret(userId);
  res.json({ success: true, message: "2FA activé", otpauth_url: secret.otpauth_url });
};

// POST /auth/2fa/verify
export const verify2FACode = async (req, res) => {
  const { token } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user || !user.twoFactorSecret)
    return res.status(400).json({ success: false, message: "2FA non configuré" });

  const valid = await verify2FA(user, token);

  if (!valid) return res.status(401).json({ success: false, message: "Code 2FA invalide" });

  // Générer un JWT
  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.json({ success: true, accessToken });
};

// POST /auth/2fa/disable
export const disable2FA = async (req, res) => {
  const { password, token } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user || !user.twoFactorEnabledAt) return res.status(400).json({ success: false, message: "2FA non activé" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).json({ success: false, message: "Mot de passe incorrect" });

  const validToken = await verify2FA(user, token);
  if (!validToken) return res.status(401).json({ success: false, message: "Code 2FA invalide" });

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabledAt: null, twoFactorSecret: null } });
  res.json({ success: true, message: "2FA désactivé" });
};
