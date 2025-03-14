// const express = require("express");
// const upload = require("../middleware/upload");

// const router = express.Router();

// // API upload ảnh
// router.post("/", upload.single("file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ isSuccess: false, message: "Không có file nào được tải lên" });
//   }

//   const fileUrl = `/uploads/${req.file.filename}`;
//   res.status(200).json({
//     isSuccess: true,
//     message: "Upload ảnh thành công",
//     url: fileUrl,
//   });
// });

// module.exports = router;
