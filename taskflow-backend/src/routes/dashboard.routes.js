const express = require("express");
const router = express.Router();

const { getSummary } = require("../controllers/dashboard.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkRole } = require("../middlewares/rbac.middleware");


router.get("/summary", authMiddleware, checkRole(["owner", "admin", "member"]), getSummary);

module.exports = router;