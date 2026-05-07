import express from "express";
import { createIssue, deleteIssue, getIssues, updateIssue } from "../controllers/issue.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole, WorkspaceRole } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin, WorkspaceRole.Member]),
  createIssue,
);
router.get("/", authMiddleware, getIssues);
router.patch(
  "/:id",
  authMiddleware,
  checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin, WorkspaceRole.Member]),
  updateIssue,
);
router.delete("/:id", authMiddleware, checkRole([WorkspaceRole.Owner, WorkspaceRole.Admin]), deleteIssue);

export default router;
