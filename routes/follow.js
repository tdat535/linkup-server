const express = require("express");
const { createFollow, getFollow, acceptFollow } = require("../services/follow-services");
const authenticateToken = require('../middleware/authenticateToken'); // Đảm bảo đường dẫn đúng

const router = express.Router();

router.post("/createFollow", authenticateToken, async (req, res) => {  
    try {
        const followData = {
            followerId: req.user.id,
            followingId: req.body.followingId
        }
        const Follow = await createFollow(followData);
        if (!Follow.isSuccess) {
            return res.status(Follow.status).send({
              isSuccess: false,
              status: Follow.status,
              message: Follow.error || "Có lỗi xảy ra.",
            });
          }
          res.status(200).send(Follow);
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.get("/getFollow", authenticateToken, async (req, res) => {  
    try {
        const userId = req.user.id;
        const Follow = await getFollow(userId);
        if (!Follow.isSuccess) {
            return res.status(Follow.status).send({
              isSuccess: false,
              status: Follow.status,
              message: Follow.error || "Có lỗi xảy ra.",
            });
          }
          res.status(200).send(Follow);
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

// Route để chấp nhận yêu cầu theo dõi
// router.post("/acceptFollow", authenticateToken, async (req, res) => {  
//     try {
//         const followData = {ê
//             followerId: req.user.id,
//             followingId: req.body.followingId
//         }
//         const FollowResponse = await acceptFollow(followData);

//         if (FollowResponse.error) {
//             return res.status(FollowResponse.status).send({
//                 isSuccess: false,
//                 status: FollowResponse.status,
//                 message: FollowResponse.error
//             });
//         }

//         res.status(200).send({
//             isSuccess: true,
//             status: 200,
//             message: FollowResponse.message,
//             data: FollowResponse,
//         });
//     } catch (error) {
//         res.status(400).send('Something went wrong!');
//         console.log(error);    
//     }
// });


module.exports = router;