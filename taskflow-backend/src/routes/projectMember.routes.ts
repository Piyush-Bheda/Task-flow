import express from "express";
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  getProjectMemberRole,
} from "../controllers/projectMember.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ProjectRole } from "../types/app.js";

const router = express.Router();

router.get("/:projectId/members", authMiddleware, getProjectMembers);
router.get("/:projectId/members/role", authMiddleware, getProjectMemberRole);
router.post(
  "/:projectId/members",
  authMiddleware,
  addProjectMember
);
router.delete(
  "/:projectId/members/:userId",
  authMiddleware,
  removeProjectMember
);

export default router;