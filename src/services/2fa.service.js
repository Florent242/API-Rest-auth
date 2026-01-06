import speakeasy from "speakeasy";
import prisma from "#lib/prisma";

export const generate2FASecret = async (userId) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret.base32, twoFactorEnabledAt: new Date() },
  });
  return secret; // tu peux retourner secret.otpauth_url pour QR code
};

export const verify2FA = async (user, token) => {
  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });
};
