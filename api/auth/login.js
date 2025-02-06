const express = require("express");
const { login } = require("../../services/user-services");
const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const token = await login(req.body);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;