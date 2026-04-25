const express = require("express");
const router = express.Router();
const { checkRole } = require("../middlewares/rbac.middleware");

const {
  addComment,
  getComments,
} = require("../controllers/comment.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, checkRole(["owner", "admin", "member"]), addComment);
router.get("/", authMiddleware, checkRole(["owner", "admin", "member"]), getComments);

module.exports = router;