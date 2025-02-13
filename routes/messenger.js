const express = require("express");
const { getMessenger, createMessenger } = require("../services/messenger-services");

const router = express.Router();

router.get("/getMessenger", async (req, res) => {
    try {
        const messengers = await getMessenger(req.query.sender_id, req.query.receiver_id);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Lấy danh sách tin nhắn thành công",
            data: messengers
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

router.post("/createMessenger", async (req, res) => {
    try {
        const messenger = await createMessenger(req.body);
        res.status(200).send({
            isSuccess:true,
            status: 200,
            message: "Tạo tin nhắn thành công",
            data: messenger
        });
    } catch (error) {
        res.status(400).send('Something went wrong!');
        console.log(error);    
    }
});

module.exports = router;