const Messenger = require('../models/messenger');
const Follow = require('../models/follow');
const User = require('../models/user');
const { Op } = require("sequelize");

const createMessenger = async (messenger) => {
    try {
        const { senderId, receiverId } = messenger;

        // Kiểm tra xem người gửi có follow người nhận với trạng thái 'accepted'
        const followStatusReceiverToSender = await Follow.findOne({
            where: { followerId: senderId, followingId: receiverId, status: 'accepted' }
        });

        const followStatusSenderToReceiver = await Follow.findOne({
            where: { followerId: receiverId, followingId: senderId, status: 'accepted' }
        });

        // Nếu không có quan hệ follow accepted, không cho phép gửi tin nhắn
        if (!followStatusReceiverToSender || !followStatusSenderToReceiver) {
            return { error: "Không thể gửi tin nhắn, bạn chưa có quan hệ follow với người này.", status: 400 };
        }

        // Tạo tin nhắn mới
        const newMessenger = await Messenger.create({
            content: messenger.content,
            image: messenger.image,
            senderId: messenger.senderId,
            receiverId: messenger.receiverId
        });

        return {
            id: newMessenger.id,
            content: newMessenger.content,
            image: newMessenger.image,
            senderId: newMessenger.senderId,
            receiverId: newMessenger.receiverId
        };
    } catch (error) {
        throw new Error('Error creating messenger: ' + error.message);
    }
};

// Lấy danh sách những người đã nhắn tin với user nhưng không bị trùng
const getMessenger = async (userId) => {
    try {
        const messengers = await Messenger.findAll({
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }]
            },
            order: [['createdAt', 'DESC']],
        });

        if (messengers.length === 0) {
            return { message: "Không có cuộc trò chuyện nào.", data: [] };
        }

        // Lưu danh sách unique người đã nhắn tin với user
        const uniqueConversations = new Map();

        for (const msg of messengers) {
            const conversationWith = msg.senderId === userId ? msg.receiverId : msg.senderId;

            // Kiểm tra nếu đã có cuộc trò chuyện này thì chỉ cập nhật nếu tin nhắn mới hơn
            if (!uniqueConversations.has(conversationWith) || uniqueConversations.get(conversationWith).lastMessageTime < msg.createdAt) {
                const userInfo = await User.findByPk(conversationWith, { attributes: ['id', 'username'] });

                uniqueConversations.set(conversationWith, {
                    id: userInfo.id,
                    username: userInfo.username,
                    avatar: userInfo.avatar,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt
                });
            }
        }

        return {
            success: true,
            data: Array.from(uniqueConversations.values())
        };
    } catch (error) {
        throw new Error('Error getting messenger list: ' + error.message);
    }
};


// Lấy chi tiết tin nhắn giữa user và một người cụ thể
const getMessengerDetail = async (userId, otherUserId) => {
    try {
        // Kiểm tra quan hệ follow hợp lệ
        const followStatus = await Follow.findOne({
            where: {
                [Op.or]: [
                    { followerId: userId, followingId: otherUserId, status: 'accepted' },
                    { followerId: otherUserId, followingId: userId, status: 'accepted' }
                ]
            }
        });

        if (!followStatus) {
            return { error: "Bạn không có quyền xem tin nhắn này do không có quan hệ follow hợp lệ.", status: 400 };
        }

        // Lấy tin nhắn giữa hai người
        const messages = await Messenger.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        return {
            success: true,
            data: messages
        };
    } catch (error) {
        throw new Error('Error getting messenger details: ' + error.message);
    }
};

module.exports = { createMessenger, getMessenger, getMessengerDetail };
