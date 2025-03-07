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
          as: "Sender",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: User,
          as: "Receiver",
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
      const conversationWith =
        msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!uniqueConversations.has(conversationWith)) {
        uniqueConversations.set(conversationWith, {
          sender: {
            id: msg.senderId,
            username: msg.Sender.username,
            avatar: msg.Sender.avatar,
          },
          receiver: {
            id: msg.receiverId,
            username: msg.Receiver.username,
            avatar: msg.Receiver.avatar,
          },
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        });
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
