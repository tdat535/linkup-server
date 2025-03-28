const express = require("express");
const { getLikes, createLike } = require("../services/like-services");
const authenticateToken = require('../middleware/authenticateToken'); // Đảm bảo đường dẫn đúng
const router = express.Router();

router.get("/getLikes", authenticateToken, async (req, res) => {
    try {
        const likes = await getLikes(req.query.postId);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Lấy danh sách lượt thích thành công",
            data: likes
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.post("/createLike", authenticateToken, async (req, res) => {
    try {
        const likeData = {
            userId: req.user.id,
            postId: req.body.postId
        }
        const like = await createLike(likeData);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Tạo lượt thích cho bài viết thành công",
            data: like
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

module.exports = router;