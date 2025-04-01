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

router.get("/getAllUser", authenticateToken, async (req, res) => {
  console.log("User Info:", req.user); // Kiểm tra dữ liệu từ JWT
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).send({
        isSuccess: false,
        message: "Bạn không có quyền truy cập.",
      });
    }

    const allUser = await getAllUser();
    if (!allUser.isSuccess) {
      return res.status(allUser.status).send({
        isSuccess: false,
        status: allUser.status,
        message: allUser.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(allUser);
  } catch (error) {
    res.status(400).send("Something went wrong!");
    console.log(error);
  }
});

router.put("/hideUser/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra xem người dùng có phải là admin hay không
    if (req.user.type !== 'admin') {
      return res.status(403).send({
        isSuccess: false,
        message: "Bạn không có quyền truy cập.",
      });
    }

    const userId = req.params.id; // Lấy ID của bài viết từ URL

    // Gọi service để ẩn bài viết
    const result = await hideUser(userId);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.message || "Có lỗi xảy ra.",
      });
    }

    res.status(200).send({
      isSuccess: true,
      message: "Bài viết đã được ẩn thành công.",
    });
  } catch (error) {
    console.error("Error hiding post:", error);
    res.status(500).send({
      isSuccess: false,
      message: "Lỗi khi ẩn bài viết, vui lòng thử lại sau.",
    });
  }
});

router.put("/unHideUser/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra xem người dùng có phải là admin hay không
    if (req.user.type !== 'admin') {
      return res.status(403).send({
        isSuccess: false,
        message: "Bạn không có quyền truy cập.",
      });
    }

    const userId = req.params.id; // Lấy ID của bài viết từ URL

    // Gọi service để ẩn bài viết
    const result = await unHideUser(userId);

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.message || "Có lỗi xảy ra.",
      });
    }

    res.status(200).send({
      isSuccess: true,
      message: "Bài viết đã được hiện thị thành công.",
    });
  } catch (error) {
    console.error("Error hiding post:", error);
    res.status(500).send({
      isSuccess: false,
      message: "Lỗi khi ẩn bài viết, vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
