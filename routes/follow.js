const express = require("express");
const { createFollow, getFollow, unfollow } = require("../services/follow-services");
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

router.put("/unfollow", authenticateToken, async (req, res) => {
    try {
      const followerId = req.user.id;
      const followingId = req.body.followingId;
  
      const result = await unfollow(followerId, followingId);
  
      if (!result.isSuccess) {
        return res.status(result.status).send({
          isSuccess: false,
          status: result.status,
          message: result.error || "Có lỗi xảy ra.",
        });
      }
  
      res.status(200).send(result);
    } catch (error) {
      console.log(error);
      res.status(400).send('Something went wrong!');
    }
  });
  
module.exports = router;