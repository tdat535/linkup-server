const express = require("express");
const { login } = require("../../services/user-services");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const user = await register(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;