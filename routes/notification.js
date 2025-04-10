const express = require("express");
const { getNotification } = require("../services/notification-services");
const authenticateToken = require('../middleware/authenticateToken'); // Đảm bảo đường dẫn đúng

const router = express.Router();

router.get("/getNotification", authenticateToken, async (req, res) => {  
    try {
        const userId = req.user.id;
        const notis = await getNotification(userId);
        if (!notis.isSuccess) {
            return res.status(notis.status).send({
              isSuccess: false,
              status: notis.status,
              message: notis.error || "Có lỗi xảy ra.",
            });
          }
          res.status(200).send(notis);
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});



module.exports = router;