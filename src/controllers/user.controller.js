import jwt from "jsonwebtoken";
import userService from "#services/user.service";
import { de } from "zod/locales";


  // GET /user/profile
  const getProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const userProfile = await userService.getUserProfile(userId);

      return res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

  // PUT /user/profile
  const updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedProfile = await userService.updateUserProfile(
        userId,
        updateData
      );

      return res.status(200).json({
        success: true,
        data: updatedProfile,
        message: "Profil mis à jour avec succès",
      });
    } catch (error) {
      if (error.message.includes("email est déjà utilisé")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("Validation error")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /user/account
  const deleteAccount = async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await userService.deleteUserAccount(userId);

      res.clearCookie("refreshToken");

      return res.status(200).json({
        success: true,
        data: result,
        message: "Compte désactivé avec succès. Vous serez déconnecté.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
// Dans user.controller.js
const githubCallback = async (req, res) => {
  try {
    const user = req.user; // Injecté par Passport après le succès de la stratégie

    if (!user) {
      return res.status(401).json({ success: false, message: "Auth échouée" });
    }

    // Génération du tokens JWT
        const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // tu peux ajuster la durée
    );

    return res.status(200).json({
      success: true,
      message: "Authentification GitHub réussie",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName
      },
      tokens: accessToken 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// MODIFIEZ L'EXPORT À LA FIN :
export default {
  getProfile,
  updateProfile,
  deleteAccount,
  githubCallback, 
};