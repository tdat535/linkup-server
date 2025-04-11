const Follow = require("../models/follow");
const User = require("../models/user");

const createFollow = async (followData) => {
  const { followerId, followingId } = followData;

  try {
    if (followerId === followingId) {
      return { error: "Không thể tự follow chính mình.", status: 400 };
    }

    const follower = await User.findByPk(followerId);
    const following = await User.findByPk(followingId);
    if (!follower || !following) {
      return {
        isSuccess: false,
        status: 404,
        error: "Người dùng không tồn tại.",
      };
    }

    const existingFollow = await Follow.findOne({
      where: { followerId, followingId },
    });

    // 👇 Nếu đã từng follow nhưng đã unfollow, cho phép follow lại
    if (existingFollow) {
      if (existingFollow.status === 'unfollowed') {
        existingFollow.status = 'accepted';
        existingFollow.followedAt = new Date(); // cập nhật thời gian mới
        await existingFollow.save();

        return {
          isSuccess: true,
          status: 200,
          message: "Đã follow lại thành công",
          followId: existingFollow.id,
        };
      }

      // Nếu vẫn đang follow, báo lỗi
      return {
        isSuccess: false,
        status: 400,
        error: "Bạn đã follow người này.",
      };
    }

    // ✅ Chưa từng follow, tạo mới
    const newFollow = await Follow.create({
      followerId,
      followingId,
      status: 'accepted',
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Theo dõi thành công",
      followId: newFollow.id,
    };
  } catch (error) {
    throw new Error("Lỗi khi tạo follow: " + error.message);
  }
};

const getFollow = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user)
      return {
        isSuccess: true,
        status: 404,
        error: "Người dùng không tồn tại.",
      };

    // Lấy danh sách người mà user đang follow
    const followingList = await Follow.findAll({
      where: { followerId: userId },
      include: [
        {
          model: User,
          as: "FollowingUser",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    // Lấy danh sách người đang follow user
    const followersList = await Follow.findAll({
      where: { followingId: userId },
      include: [
        {
          model: User,
          as: "Follower",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách theo dõi thành công",
      userId,
      following: followingList.map((f) => f.FollowingUser),
      followers: followersList.map((f) => f.Follower),
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách follow:", error);
    throw new Error("Lỗi khi lấy danh sách follow: " + error.message);
  }
};

const unfollow = async (followerId, followingId) => {
  try {
    const followRecord = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (!followRecord) {
      return {
        isSuccess: false,
        status: 404,
        error: "Không tìm thấy mối quan hệ follow.",
      };
    }

    // Cập nhật status thành 'unfollowed'
    followRecord.status = 'unfollowed';
    await followRecord.save();

    return {
      isSuccess: true,
      status: 200,
      message: "Đã hủy theo dõi (unfollowed) thành công.",
    };
  } catch (error) {
    console.error("Lỗi khi unfollow:", error);
    return {
      isSuccess: false,
      status: 500,
      error: "Lỗi khi hủy theo dõi.",
    };
  }
};

module.exports = { createFollow, getFollow, unfollow };
