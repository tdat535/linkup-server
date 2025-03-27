// socket.js
const { Server } = require("socket.io");
const Messenger = require("../models/messenger");
const User = require("../models/user"); // Import User model để sử dụng khi lấy thông tin người gửi, người nhận

const onlineUsers = new Map(); // Lưu user đang online

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Hoặc liệt kê cụ thể frontend của bạn
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"],
  });
  

  io.on("connection", (socket) => {
    console.log(`🔌 Client đã kết nối: ${socket.id}`);

    socket.on("testMessage", (data) => {
      console.log("📩 Nhận tin nhắn test từ client:", data);
    });

    // Lắng nghe user đăng nhập và lưu vào danh sách online
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} online: ${socket.id}`);
    });

    // Xử lý gửi tin nhắn
    socket.on("sendMessage", async (message) => {
      const { senderId, receiverId, content, image } = message;
      console.log("📩 Gửi tin nhắn từ:", senderId, " đến:", receiverId);

      const newMessage = await Messenger.create({
        senderId,
        receiverId,
        content,
        image,
      });

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

      const receiverSocketId = onlineUsers.get(receiverId);

      // Chỉ gửi tin nhắn đến người nhận, KHÔNG gửi lại cho người gửi
      if (receiverSocketId) {
        console.log("📩 Gửi tin nhắn đến người nhận:", receiverSocketId);
        io.to(receiverSocketId).emit("receiveMessage", fullMessage);
      }
    });

    // Xử lý khi user disconnect
    socket.on("disconnect", () => {
      console.log("❌ WebSocket client disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = { initSocket };
