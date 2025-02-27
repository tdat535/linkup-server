const express = require("express");
const { createFollow, getFollow, acceptFollow } = require("../services/follow-services");
const authenticateToken = require('../middleware/authenticateToken'); // Đảm bảo đường dẫn đúng

const router = express.Router();

router.post("/createFollow", authenticateToken, async (req, res) => {  
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

router.get("/getFollow", authenticateToken, async (req, res) => {  
    try {
        const Follow = await getFollow(req.query.userId);

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

// Route để chấp nhận yêu cầu theo dõi
router.post("/acceptFollow", authenticateToken, async (req, res) => {  
    try {
        const { followerId, followingId } = req.body;

        const FollowResponse = await acceptFollow(followerId, followingId);

        if (FollowResponse.error) {
            return res.status(FollowResponse.status).send({
                isSuccess: false,
                status: FollowResponse.status,
                message: FollowResponse.error
            });
        }

        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: FollowResponse.message,
            data: FollowResponse,
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});


module.exports = router;