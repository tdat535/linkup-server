const express = require("express");
const { getMediaPosts, createMediaPost, getAll } = require("../services/mediaPost-services");
const authenticateToken = require('../middleware/authenticateToken'); // Đảm bảo đường dẫn đúng
const router = express.Router();

router.get("/getPost", authenticateToken,  async (req, res) => {
    try {
        const userId = req.query.user_id;
        if (!userId) {
            return res.status(400).send({
                isSuccess: false,
                message: 'Missing user_id parameter'
            });
        }

        const mediaPosts = await getMediaPosts(userId); // Lấy bài viết từ database
        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Lấy danh sách bài viết thành công",
            data: mediaPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            isSuccess: false,
            message: 'Lỗi khi lấy bài viết, vui lòng thử lại sau.'
        });
    }
});

router.get("/getAll",  async (req, res) => {
    try {
        const mediaPosts = await getAll();
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Lấy danh sách bài viết thành công",
            data: mediaPosts
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.post("/createPost", authenticateToken, async (req, res) => {  
    try {
        if (!req.body.content || !req.body.userId) {
            return res.status(400).send({
                isSuccess: false,
                message: 'Thiếu thông tin bài viết hoặc người dùng.'
            });
        }
        
        const mediaPost = await createMediaPost(req.body);
        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Tạo bài viết thành công",
            data: mediaPost
        });
    } catch (error) {
        console.error('Error creating media post:', error);
        res.status(400).send({
            isSuccess: false,
            message: 'Đã có lỗi xảy ra khi tạo bài viết. Chi tiết: ' + error.message
        });
    }
});


module.exports = router;