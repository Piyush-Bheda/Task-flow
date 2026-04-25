const express = require("express");
const router = express.Router();
const { checkRole } = require("../middlewares/rbac.middleware");
const { getActivityLogs } = require("../controllers/activity.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/", authMiddleware,checkRole(["owner", "admin", "member"]), getActivityLogs);

module.exports = router;