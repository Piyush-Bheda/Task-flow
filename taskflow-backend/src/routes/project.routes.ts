import express from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole, WorkspaceRole } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin]), createProject);
router.get("/", authMiddleware, getProjects);
router.get("/:id", authMiddleware, getProject);
router.patch("/:id", authMiddleware, checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin]), updateProject);
router.delete("/:id", authMiddleware, checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin]), deleteProject);

export default router;
