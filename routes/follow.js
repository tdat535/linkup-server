const express = require("express");
const { createFollow } = require("../services/follow-services");
const { Model } = require("sequelize");

const router = express.Router();

router.post("/createPost", async (req, res) => {  
    try {
        const Follow = await createFollow(req.body);

        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Tạo bài viết thành công",
            data: Follow
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

module.exports = router;