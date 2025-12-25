import express from "express";
import cors from "cors";
import helmet from "helmet";

import { httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import authMiddleware from "#middlewares/auth";
import {validateUserUpdate}  from "#middlewares/validation";
import userController from "#controllers/user.controller";
// Les routes seront importez ici

// import userRoutes from "#routes/user.routes";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Express opérationnelle" });
});

// app.use("/api/users", userRoutes);

// Toutes les routes nécessitent une authentification
app.use(authMiddleware);

// GET /user/profile
app.get('/profile', userController.getProfile);

// PUT /user/profile
app.put('/profile', validateUserUpdate, userController.updateProfile);

// DELETE /user/account
app.delete('/account', userController.deleteAccount);

// Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app; // CRITIQUE : On exporte l'objet sans le démarrer