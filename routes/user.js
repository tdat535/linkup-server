const express = require("express");
const {
  register,
  login,
  refreshTokenService,
  useSearch,
  logout,
  userProfile,
  getUserDevices,
  logoutSpecificDevice,
  updateProfile,
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
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // 👈 Bắt buộc nếu dùng HTTPS
      sameSite: 'None', // 👈 Nếu frontend và backend khác domain
      maxAge: 90 * 24 * 60 * 60 * 1000,
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
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // 👈 Bắt buộc nếu dùng HTTPS
      sameSite: 'None', // 👈 Nếu frontend và backend khác domain
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
    // 👇 Lấy refreshToken từ cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).send({
        isSuccess: false,
        status: 400,
        message: "Không tìm thấy Refresh Token trong cookie.",
      });
    }

    const result = await logout(refreshToken);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.error || "Có lỗi xảy ra.",
      });
    }

    // 👇 Xóa cookie refreshToken
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).send(result);
  } catch (error) {
    console.error("Logout Error:", error);
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
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.put("/updateProfile", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    let filePath = null;
    if (req.file) {
      filePath = req.file;
    }

    const { username, phonenumber, email, gender } = req.body;

    const updatedData = {
      username,
      phonenumber,
      email,
      gender,
    };

    const userId = req.user.id;

    const result = await updateProfile(userId, updatedData, filePath); 

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
