const express = require("express");
const {
  getMediaPosts,
  createMediaPost,
  getAll,
} = require("../services/mediaPost-services");
const authenticateToken = require("../middleware/authenticateToken"); // Đảm bảo đường dẫn đúng
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Cấu hình Multer
const storage = multer.memoryStorage(); // Lưu trữ ảnh trong bộ nhớ thay vì lưu trên đĩa
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]; // Chỉ cho phép JPG, PNG, WEBP
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ các định dạng: .jpg, .png, .webp!"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.get("/getPost", authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).send({
        isSuccess: false,
        message: "Missing userId parameter",
      });
    }

    const mediaPosts = await getMediaPosts(userId); // Lấy bài viết từ database
    res.status(200).send({
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách bài viết thành công",
      data: mediaPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      isSuccess: false,
      message: "Lỗi khi lấy bài viết, vui lòng thử lại sau.",
    });
  }
});

router.get("/getAll", async (req, res) => {
  try {
    const mediaPosts = await getAll();
    res.status(200).send({
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách bài viết thành công",
      data: mediaPosts,
    });
  } catch (error) {
    res.status(400).send("Something went wrong!");
    console.log(error);
  }
});

router.post(
  "/createPost",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    try {
      const { content, userId } = req.body;

      if (!content || !userId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Thiếu thông tin bài viết hoặc người dùng.",
        });
      }

      let imagePath = null;
      if (req.file) {
        imagePath = req.file; // Đảm bảo Multer file được gửi đúng
      }

      const apiKey = req.headers["api_key"];
      if (!apiKey || apiKey !== process.env.CLOUDINARY_API_KEY) {
        return res.status(400).json({
          isSuccess: false,
          message: "Must supply api_key",
        });
      }

      const mediaPost = await createMediaPost({
        content,
        userId,
        image: imagePath,
      });

      res.status(200).json({
        isSuccess: true,
        status: 200,
        message: "Tạo bài viết thành công",
        data: mediaPost,
      });
    } catch (error) {
      console.error("Error creating media post:", error);
      res.status(400).json({
        isSuccess: false,
        error: "Đã có lỗi xảy ra khi tạo bài viết. Chi tiết: " + error.message,
      });
    }
  }
);

module.exports = router;
