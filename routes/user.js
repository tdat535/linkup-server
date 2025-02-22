const express = require("express");
const { register, login, createNewAccessToken ,useSearch} = require("../services/user-services");
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

router.post("/logout", async (req, res) => {
    const { refreshToken } = req.body; // Lấy refreshToken từ body (hoặc bạn có thể lấy từ header)

    try {

        const result = await createNewAccessToken(refreshToken);
l
        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Logout successfully",
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.post("/search", async(req,res)=>{
    try {
        const search = await useSearch(req.body);
        if (search.error){
            return res.status(search.status).send({
                isSuccess:false,
                status: search.status,
                message: search.error
            })
        }
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "tìm thấy thành công thành công",
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});
module.exports = router;