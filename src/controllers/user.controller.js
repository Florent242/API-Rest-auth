const userService = require('../services/user.service');

class UserController {
  // GET /user/profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id; // Récupéré du middleware d'authentification
      const userProfile = await userService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /user/profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      const updatedProfile = await userService.updateUserProfile(userId, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedProfile,
        message: 'Profil mis à jour avec succès'
      });
    } catch (error) {
      if (error.message.includes('email est déjà utilisé')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /user/account
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const result = await userService.deleteUserAccount(userId);
      
      // Supprimer le token de rafraîchissement du client
      res.clearCookie('refreshToken');
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Compte désactivé avec succès. Vous serez déconnecté.'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();