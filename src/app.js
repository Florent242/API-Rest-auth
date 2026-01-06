import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import "./config/passport.js"; // Configuration GitHub OAuth

import { httpLogger } from "./lib/logger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import authMiddleware from "./middlewares/auth.js";
import { validateUserUpdate } from "./middlewares/validation.js";

import userController from "./controllers/user.controller.js";
import authRoutes from "./routes/auth.routes.js";
import twoFARoutes from "./routes/2fa.routes.js"; // Import correct

const app = express();

// Middlewares de base
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());

// Initialisation Passport
app.use(passport.initialize());

// Routes publiques
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Express opérationnelle" });
});

// Routes OAuth GitHub
app.use("/auth", authRoutes);

// Routes 2FA protégées par JWT
app.use("/auth/2fa", authMiddleware, twoFARoutes);

// Middleware d’authentification globale pour les autres routes
app.use(authMiddleware);

// Profil utilisateur
app.get("/profile", userController.getProfile);
app.put("/profile", validateUserUpdate, userController.updateProfile);

// Gestion du compte
app.delete("/account", userController.deleteAccount);

// Handlers d'erreur
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
