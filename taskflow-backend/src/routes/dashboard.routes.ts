import express from "express";
import {
  getChartData,
  getIssuesByProject,
  getStats,
  getSummary,
} from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/summary", authMiddleware, getSummary);
router.get("/charts", authMiddleware, getChartData);
router.get("/issues-by-project", authMiddleware, getIssuesByProject);
router.get("/stats",authMiddleware, getStats);

export default router;
