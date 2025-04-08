const express = require("express");
const {
  register,
  login,
  createNewAccessToken,
  useSearch,
  logout,
  userProfile,
  getAllUser,
  hideUser,
  unHideUser,
  getUserDevices,
  logoutSpecificDevice,
} = require("../services/user-services");
const authenticateToken = require("../middleware/authenticateToken"); // Đảm bảo đường dẫn đúng
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const result = await register(req.body);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send("Something went wrong!");
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = await login(req.body);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.error || "Có lỗi xảy ra.",
      });
    }

    const refreshToken = result.RefreshToken;

    // ✅ Set cookie trước khi gửi response
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Đảm bảo đang dùng HTTPS
      sameSite: "Strict",
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 ngày
    });

    // Sau đó mới gửi toàn bộ thông tin login
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      status: 500,
      message: "Đã có lỗi xảy ra, vui lòng thử lại sau!",
    });
  }
});


router.get("/getUserDevices", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token
    const devices = await getUserDevices(userId);
    if (!devices.isSuccess) {
      return res.status(devices.status).send({
        isSuccess: false,
        status: devices.status,
        message: devices.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(devices);
  } catch (error) {
    console.error("Lỗi lấy danh sách thiết bị:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/logout-device", authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user.id; // Lấy userId từ token
    const result = await logoutSpecificDevice(deviceId, userId);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error("Lỗi khi đăng xuất thiết bị:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token không tồn tại" });
    }

    const result = await refreshTokenService(refreshToken);

    if (!result.isSuccess) {
      res.status(result.status).json({ message: result.error });
    }
    // nếu muốn cập nhật cookie mới
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true, // 👈 nếu dùng HTTPS
      sameSite: "Strict",
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


router.post("/logout", async (req, res) => {
  try {
    // Kiểm tra xem refreshToken có được gửi từ client không
    const { refreshToken } = req.body;
    const result = await logout(refreshToken);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.error || "Có lỗi xảy ra.",
      });
    }
    
    res.clearCookie("refreshToken");

    res.status(200).send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      status: 500,
      message: "Đã có lỗi xảy ra, vui lòng thử lại sau!",
    });
  }
});

router.post("/search", authenticateToken, async (req, res) => {
  try {
    const result = await useSearch(req.body);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      status: 500,
      message: "Đã có lỗi xảy ra, vui lòng thử lại sau!",
    });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.query.userId); // ID của người cần xem
    const currentUserId = req.user.id; // Lấy từ JWT (đã là number)
    const result = await userProfile(userId, currentUserId);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      status: 500,
      message: "Đã có lỗi xảy ra, vui lòng thử lại sau!",
    });
  }
});

module.exports = router;
