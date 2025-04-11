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
    socket.on("userOnline", async (userId) => {
      currentUserId = userId;
      onlineUsers.set(userId, socket.id);
      userRooms.set(userId, new Set());

      notifyFollowersOfStatusChange(io, userId, "online");
      sendOnlineFriendsList(socket, userId);

      // Gửi các notification chưa đọc
      const unreadNotis = await Noti.findAll({
        where: { receiverId: userId, isRead: false },
      });
      if (unreadNotis.length > 0) {
        io.to(socket.id).emit("notification", {
          type: "bulk",
          message: "Bạn có thông báo chưa đọc!",
          data: unreadNotis,
        });
      }

      console.log(`User ${userId} online: ${socket.id}`);
    });

    // User joins a post page (to receive comments/likes updates for that post)
    socket.on("joinPost", (postId) => {
      if (!currentUserId) return;

      const roomName = `post:${postId}`;
      socket.join(roomName);

      // Track which rooms this user has joined
      const userRoomSet = userRooms.get(currentUserId) || new Set();
      userRoomSet.add(roomName);
      userRooms.set(currentUserId, userRoomSet);

      console.log(`User ${currentUserId} joined room ${roomName}`);
    });

    // User leaves a post page
    socket.on("leavePost", (postId) => {
      if (!currentUserId) return;

      const roomName = `post:${postId}`;
      socket.leave(roomName);

      // Remove from tracking
      const userRoomSet = userRooms.get(currentUserId);
      if (userRoomSet) {
        userRoomSet.delete(roomName);
      }

      console.log(`User ${currentUserId} left room ${roomName}`);
    });

    // MESSAGING
    socket.on("sendMessage", async (message) => {
      const { senderId, receiverId, content, image } = message;
    
      try {
        const receiverSocketId = onlineUsers.get(receiverId);
    
        if (receiverSocketId) {
          // ✅ Người nhận online: chỉ emit, KHÔNG lưu vào DB
          const sender = await User.findOne({
            where: { id: senderId },
            attributes: ["id", "username", "avatar"],
          });
    
          const fakeMessage = {
            id: Date.now(), // Có thể dùng tạm thời số giả (nếu cần để hiển thị client)
            senderId,
            receiverId,
            content,
            image,
            createdAt: new Date(),
            sender,
            receiver: null,
          };
    
          io.to(receiverSocketId).emit("receiveMessage", fakeMessage);
    
          io.to(receiverSocketId).emit("notification", {
            type: "message",
            message: `New message from ${sender.username}`,
            data: {
              senderId,
              messagePreview:
                content.substring(0, 30) + (content.length > 30 ? "..." : ""),
            },
          });
    
          console.log(`📨 Message emitted to ${receiverId} (online)`);
        } else {
          // ❌ Người nhận offline: lưu DB, không emit
          const newMessage = await Messenger.create({
            senderId,
            receiverId,
            content,
            image,
          });
    
          const newNoti = await Noti.create({
            senderId,
            receiverId,
            type: "message",
            message: "Bạn có tin nhắn mới!",
            isRead: false,
          });
    
          console.log(`💾 Message saved for offline user ${receiverId}`);
        }
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("errorMessage", { error: "Failed to send message" });
      }
    });
    

    // COMMENTS
    socket.on("addComment", async (commentData) => {
      const { postId, userId, content, image } = commentData;

      try {
        // Store comment in database
        const newComment = await Comment.create({
          postId,
          userId,
          content,
          image,
        });

        // Get post creator to notify them
        const post = await MediaPost.findOne({ where: { id: postId } });

        // Get user info for the commenter
        const user = await User.findOne({
          where: { id: userId },
          attributes: ["id", "username", "avatar"],
        });

        const fullComment = { ...newComment.toJSON(), user };

        // Broadcast to everyone viewing the post
        io.to(`post:${postId}`).emit("newComment", fullComment);

        // Notify post owner if they're not the commenter
        if (post.userId !== userId) {
          const ownerSocketId = onlineUsers.get(post.userId);
          if (ownerSocketId) {
            io.to(ownerSocketId).emit("notification", {
              type: "comment",
              message: `${user.username} commented on your post`,
              data: {
                postId,
                commenterId: userId,
                commenterName: user.username,
                commentContent:
                  content.substring(0, 30) + (content.length > 30 ? "..." : ""),
              },
            });
          }
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        socket.emit("errorMessage", { error: "Failed to add comment" });
      }
    });

    // LIKES
    socket.on("toggleLike", async (likeData) => {
      const { postId, userId } = likeData;

      try {
        // Check if like exists
        const existingLike = await Like.findOne({
          where: { postId, userId },
        });

        let action;

        if (existingLike) {
          // Unlike
          await existingLike.destroy();
          action = "unlike";
        } else {
          // Like
          await Like.create({ postId, userId });
          action = "like";
        }

        // Get post creator to notify them
        const post = await MediaPost.findOne({ where: { id: postId } });

        // Get user info
        const user = await User.findOne({
          where: { id: userId },
          attributes: ["id", "username", "avatar"],
        });

        // Get updated like count
        const likeCount = await Like.count({ where: { postId } });

        // Broadcast to everyone viewing the post
        io.to(`post:${postId}`).emit("likeUpdate", {
          postId,
          likeCount,
          userId,
          action,
        });

        // Notify post owner of new like (but not unlike)
        if (action === "like" && post.userId !== userId) {
          const ownerSocketId = onlineUsers.get(post.userId);
          if (ownerSocketId) {
            io.to(ownerSocketId).emit("notification", {
              type: "like",
              message: `${user.username} liked your post`,
              data: {
                postId,
                likerId: userId,
                likerName: user.username,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        socket.emit("errorMessage", { error: "Failed to process like" });
      }
    });

    // FOLLOWS
    socket.on("follow", async ({ followerId, followingId }) => {
      try {
        const followingSocketId = onlineUsers.get(followingId);
    
        const follower = await User.findByPk(followerId, {
          attributes: ["id", "username", "avatar"],
        });
    
        // Gửi thông báo nếu người được follow đang online
        if (followingSocketId) {
          console.log("📢 Gửi followNotification tới:", followingSocketId);
          io.to(followingSocketId).emit("followNotification", {
            type: "follow",
            message: `${follower.username} đã theo dõi bạn.`,
            data: {
              followerId,
              follower,
            },
          });
        } else {
          // Lưu thông báo nếu offline
          await Noti.create({
            senderId: followerId,
            receiverId: followingId,
            type: "follow",
            message: `${follower.username} đã theo dõi bạn.`,
            isRead: false,
          });
        }
      } catch (error) {
        console.error("Lỗi khi xử lý follow:", error);
      }
    });
  
    // NEW POST CREATED
    socket.on("newPost", async (postData) => {
      const { postId, userId } = postData;

      try {
        // Find all followers of this user
        const followers = await Follow.findAll({
          where: {
            followingId: userId,
            status: "accepted",
          },
          attributes: ["followerId"],
        });

        // Get the post data
        const post = await MediaPost.findOne({
          where: { id: postId },
          include: [
            {
              model: User,
              attributes: ["id", "username", "avatar"],
            },
          ],
        });

        // Notify all online followers about the new post
        followers.forEach((follower) => {
          const followerSocketId = onlineUsers.get(follower.followerId);
          if (followerSocketId) {
            io.to(followerSocketId).emit("feedUpdate", post);

            io.to(followerSocketId).emit("notification", {
              type: "newPost",
              message: `${post.User.username} shared a new post`,
              data: {
                postId,
                creatorId: userId,
                creatorName: post.User.username,
              },
            });
          }
        });
      } catch (error) {
        console.error("Error broadcasting new post:", error);
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

  // Helper functions
  async function notifyFollowersOfStatusChange(io, userId, status) {
    try {
      // Find all followers who have been accepted
      const followers = await Follow.findAll({
        where: {
          followingId: userId,
          status: "accepted",
        },
        attributes: ["followerId"],
      });

      // Get user data
      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "username", "avatar"],
      });

      // Notify all online followers about status change
      followers.forEach((follower) => {
        const followerSocketId = onlineUsers.get(follower.followerId);
        if (followerSocketId) {
          io.to(followerSocketId).emit("friendStatusChange", {
            userId,
            username: user.username,
            status, // "online" or "offline"
          });
        }
      });
    } catch (error) {
      console.error("Error notifying followers of status change:", error);
    }
  }

  async function sendOnlineFriendsList(socket, userId) {
    try {
      // Find all people this user follows who accepted
      const following = await Follow.findAll({
        where: {
          followerId: userId,
          status: "accepted",
        },
        attributes: ["followingId"],
      });

      // Get IDs of followed users
      const followingIds = following.map((follow) => follow.followingId);

      // Filter to only those who are online
      const onlineFriendIds = followingIds.filter((id) => onlineUsers.has(id));
      const onlineFriends = await User.findAll({
        where: { id: onlineFriendIds },
        attributes: ["id", "username", "avatar"],
      });
      socket.emit("onlineFriends", onlineFriends);

      // Send the list to the user
      socket.emit("onlineFriends", onlineFriends);
    } catch (error) {
      console.error("Error sending online friends list:", error);
    }
  }

  return io;
};

module.exports = { initSocket };
