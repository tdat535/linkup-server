const MediaPost = require("../models/mediaPost"); // Assuming you have a User model
const Follow = require("../models/follow");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;
const { fn, col, literal } = require("sequelize");
const Like = require("../models/like");
const Comment = require("../models/comment");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Lấy từ Cloudinary Console
  api_key: process.env.CLOUDINARY_API_KEY, // Lấy từ Cloudinary Console
  api_secret: process.env.CLOUDINARY_API_SECRET, // Lấy từ Cloudinary Console
});

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
    const isVideo = mediaData.type === "video";

    if (mediaData.file && mediaData.file.buffer) {
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: isVideo ? "media_videos" : "media_posts",
            resource_type: isVideo ? "video" : "image",
          },
          (error, result) => {
            if (error) {
              reject("Error uploading file to Cloudinary");
            } else {
              resolve(result);
            }
          }
        );

        const bufferStream = new require("stream").PassThrough();
        bufferStream.end(mediaData.file.buffer);
        bufferStream.pipe(uploadStream);
      });

      mediaUrl = uploadResponse.secure_url;
      console.log("File uploaded to Cloudinary:", mediaUrl);
    }

    const newMediaContent = isVideo
      ? new MediaVideo({
          content: mediaData.content,
          video: mediaUrl,
          userId: mediaData.userId,
        })
      : new MediaPost({
          content: mediaData.content,
          image: mediaUrl,
          userId: mediaData.userId,
        });

    await newMediaContent.save();

    return {
      isSuccess: true,
      status: 200,
      message: `Tạo ${isVideo ? "video" : "bài viết"} thành công`,
      id: newMediaContent.id,
      content: newMediaContent.content,
      mediaUrl,
      userId: newMediaContent.userId,
    };
  } catch (error) {
    console.error("Error during media content creation:", error);
    throw new Error("Error creating media content: " + error.message);
  }
};

const getMediaPosts = async (userId) => {
  try {
    // Tìm danh sách những người mà user đang theo dõi và trạng thái là "accepted"
    const followingList = await Follow.findAll({
      where: {
        followerId: userId,
        status: "accepted", // Chỉ lấy các follow với trạng thái 'accepted'
      },
      attributes: ["followingId"], // Chỉ lấy ID người được theo dõi
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
        "url",
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
        "url",
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
          attributes: ["id", "username", "avatar"], // Lấy thông tin người đăng bài
        }
      ],
      order: [[literal("interactionScore"), "DESC"]],
      limit: 10, // Giới hạn số bài viết
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
