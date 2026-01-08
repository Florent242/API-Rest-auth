import prisma from "#lib/prisma";

export class SessionService {
  // Cette fonction est comme une secrétaire : 
  // elle prend les infos et les range dans le bon classeur (la DB)
  static async createRefreshToken(data) {
    return await prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent || null, // Optionnel
        ipAddress: data.ipAddress || null  // Optionnel
      }
    });
  }
}