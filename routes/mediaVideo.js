// const express = require("express");
// const {
//   createMediaVideo,
//   getMediaVideos,
//   getAllVideoPost
// } = require("../services/mediaVideo-services");
// const authenticateToken = require("../middleware/authenticateToken");
// const multer = require("multer");
// const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Tạo bài viết video
// router.post("/createVideo", authenticateToken, upload.single("video"), async (req, res) => {
//   console.log("req.file:", req.file);
//   console.log("req.body:", req.body);

//   try {
//     let videoPath = null;
//     if (req.file) {
//       videoPath = req.file;
//     }

//     const mediaVideoData = {
//       content: req.body.content,
//       userId: req.user.id,
//       video: videoPath
//     };

//     const mediaVideo = await createMediaVideo(mediaVideoData);

//     if (!mediaVideo.isSuccess) {
//       return res.status(mediaVideo.status).send({
//         isSuccess: false,
//         status: mediaVideo.status,
//         message: mediaVideo.error || "Có lỗi xảy ra.",
//       });
//     }

//     res.status(200).send(mediaVideo);
//   } catch (error) {
//     console.error("Error creating media video:", error);
//     res.status(400).json({
//       isSuccess: false,
//       error: "Đã có lỗi xảy ra khi tạo bài viết video. Chi tiết: " + error.message,
//     });
//   }
// });

// // Lấy danh sách bài viết video
// router.get("/getVideos", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const mediaVideos = await getMediaVideos(userId);

//     if (!mediaVideos.isSuccess) {
//       return res.status(mediaVideos.status).send({
//         isSuccess: false,
//         status: mediaVideos.status,
//         message: mediaVideos.error || "Có lỗi xảy ra.",
//       });
//     }

//     res.status(200).send(mediaVideos);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       isSuccess: false,
//       message: "Lỗi khi lấy danh sách video, vui lòng thử lại sau.",
//     });
//   }
// });

// router.get("/getAllVideoPost", authenticateToken, async (req, res) => {
//   console.log("User Info:", req.user); // Kiểm tra dữ liệu từ JWT
//   try {
//     if (req.user.type !== 'admin') {
//       return res.status(403).send({
//         isSuccess: false,
//         message: "Bạn không có quyền truy cập.",
//       });
//     }

//     const mediaPosts = await getAllVideoPost();
//     if (!mediaPosts.isSuccess) {
//       return res.status(mediaPosts.status).send({
//         isSuccess: false,
//         status: mediaPosts.status,
//         message: mediaPosts.error || "Có lỗi xảy ra.",
//       });
//     }
//     res.status(200).send(mediaPosts);
//   } catch (error) {
//     res.status(400).send("Something went wrong!");
//     console.log(error);
//   }
// });

// module.exports = router;
