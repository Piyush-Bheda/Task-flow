import express from "express";
import {
  addMember,
  createWorkspace,
  getUserWorkspaces,
} from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole, WorkspaceRole } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getUserWorkspaces);
router.post(
  "/:workspaceId/add-member",
  authMiddleware,
  checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin]),
  addMember,
);

export default router;
