const express = require("express");
const { register, login, createNewAccessToken } = require("../services/user-services");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const result = await register(req.body);

        if (result.error) {
            return res.status(result.status).send({
                isSuccess: false,
                status: result.status,
                message: result.error,
            });
        }

        res.status(200).send(result);
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.post("/login", async (req, res) => {
    try {
        const result = await login(req.body);

        if (result.error) {
            return res.status(result.status).send({
                isSuccess: false,
                status: result.status,
                message: result.error,
            });
        }

        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            isSuccess: false,
            status: 500,
            message: "Đã có lỗi xảy ra, vui lòng thử lại sau!",
        });
    }
});


router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await createNewAccessToken(refreshToken);

        res.status(200).send(result);
    } catch (error) {
        res.status(401).send({
            IsSuccess: false,
            Status: 401,
            message: "Invalid Refresh Token"
        });
    }
});


module.exports = router;