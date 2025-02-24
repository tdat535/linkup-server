const Follow = require('../models/follow');
const User = require('../models/user');

const createFollow = async (followData) => {
    try {
        const { followerId, followingId } = followData;

        // Kiểm tra ID của follower và following có tồn tại không
        const follower = await User.findByPk(followerId);
        const following = await User.findByPk(followingId);
        if (!follower || !following) {
            return { error: "Người dùng không tồn tại.", status: 404 };
        }

        // Kiểm tra xem đã follow chưa
        const existingFollow = await Follow.findOne({ where: { followerId, followingId } });
        if (existingFollow) {
            return { error: "Người dùng đã follow trước đó.", status: 400 };
        }

        // Tạo follow mới
        const newFollow = await Follow.create({ followerId, followingId });

        return {
            id: newFollow.id,
            followerId: newFollow.followerId,
            followingId: newFollow.followingId,
            followedAt: newFollow.followedAt,
        };
    } catch (error) {
        throw new Error('Lỗi khi tạo follow: ' + error.message);
    }
};

const getFollow = async (userId) => {
  try {
      // Kiểm tra userId có tồn tại không
      const user = await User.findByPk(userId);
      if (!user) {
          return { error: "Người dùng không tồn tại.", status: 404 };
      }

      // Tìm những người mà user đang follow
      const followingList = await Follow.findAll({
          where: { followerId: userId },
          include: [{ model: User, as: 'Following', attributes: ['id', 'username'] }]
      });

      // Tìm những người đang follow user
      const followersList = await Follow.findAll({
          where: { followingId: userId },
          include: [{ model: User, as: 'Followers', attributes: ['id', 'username'] }]
      });

      return {
          userId,
          following: followingList.map(f => f.Following),
          followers: followersList.map(f => f.Followers),
      };
  } catch (error) {
      throw new Error("Lỗi khi lấy danh sách follow: " + error.message);
  }
};

module.exports = { createFollow, getFollow, getFollow };
