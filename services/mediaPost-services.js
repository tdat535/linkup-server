const MediaPost = require("../models/mediaPost"); // Assuming you have a User model
const Follow = require("../models/follow");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Lấy từ Cloudinary Console
  api_key: process.env.CLOUDINARY_API_KEY,       // Lấy từ Cloudinary Console
  api_secret: process.env.CLOUDINARY_API_SECRET  // Lấy từ Cloudinary Console
});

const createMediaPost = async (mediaPostData) => {
  try {
    let imageUrl = null;

    // Kiểm tra xem ảnh có tồn tại không
    if (mediaPostData.image && mediaPostData.image.buffer) {
      // Sử dụng Promise để chờ đợi kết quả upload
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'media_posts', resource_type: 'image' },
          (error, result) => {
            if (error) {
              reject("Error uploading image to Cloudinary");
            } else {
              resolve(result);
            }
          }
        );

        // Đọc dữ liệu từ buffer và gửi lên Cloudinary
        const bufferStream = new require("stream").PassThrough();
        bufferStream.end(mediaPostData.image.buffer);
        bufferStream.pipe(uploadStream);
      });

      // Lấy URL ảnh sau khi upload thành công
      imageUrl = uploadResponse.secure_url;
      console.log("Image uploaded to Cloudinary:", imageUrl);
    }

    // Kiểm tra kết quả trước khi tạo bài viết
    if (!imageUrl) {
      console.error("Image URL is missing.");
      throw new Error("Image URL is missing.");
    }

    console.log("Creating media post with image URL:", imageUrl);

    // Tạo bài viết trong database
    const newMediaPost = new MediaPost({
      content: mediaPostData.content,
      image: imageUrl,
      userId: mediaPostData.userId,
    });

    await newMediaPost.save();

    return {
      id: newMediaPost.id,
      content: newMediaPost.content,
      image: newMediaPost.image,
      userId: newMediaPost.userId,
    };
  } catch (error) {
    console.error("Error during media post creation:", error);
    throw new Error("Error creating media post: " + error.message);
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

    // Lấy bài viết của những người trong danh sách theo dõi (bao gồm chính mình)
    const mediaPosts = await MediaPost.findAll({
      where: {
        userId: followedIds, // Tìm bài viết của userId và những người mà user đang theo dõi
      },
      include: [
        {
          model: User,
          attributes: ["username", "avatar"], // Thêm thông tin username của người đăng bài
        },
      ],
      order: [["createdAt", "DESC"]], // Sắp xếp theo thời gian tạo (mới nhất ở trên)
    });

    return mediaPosts;
  } catch (error) {
    throw new Error("Error getting media posts: " + error.message);
  }
};

const getAll = async () => {
  try {
    const list = await MediaPost.findAll();
    return {
      data: list,
    };
  } catch (error) {
    throw new Error("Error getting media posts: " + error.message);
  }
};

module.exports = { getMediaPosts, createMediaPost, getAll };
