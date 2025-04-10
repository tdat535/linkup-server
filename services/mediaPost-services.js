const MediaPost = require("../models/mediaPost"); // Assuming you have a User model
const Follow = require("../models/follow");
const User = require("../models/user");
const { fn, col, literal } = require("sequelize");
const Like = require("../models/like");
const Comment = require("../models/comment");
const cloudinary = require("../config/cloudinary");

const createMediaPost = async (mediaData) => {
  try {
    if (!mediaData.content || mediaData.content.trim() === "") {
      return {
        isSuccess: false,
        status: 400,
        error: "Thiếu nội dung bài viết.",
      };
    }

    let mediaUrl = null;
    const isVideo = mediaData.type === "video"; // Xác định loại media

    if (mediaData.file && mediaData.file.buffer) {
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: isVideo ? "media_videos" : "media_posts",
            resource_type: isVideo ? "video" : "image",
          },
          (error, result) => {
            if (error) {
              console.error("Lỗi upload Cloudinary:", error);
              reject("Lỗi tải lên Cloudinary");
            } else {
              console.log("Upload thành công:", result);
              resolve(result);
            }
          }
        );

        const bufferStream = new require("stream").PassThrough();
        bufferStream.end(mediaData.file.buffer);
        bufferStream.pipe(uploadStream);
      });

      if (uploadResponse && uploadResponse.secure_url) {
        mediaUrl = uploadResponse.secure_url;
      } else {
        console.error("Lỗi: Không lấy được URL từ Cloudinary!");
      }
    }

    console.log("Media URL trước khi lưu vào DB:", mediaUrl);

    const newMediaContent = new MediaPost({
      content: mediaData.content,
      mediaUrl: mediaUrl,
      userId: mediaData.userId,
      type: isVideo ? "video" : "post", 
    });

    await newMediaContent.save();

    const user = await User.findByPk(mediaData.userId);

    return {
      isSuccess: true,
      status: 200,
      message: `Tạo ${isVideo ? "video" : "bài viết"} thành công`,
      id: newMediaContent.id,
      content: newMediaContent.content,
      mediaUrl, 
      type: newMediaContent.type,
      User: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error("Lỗi khi tạo nội dung:", error);
    throw new Error("Lỗi tạo nội dung: " + error.message);
  }
};

const getMediaPosts = async (userId) => {
  try {
    const followingList = await Follow.findAll({
      where: {
        followerId: userId,
        status: "accepted", 
      },
      attributes: ["followingId"], 
    });

    // Lấy danh sách ID của những người mà user đang theo dõi
    let followedIds = followingList.map((follow) => follow.followingId);

    // Thêm chính userId để lấy cả bài viết của người đó
    followedIds.push(userId);

    // Lấy bài viết có status là 'active' của những người trong danh sách theo dõi (bao gồm chính mình)
    const mediaPosts = await MediaPost.findAll({
      where: {
        userId: followedIds,
        status: "active",
      },
      attributes: [
        "id",
        "content",
        "mediaUrl",
        "type",
        "createdAt",
        "updatedAt",
        [literal("(SELECT COUNT(*) FROM Likes WHERE Likes.postId = MediaPost.id)"), "likeCount"],
        [literal("(SELECT COUNT(*) FROM Comments WHERE Comments.postId = MediaPost.id)"), "commentCount"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách bài viết thành công",
      data: mediaPosts,
    };
  } catch (error) {
    throw new Error("Error getting media posts: " + error.message);
  }
};

const getTrendingPosts = async () => {
  try {
    const trendingPosts = await MediaPost.findAll({
      attributes: [
        "id",
        "content",
        "mediaUrl",
        "type",
        "createdAt",
        "updatedAt",
        [literal("(SELECT COUNT(*) FROM Likes WHERE Likes.postId = MediaPost.id)"), "likeCount"],
        [literal("(SELECT COUNT(*) FROM Comments WHERE Comments.postId = MediaPost.id)"), "commentCount"],
        [literal("((SELECT COUNT(*) FROM Likes WHERE Likes.postId = MediaPost.id) + (SELECT COUNT(*) FROM Comments WHERE Comments.postId = MediaPost.id))"), "interactionScore"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username", "avatar"],
        }
      ],
      order: [[literal("interactionScore"), "DESC"]],
      limit: 10, 
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy bài viết xu hướng thành công",
      data: trendingPosts,
    };
  } catch (error) {
    console.error("Error getting trending posts:", error);
    throw new Error("Error getting trending posts: " + error.message);
  }
};

module.exports = { getMediaPosts, createMediaPost, getTrendingPosts };
