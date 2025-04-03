const express = require("express");
const {
  getMediaPosts,
  createMediaPost,
  getTrendingPosts
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

router.get("/getTrendingPost", authenticateToken, async (req, res) => {
  try {
    const mediaPosts = await getTrendingPosts(); // Lấy bài viết từ database
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

const multer = require("multer");

const storage = multer.memoryStorage(); // Lưu file vào bộ nhớ để upload lên Cloudinary
const upload = multer({ storage: storage });

router.post("/createMedia", authenticateToken, upload.single("file"), async (req, res) => {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    try {
      let filePath = null;
      if (req.file) {
        filePath = req.file;
      }

      const { type, content } = req.body;
      if (!type || !["post", "video"].includes(type)) {
        return res.status(400).json({
          isSuccess: false,
          error: "Loại nội dung không hợp lệ. Chọn 'post' hoặc 'video'.",
        });
      }

      const mediaData = {
        content,
        userId: req.user.id,
        file: filePath,
        type,
      };

      const mediaResponse = await createMediaPost(mediaData);

      if (!mediaResponse.isSuccess) {
        return res.status(mediaResponse.status).send({
          isSuccess: false,
          status: mediaResponse.status,
          message: mediaResponse.error || "Có lỗi xảy ra.",
        });
      }

      res.status(200).send(mediaResponse);
    } catch (error) {
      console.error("Error creating media content:", error);
      res.status(400).json({
        isSuccess: false,
        error: "Đã có lỗi xảy ra khi tạo nội dung. Chi tiết: " + error.message,
      });
    }
  }
);



module.exports = router;
