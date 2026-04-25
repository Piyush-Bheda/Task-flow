const express = require("express");
const router = express.Router();
    
const {
    createWorkspace,
    getUserWorkspaces,
    addMember,
} = require("../controllers/workspace.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");

const { checkRole } = require("../middlewares/rbac.middleware");

// CREATE
router.post("/", authMiddleware, createWorkspace);

// GET USER WORKSPACES
router.get("/", authMiddleware, getUserWorkspaces);

// ADD MEMBER
router.post("/:workspaceId/add-member", authMiddleware, checkRole(["owner", "admin"]), addMember);

module.exports = router;