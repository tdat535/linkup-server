const express = require("express");
const authenticateToken = require("../middleware/authenticateToken"); // Đảm bảo đường dẫn đúng
const { hideMediaPost, unHideMediaPost, getAllUser, getAllMediaPost, hideUser, unHideUser, dashboard } = require("../services/admin-services");

const router = express.Router();

router.get("/getAllMediaPost", authenticateToken, async (req, res) => {
  console.log("User Info:", req.user); // Kiểm tra dữ liệu từ JWT
  try {
    if (req.user.type !== "admin") {
      return res.status(403).send({
        isSuccess: false,
        message: "Bạn không có quyền truy cập.",
      });
    }

    const mediaPosts = await getAllMediaPost();
    if (!mediaPosts.isSuccess) {
      return res.status(mediaPosts.status).send({
        isSuccess: false,
        status: mediaPosts.status,
        message: mediaPosts.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(mediaPosts);
  } catch (error) {
    res.status(400).send("Something went wrong!");
    console.log(error);
  }
});

router.put("/hidePost/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra xem người dùng có phải là admin hay không
    if (req.user.type !== "admin") {
      return res.status(403).send({
        isSuccess: false,
        message: "Bạn không có quyền truy cập.",
      });
    }

    const postId = req.params.id; // Lấy ID của bài viết từ URL

    // Gọi service để ẩn bài viết
    const result = await hideMediaPost(postId);

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

router.put("/unHidePost/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra xem người dùng có phải là admin hay không
    if (req.user.type !== "admin") {
      return res.status(403).send({
        isSuccess: false,
        message: "Bạn không có quyền truy cập.",
      });
    }

    const postId = req.params.id; // Lấy ID của bài viết từ URL

    // Gọi service để ẩn bài viết
    const result = await unHideMediaPost(postId);

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

router.get("/getAllUser", authenticateToken, async (req, res) => {
  console.log("User Info:", req.user); // Kiểm tra dữ liệu từ JWT
  try {
    if (req.user.type !== "admin") {
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
    if (req.user.type !== "admin") {
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

    res.status(200).send(result);
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
    if (req.user.type !== "admin") {
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

    res.status(200).send(result);

  } catch (error) {
    console.error("Error hiding post:", error);
    res.status(500).send({
      isSuccess: false,
      message: "Lỗi khi ẩn bài viết, vui lòng thử lại sau.",
    });
  }
});

router.get("/dashboard", authenticateToken, async (req, res) => {
  console.log("User Info:", req.user); // Kiểm tra dữ liệu từ JWT
  try {
    if (req.user.type !== "admin") {
      return res.status(403).send({
        isSuccess: false,
        message: "Bạn không có quyền truy cập.",
      });
    }

    const result = await dashboard();

    if (!result.isSuccess) {
      return res.status(result.status).send({
        isSuccess: false,
        status: result.status,
        message: result.message || "Có lỗi xảy ra.",
      });
    }

    res.status(200).send(result);
  } catch (error) {
    res.status(400).send("Something went wrong!");
    console.log(error);
  }
});

module.exports = router;
