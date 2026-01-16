// import passport from '../config/passport.js';
// import jwt from 'jsonwebtoken';
// import oauthService from '../services/oauthService.js';

class OAuthController {
  googleAuth(req, res, next) {
    res.status(501).json({ error: 'OAuth not fully implemented yet' });
  }

  async googleCallback(req, res, next) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_implemented`);
  }

  async unlinkProvider(req, res) {
    try {
      const userId = req.user.id;
      const { provider } = req.params;

      // await oauthService.unlinkAccount(userId, provider);
      res.json({ message: `Compte ${provider} détaché avec succès` });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLinkedAccounts(req, res) {
    try {
      const userId = req.user.id;
      // const accounts = await oauthService.getLinkedAccounts(userId);
      const accounts = [];
      res.json({ accounts });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

const controller = new OAuthController();
export const googleAuth = controller.googleAuth.bind(controller);
export const googleCallback = controller.googleCallback.bind(controller);
export const unlinkProvider = controller.unlinkProvider.bind(controller);
export const getLinkedAccounts = controller.getLinkedAccounts.bind(controller);
