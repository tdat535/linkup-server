const express = require("express");
const { createFollow, getFollow } = require("../services/follow-services");
const { Model } = require("sequelize");

const router = express.Router();

router.post("/createFollow", async (req, res) => {  
    try {
        const Follow = await createFollow(req.body);
        if (Follow.error){
            return res.status(Follow.status).send({
                isSuccess:false,
                status: Follow.status,
                message: Follow.error
            })
        }
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Theo dõi thành công",
            data: Follow
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.get("/getFollow", async (req, res) => {  
    try {
        const Follow = await getFollow();

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