// socket.js
const { Server } = require("socket.io");
const Messenger = require("../models/messenger");
const User = require("../models/user");
const Comment = require("../models/comment");
const Like = require("../models/like");
const Follow = require("../models/follow");
const MediaPost = require("../models/mediaPost");

// Track online users and their current viewing context
const onlineUsers = new Map(); // userId -> socketId
const userRooms = new Map(); // userId -> Set of rooms they're in

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://linkup-kappa.vercel.app",
        "http://localhost:5173"
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
          io.to(receiverSocketId).emit("receiveMessage", fullMessage);
          
          // Emit notification for the receiver
          io.to(receiverSocketId).emit("notification", {
            type: "message",
            message: `New message from ${fullMessage.sender.username}`,
            data: {
              senderId,
              messagePreview: content.substring(0, 30) + (content.length > 30 ? "..." : "")
            }
          });

          console.log("Notification sent to receiver:", receiverId);  // Thêm log này

    
          console.log(`Message sent to ${receiverId}:`, fullMessage);  // Kiểm tra lại console log này
        } else {
          console.log(`Receiver ${receiverId} is not online.`);
        }
      } catch (error) {
        console.error("Error sending message:", error);
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
          image
        });
        
        // Get post creator to notify them
        const post = await MediaPost.findOne({ where: { id: postId } });
        
        // Get user info for the commenter
        const user = await User.findOne({ 
          where: { id: userId },
          attributes: ["id", "username", "avatar"] 
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
                commentContent: content.substring(0, 30) + (content.length > 30 ? "..." : "")
              }
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
          where: { postId, userId }
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
          attributes: ["id", "username", "avatar"] 
        });
        
        // Get updated like count
        const likeCount = await Like.count({ where: { postId } });
        
        // Broadcast to everyone viewing the post
        io.to(`post:${postId}`).emit("likeUpdate", { 
          postId, 
          likeCount,
          userId, 
          action
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
                likerName: user.username
              }
            });
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        socket.emit("errorMessage", { error: "Failed to process like" });
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
          status: "pending" // Assuming you have a status field
        });
        
        // Get user info
        const follower = await User.findOne({ 
          where: { id: followerId },
          attributes: ["id", "username", "avatar"] 
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
              followerAvatar: follower.avatar
            }
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
          where: { followerId, followingId }
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
                attributes: ["id", "username", "avatar"] 
              });
              
              io.to(targetSocketId).emit("notification", {
                type: "followAccepted",
                message: `${following.username} accepted your follow request`,
                data: { followingId, followingName: following.username }
              });
            }
          } else {
            // Rejected, just delete the record
            await followRecord.destroy();
          }
        }
      } catch (error) {
        console.error("Error processing follow response:", error);
        socket.emit("errorMessage", { error: "Failed to process follow response" });
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
            status: "accepted" 
          },
          attributes: ["followerId"]
        });
        
        // Get the post data
        const post = await MediaPost.findOne({
          where: { id: postId },
          include: [
            {
              model: User,
              attributes: ["id", "username", "avatar"]
            }
          ]
        });
        
        // Notify all online followers about the new post
        followers.forEach(follower => {
          const followerSocketId = onlineUsers.get(follower.followerId);
          if (followerSocketId) {
            io.to(followerSocketId).emit("feedUpdate", post);
            
            io.to(followerSocketId).emit("notification", {
              type: "newPost",
              message: `${post.User.username} shared a new post`,
              data: { postId, creatorId: userId, creatorName: post.User.username }
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
        io.to(receiverSocketId).emit("userTyping", { userId: senderId, isTyping });
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
          status: "accepted" 
        },
        attributes: ["followerId"]
      });
      
      // Get user data
      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "username", "avatar"]
      });
      
      // Notify all online followers about status change
      followers.forEach(follower => {
        const followerSocketId = onlineUsers.get(follower.followerId);
        if (followerSocketId) {
          io.to(followerSocketId).emit("friendStatusChange", {
            userId,
            username: user.username,
            status // "online" or "offline"
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
          status: "accepted" 
        },
        attributes: ["followingId"]
      });
      
      // Get IDs of followed users
      const followingIds = following.map(follow => follow.followingId);
      
      // Filter to only those who are online
      const onlineFriends = [];
      for (const friendId of followingIds) {
        if (onlineUsers.has(friendId)) {
          // Get user info
          const friend = await User.findOne({
            where: { id: friendId },
            attributes: ["id", "username", "avatar"]
          });
          
          onlineFriends.push(friend);
        }
      }
      
      // Send the list to the user
      socket.emit("onlineFriends", onlineFriends);
    } catch (error) {
      console.error("Error sending online friends list:", error);
    }
  }

  return io;
};

module.exports = { initSocket };