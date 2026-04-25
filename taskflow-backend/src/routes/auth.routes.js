const express = require('express');
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { register, login } = require("../controllers/auth.controller");

router.post('/register', register);

router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;

