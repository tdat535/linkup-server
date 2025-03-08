const Messenger = require("../models/messenger");
const Follow = require("../models/follow");
const User = require("../models/user");
const { Op } = require("sequelize");

const createMessenger = async (messenger) => {
  try {
    const { senderId, receiverId } = messenger;

    // Kiểm tra quan hệ follow hai chiều
    const followStatusReceiverToSender = await Follow.findOne({
      where: {
        followerId: senderId,
        followingId: receiverId,
        status: "accepted",
      },
    });

    const followStatusSenderToReceiver = await Follow.findOne({
      where: {
        followerId: receiverId,
        followingId: senderId,
        status: "accepted",
      },
    });

    if (!followStatusReceiverToSender || !followStatusSenderToReceiver) {
      return {
        error: "Hai người phải follow nhau mới có thể nhắn tin.",
        status: 400,
      };
    }

    const newMessenger = await Messenger.create({
      content: messenger.content,
      image: messenger.image,
      senderId,
      receiverId,
    });

    return newMessenger;
  } catch (error) {
    throw new Error("Lỗi khi gửi tin nhắn: " + error.message);
  }
};

// Lấy danh sách những người đã nhắn tin với user nhưng không bị trùng
const getMessenger = async (userId) => {
  try {
    if (!userId) {
      return {
        isSuccess: false,
        status: 400,
        error: "Thiếu thông tin userId.",
      };
    }

    const messengers = await Messenger.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender", // Chắc chắn trùng với alias trong model
          attributes: ["id", "username", "avatar"],
        },
        {
          model: User,
          as: "receiver", // Chắc chắn trùng với alias trong model
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    if (messengers.length === 0) {
      return {
        isSuccess: true,
        status: 200,
        message: "Không có cuộc trò chuyện nào.",
        data: [],
      };
    }

    // Tạo danh sách cuộc trò chuyện không trùng
    const uniqueConversations = new Map();

    for (const msg of messengers) {
      if (!msg.sender || !msg.receiver) {
        console.error(
          `Lỗi: Tin nhắn ID ${msg.id} không có sender hoặc receiver.`
        );
        continue; // Bỏ qua tin nhắn lỗi
      }

      // Tạo một khóa duy nhất bằng cách sắp xếp userId
      const conversationKey = [msg.senderId, msg.receiverId].sort().join("_");

      // Nếu cuộc trò chuyện chưa có trong danh sách, thêm vào
      if (!uniqueConversations.has(conversationKey)) {
        uniqueConversations.set(conversationKey, {
          sender: {
            id: msg.sender.id,
            username: msg.sender.username,
            avatar: msg.sender.avatar,
          },
          receiver: {
            id: msg.receiver.id,
            username: msg.receiver.username,
            avatar: msg.receiver.avatar,
          },
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        });
      } else {
        // Nếu đã tồn tại, cập nhật tin nhắn mới nhất
        const existingConversation = uniqueConversations.get(conversationKey);
        if (
          new Date(msg.createdAt) >
          new Date(existingConversation.lastMessageTime)
        ) {
          existingConversation.lastMessage = msg.content;
          existingConversation.lastMessageTime = msg.createdAt;
        }
      }
    }

    // Chuyển danh sách thành mảng và sắp xếp theo lastMessageTime mới nhất lên trên
    const sortedConversations = Array.from(uniqueConversations.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách cuộc trò chuyện thành công",
      data: sortedConversations,
    };
  } catch (error) {
    return {
      isSuccess: false,
      status: 500,
      error: `Error getting messenger list: ${error.message}`,
    };
  }
};

// Lấy chi tiết tin nhắn giữa user và một người cụ thể
const getMessengerDetail = async (userId, otherUserId) => {
  try {
    if (!userId || !otherUserId) {
      return {
        isSuccess: false,
        status: 400,
        error: "Thiếu thông tin userId hoặc otherUserId.",
      };
    }

    // Kiểm tra quan hệ follow hợp lệ
    const followStatus = await Follow.findOne({
      where: {
        [Op.or]: [
          { followerId: userId, followingId: otherUserId, status: "accepted" },
          { followerId: otherUserId, followingId: userId, status: "accepted" },
        ],
      },
    });

    if (!followStatus) {
      return {
        isSuccess: false,
        status: 400,
        error:
          "Bạn không có quyền xem tin nhắn này do không có quan hệ follow hợp lệ.",
      };
    }

    // Lấy tin nhắn giữa hai người cùng với thông tin người gửi và người nhận
    const messages = await Messenger.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      order: [["createdAt", "ASC"]], // ASC để tin nhắn cũ nhất ở trên, mới nhất ở dưới
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách tin nhắn thành công",
      data: messages,
    };
  } catch (error) {
    return {
      isSuccess: false,
      status: 500,
      error: `Error getting messenger details: ${error.message}`,
    };
  }
};

module.exports = { createMessenger, getMessenger, getMessengerDetail };
