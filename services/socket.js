// socket.js
const { Server } = require("socket.io");
const Messenger = require("../models/messenger");
const User = require("../models/user");
const Comment = require("../models/comment");
const Like = require("../models/like");
const Follow = require("../models/follow");
const MediaPost = require("../models/mediaPost");
const Noti = require("../models/noti");

// Track online users and their current viewing context
const onlineUsers = new Map(); // userId -> socketId
const userRooms = new Map(); // userId -> Set of rooms they're in

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://linkup-kappa.vercel.app",
        "http://localhost:5173",
        "http://localhost:400",
      ],
      methods: ["GET", "POST"],
      credentials: true, // ✅ Cho phép gửi cookie qua socket
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    let currentUserId = null;

    // User comes online
    socket.on("userOnline", (userId) => {
      currentUserId = userId;
      onlineUsers.set(userId, socket.id);
      userRooms.set(userId, new Set());

      // Let followers know this user is online
      notifyFollowersOfStatusChange(io, userId, "online");

      // Send list of online friends to this user
      sendOnlineFriendsList(socket, userId);

      console.log(`User ${userId} online: ${socket.id}`);
    });
    // MESSAGING
    socket.on("sendMessage", async (message) => {
      console.log("sendMessage event received:", message); // Kiểm tra xem sự kiện đã nhận được tin nhắn chưa

      const { senderId, receiverId, content, image } = message;
      try {
        // Store message in database
        const newMessage = await Messenger.create({
          senderId,
          receiverId,
          content,
          image,
        });

        // Get full message data with sender/receiver info
        const fullMessage = await Messenger.findOne({
          where: { id: newMessage.id },
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

        // Emit to receiver if they're online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message", savedMessage);

          // Emit notification tới người nhận
          io.to(receiverSocketId).emit("notification", {
            senderId,
            type: "message",
            content: "Bạn có tin nhắn mới!",
          });

          // Lưu notification vào DB
          await Noti.create({
            senderId,
            receiverId,
            type: "message",
            content: "Bạn có tin nhắn mới!",
            isRead: false,
          });
        } else {
          console.log(`Receiver ${receiverId} is not online.`);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("errorMessage", { error: "Failed to send message" });
      }
    });

    // FOLLOWS
    socket.on("followRequest", async (followData) => {
      const { followerId, followingId } = followData;

      try {
        // Store follow request in database
        const newFollow = await Follow.create({
          followerId,
          followingId,
          status: "pending", // Assuming you have a status field
        });

        // Get user info
        const follower = await User.findOne({
          where: { id: followerId },
          attributes: ["id", "username", "avatar"],
        });

        // Notify the user being followed
        const targetSocketId = onlineUsers.get(followingId);
        if (targetSocketId) {
          io.to(targetSocketId).emit("notification", {
            type: "followRequest",
            message: `${follower.username} wants to follow you`,
            data: {
              followerId,
              followerName: follower.username,
              followerAvatar: follower.avatar,
            },
          });
        }
      } catch (error) {
        console.error("Error processing follow request:", error);
        socket.emit("errorMessage", { error: "Failed to send follow request" });
      }
    });

    // Follow request response (accept/reject)
    socket.on("followResponse", async (responseData) => {
      const { followerId, followingId, accept } = responseData;

      try {
        const followRecord = await Follow.findOne({
          where: { followerId, followingId },
        });

        if (followRecord) {
          if (accept) {
            await followRecord.update({ status: "accepted" });

            // Notify the user who sent the request
            const targetSocketId = onlineUsers.get(followerId);
            if (targetSocketId) {
              // Get user info for notification
              const following = await User.findOne({
                where: { id: followingId },
                attributes: ["id", "username", "avatar"],
              });

              io.to(targetSocketId).emit("notification", {
                type: "followAccepted",
                message: `${following.username} accepted your follow request`,
                data: { followingId, followingName: following.username },
              });
            }
          } else {
            // Rejected, just delete the record
            await followRecord.destroy();
          }
        }
      } catch (error) {
        console.error("Error processing follow response:", error);
        socket.emit("errorMessage", {
          error: "Failed to process follow response",
        });
      }
    });

    // Typing indicator for messages
    socket.on("typing", (data) => {
      const { senderId, receiverId, isTyping } = data;

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: senderId,
          isTyping,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (currentUserId) {
        // Remove user from online tracking
        onlineUsers.delete(currentUserId);
        userRooms.delete(currentUserId);

        // Notify followers that user went offline
        notifyFollowersOfStatusChange(io, currentUserId, "offline");
      }

      console.log(`❌ WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initSocket };
