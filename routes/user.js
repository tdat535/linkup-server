const express = require("express");
const { register, login, createNewAccessToken } = require("../services/user-services");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const user = await register(req.body);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Đăng ký người dùng thành công",
            data: user
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.post("/login", async (req, res) => {
    try {
        const result = await login(req.body);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Đăng nhập thành công",
            data: result
        });
        } catch (error) {
            res.status(400).send('Something went wrong!');
            console.log(error);  
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