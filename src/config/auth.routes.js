import express from "express";
import passport from "passport";
import { githubCallback } from "../controllers/user.controller.js";

const router = express.Router();

// Démarrer OAuth GitHub (publique)
router.get("/github", passport.authenticate("github", { session: false }));

// Callback GitHub (publique)
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  githubCallback
);

export default router;
