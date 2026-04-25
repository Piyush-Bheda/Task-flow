const express = require("express");
const router = express.Router();
const { checkRole } = require("../middlewares/rbac.middleware");

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/", authMiddleware,checkRole(["owner", "admin"]) ,createProject);

router.get("/", authMiddleware, getProjects);

router.patch("/:id", authMiddleware, checkRole(["owner", "admin"]), updateProject);

router.delete("/:id", authMiddleware, checkRole(["owner", "admin"]), deleteProject);

module.exports = router;