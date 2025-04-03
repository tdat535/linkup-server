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
    console.log(result)
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
  }
  catch (error) {
    console.error("Lỗi khi đăng xuất thiết bị:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await createNewAccessToken(refreshToken);

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
