import userService from "#services/user.service";


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

export default {
  getProfile,
  updateProfile,
  deleteAccount,
};