const express = require("express");
const { register, login, createNewAccessToken, useSearch, logout } = require("../services/user-services");
const authenticateToken = require('../middleware/authenticateToken'); // Đảm bảo đường dẫn đúng
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
        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Đăng ký thành công",
            data: result
        });
        
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
        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Đăng nhập thành công",
            data: result
        });
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

        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Tạo access token thành công",
            data: result
        });
    } catch (error) {
        res.status(401).send({
            IsSuccess: false,
            Status: 401,
            message: "Invalid Refresh Token"
        });
    }
});

router.post("/logout",  async (req, res) => {
    try {
        // Kiểm tra xem refreshToken có được gửi từ client không
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).send({
                isSuccess: false,
                message: "Refresh Token không được cung cấp",
                status: 400
            });
        }

        // Gọi hàm logout và truyền refreshToken vào
        const result = await logout(refreshToken);

        // Kiểm tra kết quả và trả về phản hồi
        if (result.status === 200) {
            res.status(200).send({
                isSuccess: true,
                status: 200,
                message: result.message,
            });
        } else {
            res.status(result.status).send({
                isSuccess: false,
                status: result.status,
                message: result.error,
            });
        }
    } catch (error) {
        res.status(400).send({
            isSuccess: false,
            status: 400,
            message: 'Something went wrong!',
        });
        console.error(error);    
    }
});


router.post("/search", authenticateToken, async (req, res) => {
    try {
        const result = await useSearch(req.body);

        if (result.error) {
            return res.status(result.status).send({
                isSuccess: false,
                status: result.status,
                message: result.error,
            });
        }
        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Đã tìm thấy người dùng",
            data: result
        });
        
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});


module.exports = router;