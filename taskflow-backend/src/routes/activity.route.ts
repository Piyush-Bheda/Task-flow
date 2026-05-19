import express from "express";
import { getActivityLogs, getRecentActivity } from "../controllers/activity.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getActivityLogs);

router.get("/recent", authMiddleware, getRecentActivity);

export default router;
