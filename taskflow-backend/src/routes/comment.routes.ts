import express from "express";
import { addComment, getComments } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole, WorkspaceRole } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  addComment,
);
router.get(
  "/",
  authMiddleware,
  getComments,
);

export default router;
