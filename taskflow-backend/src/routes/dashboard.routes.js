const express = require("express");
const router = express.Router();

const { getSummary, getChartData, getIssuesByProject } = require("../controllers/dashboard.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/summary", authMiddleware, getSummary);
router.get("/charts", authMiddleware, getChartData);
router.get("/issues-by-project", authMiddleware, getIssuesByProject);

module.exports = router;