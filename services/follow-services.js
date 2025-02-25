const Follow = require("../models/follow");
const User = require("../models/user");

const createFollow = async (followData) => {
  try {
    const { followerId, followingId } = followData;

    // Kiểm tra ID của follower và following có tồn tại không
    const follower = await User.findByPk(followerId);
    const following = await User.findByPk(followingId);
    if (!follower || !following) {
      return { error: "Người dùng không tồn tại.", status: 404 };
    }

    // Kiểm tra xem đã follow chưa và trạng thái có phải "pending"
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId },
    });
    if (existingFollow && existingFollow.status === "pending") {
      return {
        error: "Đã gửi yêu cầu theo dõi, đang chờ phản hồi.",
        status: 400,
      };
    } else if (existingFollow && existingFollow.status === "accepted") {
      return { error: "Người dùng đã follow trước đó.", status: 400 };
    }

    // Tạo follow mới với trạng thái "pending"
    const newFollow = await Follow.create({
      followerId,
      followingId,
      status: "pending",
    });

    return {
      id: newFollow.id,
      followerId: newFollow.followerId,
      followingId: newFollow.followingId,
      followedAt: newFollow.followedAt,
      status: newFollow.status,
    };
  } catch (error) {
    throw new Error("Lỗi khi tạo follow: " + error.message);
  }
};

const acceptFollow = async (followerId, followingId) => {
  try {
    // Tìm kiếm follow với trạng thái "pending"
    const follow = await Follow.findOne({
      where: { followerId, followingId, status: "pending" },
    });

    if (!follow) {
      return {
        error: "Không có yêu cầu theo dõi nào cần chấp nhận.",
        status: 404,
      };
    }

    // Cập nhật trạng thái follow thành "accepted"
    follow.status = "accepted";
    await follow.save();

    // Kiểm tra xem followingId đã follow lại followerId chưa
    const reverseFollow = await Follow.findOne({
      where: { followerId: followingId, followingId: followerId },
    });

    // Nếu chưa có follow ngược, tạo follow mới với trạng thái "accepted"
    if (!reverseFollow) {
      await Follow.create({
        followerId: followingId,
        followingId: followerId,
        status: "accepted",
      });
    }

    return {
      message: "Yêu cầu theo dõi đã được chấp nhận, cả hai đều follow nhau.",
      status: "accepted",
    };
  } catch (error) {
    throw new Error("Lỗi khi chấp nhận follow: " + error.message);
  }
};


const getFollow = async (userId) => {
  try {
    // Kiểm tra userId có tồn tại không
    const user = await User.findByPk(userId);
    // if (!user) {
    //   return { error: "Người dùng không tồn tại.", status: 404 };
    // }

    // Tìm những người mà user đang follow và trạng thái là "accepted"
    const followingList = await Follow.findAll({
      where: { followerId: userId, status: "accepted" },
      include: [
        { model: User, as: "Following", attributes: ["id", "username"] },
      ],
    });

    // Tìm những người đang follow user và trạng thái là "accepted"
    const followersList = await Follow.findAll({
      where: { followingId: userId, status: "accepted" },
      include: [
        { model: User, as: "Followers", attributes: ["id", "username"] },
      ],
    });

    return {
      userId,
      following: followingList.map((f) => f.Following),
      followers: followersList.map((f) => f.Followers),
    };
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách follow: " + error.message);
  }
};

module.exports = { createFollow, getFollow, getFollow, acceptFollow };
