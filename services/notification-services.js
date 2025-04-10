const Noti = require("../models/noti");
const User = require("../models/user");

const getNotification = async (userId) => {
  try {

    if (!userId)
      return {
        isSuccess: true,
        status: 404,
        error: "Người dùng không tồn tại.",
      };

    const notifications = await Noti.findAll({
      where: { receiverId: userId },
      order: [["createdAt", "DESC"]],
      include: {
        model: User,
        attributes: ["id", "username", "avatar"],
      },
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách thông báo thành công",
      data: notifications,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách follow:", error);
    throw new Error("Lỗi khi lấy danh sách follow: " + error.message);
  }
};

module.exports = { getNotification };
