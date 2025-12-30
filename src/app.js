import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import "./config/passport.js"; 

import { httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import authMiddleware from "#middlewares/auth";
import { validateUserUpdate } from "#middlewares/validation";

// Import des contrôleurs et routes
import userController from "./controllers/user.controller.js";
import authRoutes from './routes/auth.routes.js';

const app = express();

//Middlewares de base
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());

// Initialisation Passport
app.use(passport.initialize());

//Routes Publiques (Accessibles sans Token)
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Express opérationnelle" });
});

// route /auth/github et /auth/github/callback
app.use("/auth", authRoutes);

//Middlewares de Protection 
// À partir d'ici, toutes les routes nécessitent un token JWT valide
app.use(authMiddleware);


// Profil utilisateur
app.get('/profile', userController.getProfile);
app.put('/profile', validateUserUpdate, userController.updateProfile);

// Gestion du compte
app.delete('/account', userController.deleteAccount);

// Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;