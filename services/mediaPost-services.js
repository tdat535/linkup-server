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
  api_key: process.env.CLOUDINARY_API_KEY,       // Lấy từ Cloudinary Console
  api_secret: process.env.CLOUDINARY_API_SECRET  // Lấy từ Cloudinary Console
});

const createMediaPost = async (mediaPostData) => {
  try {

    if (mediaPostData.content === null || mediaPostData.content === undefined || mediaPostData.content.trim() === "") {
      return {
        isSuccess: false,
        status: 400,
        error: "Thiếu thông tin bài viết.",
      };
    }

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
    // if (!imageUrl) {
    //   console.error("Image URL is missing.");
    //   throw new Error("Image URL is missing.");
    // }

    console.log("Creating media post with image URL:", imageUrl);

    // Tạo bài viết trong database
    const newMediaPost = new MediaPost({
      content: mediaPostData.content,
      image: imageUrl,
      userId: mediaPostData.userId,
    });

    await newMediaPost.save();

    return {
      isSuccess: true,
      status: 200,
      message: "Tạo bài viết thành công",
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

    // Lấy bài viết có status là 'active' của những người trong danh sách theo dõi (bao gồm chính mình)
    const mediaPosts = await MediaPost.findAll({
      where: {
        userId: followedIds, // Tìm bài viết của userId và những người mà user đang theo dõi
        status: 'active', // Chỉ lấy bài viết có status 'active'
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "avatar"], // Thêm thông tin username của người đăng bài
        },
      ],
      order: [["createdAt", "DESC"]], // Sắp xếp theo thời gian tạo (mới nhất ở trên)
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

const getAllMediaPost = async () => {
  try {
    const list = await MediaPost.findAll({
      attributes: [
        "id",
        "content",
        "image",
        "status",
        "createdAt",
        "updatedAt",
        "userId",
        // Đếm số lượng comment
        [fn("COUNT", col("Comments.id")), "commentCount"],
        // Đếm số lượng like
        [fn("COUNT", col("Likes.id")), "likeCount"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "username", "avatar"], // Lấy thông tin user
        },
        {
          model: Comment,
          attributes: [], // Không chọn toàn bộ cột, chỉ dùng COUNT
          where: { postType: "post" },
          required: false, 
        },
        {
          model: Like,
          attributes: [], // Không chọn toàn bộ cột, chỉ dùng COUNT
          where: { postType: "post" },
          required: false, 
        },
      ],
      group: ["MediaPost.id", "User.id"], // Chỉ nhóm theo các cột chính
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách tất cả bài viết thành công",
      data: list,
    };
  } catch (error) {
    throw new Error("Error getting media posts: " + error.message);
  }
};

const hideMediaPost = async (postId) => {
  try {
    // Cập nhật trạng thái của bài viết từ 'active' sang 'inactive'
    const updatedPost = await MediaPost.update(
      { status: 'inactive' }, // Cập nhật trạng thái thành 'inactive'
      {
        where: {
          id: postId, // Tìm bài viết theo ID
          status: 'active', // Chỉ cập nhật các bài viết có trạng thái là 'active'
        },
      }
    );

    if (updatedPost[0] === 0) {
      // Nếu không có bài viết nào được cập nhật
      return {
        isSuccess: false,
        status: 400,
        message: "Không tìm thấy bài viết với trạng thái 'active' để ẩn.",
      };
    }

    return {
      isSuccess: true,
      status: 200,
      message: "Ẩn bài viết thành công",
    };
  } catch (error) {
    console.error("Error hiding media post:", error);
    throw new Error("Error hiding media post: " + error.message);
  }
};

const unHideMediaPost = async (postId) => {
  try {
    // Cập nhật trạng thái của bài viết từ 'active' sang 'inactive'
    const updatedPost = await MediaPost.update(
      { status: 'active' }, // Cập nhật trạng thái thành 'inactive'
      {
        where: {
          id: postId, // Tìm bài viết theo ID
          status: 'inactive', // Chỉ cập nhật các bài viết có trạng thái là 'active'
        },
      }
    );

    if (updatedPost[0] === 0) {
      // Nếu không có bài viết nào được cập nhật
      return {
        isSuccess: false,
        status: 400,
        message: "Không tìm thấy bài viết với trạng thái 'inactive' để hiện thị.",
      };
    }

    return {
      isSuccess: true,
      status: 200,
      message: "Hiện thị bài viết thành công",
    };
  } catch (error) {
    console.error("Error hiding media post:", error);
    throw new Error("Error hiding media post: " + error.message);
  }
};

module.exports = { getMediaPosts, createMediaPost, getAllMediaPost, hideMediaPost, unHideMediaPost };
