const express = require("express");
const { getComments, createComment } = require("../services/comment-services");
const authenticateToken = require('../middleware/authenticateToken'); // Đảm bảo đường dẫn đúng
const router = express.Router();

router.get("/getComments", authenticateToken, async (req, res) => {
    try {
        const comments = await getComments(req.query.postId);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Lấy danh sách bình luận thành công",
            data: comments
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.post("/createComment", authenticateToken, async (req, res) => {
    try {
        const comment = await createComment(req.body);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Tạo bình luận thành công",
            data: comment
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

module.exports = router;