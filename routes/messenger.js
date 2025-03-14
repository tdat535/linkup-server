const express = require("express");
const { getMessenger, createMessenger, getMessengerDetail } = require("../services/messenger-services");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

// Lấy danh sách các cuộc trò chuyện của user
router.get("/getMessenger", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const messengers = await getMessenger(userId);
        
        // Kiểm tra nếu không có lỗi và trả về dữ liệu
        if (!messengers.isSuccess) {
            return res.status(messengers.status).send({
                isSuccess: false,
                status: messengers.status,
                message: messengers.error || "Có lỗi xảy ra."
            });
        }
        res.status(200).send(messengers);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            isSuccess: false,
            status: 500,
            message: "Có lỗi xảy ra khi lấy danh sách cuộc trò chuyện."
        });
    }
});

// Gửi tin nhắn mới
router.post("/createMessenger", authenticateToken, async (req, res) => {
    try {
        const messengerData = {
            senderId: req.user.id,  // Người gửi là user đang đăng nhập
            receiverId: req.body.receiverId,
            content: req.body.content,
            image: req.body.image || null,
        };

        const messenger = await createMessenger(messengerData);

        if (!messenger.isSuccess) {
            return res.status(messenger.status).send({
              isSuccess: false,
              status: messenger.status,
              message: messenger.error || "Có lỗi xảy ra.",
            });
          }
          res.status(200).send(messenger);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            isSuccess: false,
            status: 500,
            message: "Có lỗi xảy ra khi gửi tin nhắn.",
        });
    }
});

// Lấy chi tiết tin nhắn giữa user và người khác
router.get("/getMessengerDetail", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.query.otherUserId;
        const messages = await getMessengerDetail(userId, otherUserId);

        if (!messages.isSuccess) {
            return res.status(messages.status).send({
                isSuccess: false,
                status: messages.status,
                message: messages.error || "Có lỗi xảy ra."
            });
        }
        res.status(200).send(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            isSuccess: false,
            status: 500,
            message: "Có lỗi xảy ra khi lấy danh sách cuộc trò chuyện."
        });
    }
});

module.exports = router;
