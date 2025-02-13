const express = require("express");
const { getLikes, createLike } = require("../services/like-services");

const router = express.Router();

router.get("/getLikes", async (req, res) => {
    try {
        const likes = await getLikes(req.query.post_id);
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

router.post("/createLike", async (req, res) => {
    try {
        const like = await createLike(req.body);
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