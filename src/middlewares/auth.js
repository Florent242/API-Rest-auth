import jwt from "jsonwebtoken";
import prisma from "#lib/prisma"; // adapte si ton alias est différent

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification manquant",
      });
    }

    const token = authHeader.split(" ")[1];

    // Vérifier si le token est blacklisté
    const blacklistedToken =
      await prisma.blacklistedAccessToken.findUnique({
        where: { token },
      });

    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
      });
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    // Vérifier si l'utilisateur existe et n'est pas désactivé
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        disabledAt: null 
      },
      select: { id: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou compte désactivé'
      });
    }

    req.user = { id: user.id };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur d'authentification",
    });
  }
};

export default authMiddleware;
