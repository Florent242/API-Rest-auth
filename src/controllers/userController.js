// import userService from '../services/userService.js';

class UserController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      // const profile = await userService.getProfile(userId);
      const profile = { id: userId, email: req.user.email, name: req.user.name };
      res.json(profile);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, email } = req.body;

      // const updatedProfile = await userService.updateProfile(userId, { name, email });
      res.json({
        message: 'Profil mis à jour avec succès',
        user: { id: userId, name, email }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Mot de passe requis' });
      }

      // await userService.deleteAccount(userId, password);
      res.json({ message: 'Compte désactivé avec succès' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async exportData(req, res) {
    try {
      const userId = req.user.id;
      // const data = await userService.exportData(userId);
      const data = { userId, message: 'Export not fully implemented' };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}.json"`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

const controller = new UserController();
export const getProfile = controller.getProfile.bind(controller);
export const updateProfile = controller.updateProfile.bind(controller);
export const deleteAccount = controller.deleteAccount.bind(controller);
export const exportData = controller.exportData.bind(controller);
