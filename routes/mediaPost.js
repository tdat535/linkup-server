const express = require("express");
const { getMediaPosts, createMediaPost, getAll } = require("../services/mediaPost-services");

const router = express.Router();

router.get("/getPost", async (req, res) => {
    try {
        const mediaPosts = await getMediaPosts(req.query.user_id);
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

router.get("/getAll", async (req, res) => {
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

router.post("/createPost", async (req, res) => {  
    try {
        const mediaPost = await createMediaPost(req.body);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Tạo bài viết thành công",
            data: mediaPost
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

module.exports = router;