import express from "express";
import passport from "passport";
import userController from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @route   GET /auth/github
 * @desc    Démarrer le processus d'authentification GitHub
 * @access  Public
 */
router.get(
  "/github", 
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

/**
 * @route   GET /auth/github/callback
 * @desc    Point de retour après validation GitHub
 * @access  Public
 */
router.get(
  "/github/callback",
  // 1. Passport valide le code reçu de GitHub et récupère le profil
  passport.authenticate("github", { 
    session: false, 
    failureRedirect: "/login" 
  }),
  // 2. Si succès, on passe au contrôleur pour générer le JWT
  userController.githubCallback
);

export default router;