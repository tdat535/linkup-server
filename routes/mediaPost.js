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

router.get("/getAll", async (req, res) => {
  try {
    const mediaPosts = await getAll();
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

router.post("/createPost", authenticateToken, upload.single("image"), async (req, res) => {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    try {
      let imagePath = null;
      if (req.file) {
        imagePath = req.file; // Đảm bảo Multer file được gửi đúng
      }

      const mediaPostData = {
        content: req.body.content,
        userId: req.user.id,
        image : imagePath
      }

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

module.exports = router;
