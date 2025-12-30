import express from "express";
import * as userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.js";
import { validateUserUpdate } from "../middlewares/validation.js";

const router = express.Router();

// Toutes les routes ici sont protégées par JWT
router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put("/profile", validateUserUpdate, userController.updateProfile);
router.delete("/account", userController.deleteAccount);

export default router;
