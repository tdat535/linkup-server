const express = require("express");
const {
  getMediaPosts,
  createMediaPost,
  getAllMediaPost,
  hideMediaPost,
  unHideMediaPost
} = require("../services/mediaPost-services");
const authenticateToken = require("../middleware/authenticateToken"); // Đảm bảo đường dẫn đúng
const router = express.Router();

router.get("/getPost", authenticateToken, async (req, res) => {
  try {
    //const userId = req.query.userId;
    const userId = req.user.id; // Lấy userId từ JWT
    // if (!userId) {
    //   return res.status(400).send({
    //     isSuccess: false,
    //     message: "Missing userId parameter",
    //   });
    // }

    const mediaPosts = await getMediaPosts(userId); // Lấy bài viết từ database
    if (!mediaPosts.isSuccess) {
      return res.status(mediaPosts.status).send({
        isSuccess: false,
        status: mediaPosts.status,
        message: mediaPosts.error || "Có lỗi xảy ra.",
      });
    }
    res.status(200).send(mediaPosts);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      message: "Lỗi khi lấy bài viết, vui lòng thử lại sau.",
    });
  }
});

router.get("/getAllMediaPost", authenticateToken, async (req, res) => {
  console.log("User Info:", req.user); // Kiểm tra dữ liệu từ JWT
  try {
    if (req.user.type !== 'admin') {
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

const multer = require("multer");

const storage = multer.memoryStorage(); // Lưu file vào bộ nhớ để upload lên Cloudinary
const upload = multer({ storage: storage });

router.post(
  "/createPost",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    try {
      let imagePath = null;
      if (req.file) {
        imagePath = req.file;
      }

      const mediaPostData = {
        content: req.body.content,
        userId: req.user.id,
        image: imagePath,
      };

      const mediaPost = await createMediaPost(mediaPostData);

      if (!mediaPost.isSuccess) {
        return res.status(mediaPost.status).send({
          isSuccess: false,
          status: mediaPost.status,
          message: mediaPost.error || "Có lỗi xảy ra.",
        });
      }

      res.status(200).send(mediaPost);
    } catch (error) {
      console.error("Error creating media post:", error);
      res.status(400).json({
        isSuccess: false,
        error: "Đã có lỗi xảy ra khi tạo bài viết. Chi tiết: " + error.message,
      });
    }
  }
);

router.put("/hidePost/:id", authenticateToken, async (req, res) => {
  try {
    // Kiểm tra xem người dùng có phải là admin hay không
    if (req.user.type !== 'admin') {
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
    if (req.user.type !== 'admin') {
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

module.exports = router;
