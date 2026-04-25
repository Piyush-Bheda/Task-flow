const express = require("express");
const router = express.Router();
const { checkRole } = require("../middlewares/rbac.middleware");

const {
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue,
} = require("../controllers/issue.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, checkRole(["owner", "admin", "member"]), createIssue);
router.get("/", authMiddleware, getIssues);
router.patch("/:id", authMiddleware, checkRole(["owner", "admin", "member"]), updateIssue);
router.delete("/:id", authMiddleware, checkRole(["owner", "admin"]), deleteIssue);

module.exports = router;