const MediaPost = require("../models/mediaPost"); // Assuming you have a User model
const User = require("../models/user");
const { fn, col, literal } = require("sequelize");
const Like = require("../models/like");
const Comment = require("../models/comment");
const Follow = require("../models/follow");
const RefreshToken = require("../models/refreshToken");
const Messenger = require("../models/messenger"); // Assuming you have a Messenger model
const Report = require("../models/report"); // Assuming you have a Report model

const getAllMediaPost = async () => {
  try {
    const list = await MediaPost.findAll({
      attributes: [
        "id",
        "content",
        "mediaUrl",
        "status",
        "createdAt",
        "updatedAt",
        "userId",
        "type",
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

const hideMediaPost = async (postId, action = 'hide') => {
  try {
    const post = await MediaPost.findByPk(postId);
    if (!post) {
      return {
        isSuccess: false,
        status: 404,
        message: "Không tìm thấy bài viết.",
      };
    }

    await post.update({ isHidden: action === 'hide' });

    return {
      isSuccess: true,
      status: 200,
      message: `Bài viết đã được ${action === 'hide' ? 'ẩn' : 'hiển thị lại'}.`,
    };
  } catch (error) {
    return {
      isSuccess: false,
      status: 500,
      message: "Lỗi khi cập nhật trạng thái bài viết.",
    };
  }
};


const unHideMediaPost = async (postId) => {
  try {
    const post = await MediaPost.findByPk(postId);

    if (!post) {
      return {
        isSuccess: false,
        status: 404,
        message: "Không tìm thấy bài viết.",
      };
    }

    if (!post.isHidden) {
      return {
        isSuccess: false,
        status: 400,
        message: "Bài viết đã hiển thị sẵn.",
      };
    }

    await post.update({ isHidden: false });

    return {
      isSuccess: true,
      status: 200,
      message: "Hiển thị bài viết thành công.",
    };
  } catch (error) {
    console.error("Error un-hiding media post:", error);
    return {
      isSuccess: false,
      status: 500,
      message: "Lỗi khi hiển thị lại bài viết.",
    };
  }
};


const getAllUser = async () => {
  try {
    const users = await User.findAll();

    const userList = await Promise.all(
      users.map(async (user) => {
        // Lấy danh sách bài viết của user (chỉ lấy bài viết active)
        const posts = await MediaPost.findAll({
          where: { userId: user.id, status: "active" },
          attributes: ["id", "content", "mediaUrl", "createdAt"],
          order: [["createdAt", "DESC"]],
        });

        // Đếm số lượng bài viết
        const postCount = posts.length;

        // Đếm số lượng người đang theo dõi
        const followingCount = await Follow.count({
          where: { followerId: user.id },
        });

        // Đếm số lượng người theo dõi
        const followersCount = await Follow.count({
          where: { followingId: user.id },
        });

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          phonenumber: user.phonenumber,
          type: user.type,
          status: user.status,
          avatar: user.avatar,
          postCount,
          followingCount,
          followersCount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      })
    );

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách tất cả người dùng thành công",
      data: userList,
    };
  } catch (error) {
    throw new Error("Error getting user list: " + error.message);
  }
};

const hideUser = async (userId) => {
  try {
    const updatedUser = await User.update(
      { status: "inactive" },
      { where: { id: userId, status: "active" } }
    );

    if (updatedUser[0] === 0) {
      return {
        isSuccess: false,
        status: 400,
        message: "Không tìm thấy user active",
      };
    }

    // Xóa tất cả RefreshToken của user
    await RefreshToken.destroy({ where: { userId } });

    return {
      isSuccess: true,
      status: 200,
      message: "Khóa người dùng thành công",
    };
  } catch (error) {
    console.error("Error hiding user:", error);
    return { error: "Error hiding user", status: 500 };
  }
};

const unHideUser = async (userId) => {
  try {
    // Cập nhật trạng thái của bài viết từ 'active' sang 'inactive'
    const upateUser = await User.update(
      { status: "active" }, // Cập nhật trạng thái thành 'inactive'
      {
        where: {
          id: userId, // Tìm bài viết theo ID
          status: "inactive", // Chỉ cập nhật các bài viết có trạng thái là 'active'
        },
      }
    );

    if (upateUser[0] === 0) {
      // Nếu không có bài viết nào được cập nhật
      return {
        isSuccess: false,
        status: 400,
        message:
          "Không tìm thấy người dùng với trạng thái 'inactive' để mở khóa.",
      };
    }

    return {
      isSuccess: true,
      status: 200,
      message: "Đã mở khóa người dùng thành công",
    };
  } catch (error) {
    console.error("Error hiding media post:", error);
    throw new Error("Error hiding media post: " + error.message);
  }
};

const dashboard = async () => {
  try {
    // Đếm tổng số người dùng
    const totalUsers = await User.count();

    // Đếm bài viết theo loại
    const totalTextPosts = await MediaPost.count({ where: { type: 'post' } });
    const totalVideoPosts = await MediaPost.count({ where: { type: 'video' } });

    // Đếm comment
    const totalComments = await Comment.count();

    // Đếm like
    const totalLikes = await Like.count();

    // Đếm tin nhắn
    const totalMessages = await Messenger.count();

    // Gửi về client
    return {
      isSuccess: true,
      status: 200,
      message: "Đã mở khóa người dùng thành công",
      totalUsers,
      totalTextPosts,
      totalVideoPosts,
      totalComments,
      totalLikes,
      totalMessages
    };  
    
  } catch (error) {
    console.error("Error hiding media post:", error);
    throw new Error("Error hiding media post: " + error.message);
  }
};

const getAllReport = async () => {
  try {
    const reports = await Report.findAll({
      attributes: [
        "id",
        "reportedUserId",
        "reportedPostId",
        "reason",
        "type",
        "status",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: User,
          as: "reportedUser",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: MediaPost,
          as: "reportedPost",
          attributes: ["id", "content"],
        },
      ],
    });

    // Chuẩn hóa: Chỉ lấy thông tin đúng theo `type`
    const formatted = reports.map((report) => {
      let reportedTarget = null;

      if (report.type === "user") {
        reportedTarget = report.reportedUser;
      } else if (report.type === "post") {
        reportedTarget = report.reportedPost;
      }

      return {
        id: report.id,
        reason: report.reason,
        type: report.type,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reporter: report.reporter,
        reported: reportedTarget,
      };
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách tất cả báo cáo thành công",
      data: formatted,
    };
  } catch (error) {
    throw new Error("Error getting report list: " + error.message);
  }
};

module.exports = {
  getAllMediaPost,
  hideMediaPost,
  unHideMediaPost,
  getAllUser,
  hideUser,
  unHideUser,
  dashboard,
  getAllReport
};
