const express = require("express");
const { getMessenger, createMessenger, getMessengerDetail } = require("../services/messenger-services");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

// Lấy danh sách các cuộc trò chuyện của user
router.get("/getMessenger", authenticateToken, async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).send({
                isSuccess: false,
                status: 400,
                message: "Thiếu thông tin userId.",
            });
        }

        const messengers = await getMessenger(userId);
        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Lấy danh sách cuộc trò chuyện thành công",
            data: messengers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            isSuccess: false,
            status: 500,
            message: "Có lỗi xảy ra khi lấy danh sách cuộc trò chuyện.",
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

        if (messenger.error) {
            return res.status(messenger.status).send({
                isSuccess: false,
                status: messenger.status,
                message: messenger.error,
            });
        }

        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Tạo tin nhắn thành công",
            data: messenger,
        });
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
        const userId = req.query.userId;
        const otherUserId = req.query.otherUserId;

        if (!userId || !otherUserId) {
            return res.status(400).send({
                isSuccess: false,
                status: 400,
                message: "Thiếu thông tin userId hoặc otherUserId.",
            });
        }

        const messages = await getMessengerDetail(userId, otherUserId);

        if (messages.error) {
            return res.status(messages.status).send({
                isSuccess: false,
                status: messages.status,
                message: messages.error,
            });
        }

        res.status(200).send({
            isSuccess: true,
            status: 200,
            message: "Lấy chi tiết tin nhắn thành công",
            data: messages.data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            isSuccess: false,
            status: 500,
            message: "Có lỗi xảy ra khi lấy tin nhắn.",
        });
    }
});

module.exports = router;
