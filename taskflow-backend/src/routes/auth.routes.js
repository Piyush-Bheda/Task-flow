const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { register, login } = require("../controllers/auth.controller");
const { checkRole } = require("../middlewares/rbac.middleware");


router.post('/register', register);

router.post("/login", checkRole(["owner", "admin", "member"]), login);

router.get("/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;

