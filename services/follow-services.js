const Follow = require("../models/follow");
const User = require("../models/user");

const createFollow = async (followData) => {
  const { followerId, followingId } = followData;

  try {
    if (followerId === followingId) {
      return { error: "Không thể tự follow chính mình.", status: 400 };
    }

    // Kiểm tra người dùng tồn tại
    const follower = await User.findByPk(followerId);
    const following = await User.findByPk(followingId);
    if (!follower || !following) {
      return { error: "Người dùng không tồn tại.", status: 404 };
    }

    // Kiểm tra đã follow chưa
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId },
    });
    if (existingFollow) {
      return { error: "Bạn đã follow người này.", status: 400 };
    }

    // Tạo follow mới
    const newFollow = await Follow.create({ followerId, followingId });

    return { message: "Follow thành công!", followId: newFollow.id };
  } catch (error) {
    throw new Error("Lỗi khi tạo follow: " + error.message);
  }
};

const getFollow = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return { error: "Người dùng không tồn tại.", status: 404 };

    // Lấy danh sách người mà user đang follow
    const followingList = await Follow.findAll({
      where: { followerId: userId },
      include: [{ model: User, as: "FollowingUser", attributes: ["id", "username", "avatar"] }]
    });

    // Lấy danh sách người đang follow user
    const followersList = await Follow.findAll({
      where: { followingId: userId },
      include: [{ model: User, as: "Follower", attributes: ["id", "username", "avatar"] }]
    });

    return {
      userId,
      following: followingList.map((f) => f.FollowingUser),
      followers: followersList.map((f) => f.Follower),
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách follow:", error);
    throw new Error("Lỗi khi lấy danh sách follow: " + error.message);
  }
};

module.exports = { createFollow, getFollow };
