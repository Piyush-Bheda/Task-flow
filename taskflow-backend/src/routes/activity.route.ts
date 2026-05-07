import express from "express";
import { getActivityLogs } from "../controllers/activity.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole, WorkspaceRole } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin, WorkspaceRole.Member]),
  getActivityLogs,
);

export default router;
