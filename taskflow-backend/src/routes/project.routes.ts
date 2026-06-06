import express from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  getProjectStats,
  getProjectIssues,
  getProjectActivity,
  updateProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole, WorkspaceRole } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin]), createProject);
router.get("/", authMiddleware, getProjects);
router.get("/:id", authMiddleware, getProject);
router.get("/:id/stats", authMiddleware, getProjectStats);
router.get("/:id/issues", authMiddleware, getProjectIssues);
router.get("/:id/activity", authMiddleware, getProjectActivity);
router.patch("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
