const RefreshToken = require("../models/refreshToken");

const deleteExpiredTokens = async () => {
  try {
    await RefreshToken.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() }, // Xóa token hết hạn
      },
    });
    console.log("Deleted expired refresh tokens");
  } catch (error) {
    console.error("Error deleting expired tokens:", error);
  }
};

setInterval(deleteExpiredTokens, 60 * 60 * 1000); // Chạy mỗi giờ