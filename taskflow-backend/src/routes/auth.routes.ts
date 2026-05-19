import express from "express";
import { login,  register } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/login", rateLimit("login", 5, 60), login);
router.post("/register", rateLimit("register", 10, 60), register);

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
