const RefreshToken = require("../models/refreshToken");

const deleteExpiredTokens = async () => {
  try {
    await RefreshToken.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });
    console.log("Deleted expired refresh tokens");
  } catch (error) {
    console.error("Error deleting expired tokens:", error);
  }
};

setInterval(deleteExpiredTokens, 60 * 60 * 1000); 