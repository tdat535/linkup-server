// const MediaVideo = require("../models/mediaVideo");
// const Follow = require("../models/follow");
// const User = require("../models/user");
// const cloudinary = require("cloudinary").v2;

// // Cấu hình Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const createMediaVideo = async (mediaVideoData) => {
//   try {
//     if (!mediaVideoData.content || mediaVideoData.content.trim() === "") {
//       return {
//         isSuccess: false,
//         status: 400,
//         error: "Thiếu thông tin bài viết video.",
//       };
//     }

//     let videoUrl = null;

//     if (mediaVideoData.video && mediaVideoData.video.buffer) {
//       const uploadResponse = await new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { folder: 'media_videos', resource_type: 'video' },
//           (error, result) => {
//             if (error) {
//               reject("Error uploading video to Cloudinary");
//             } else {
//               resolve(result);
//             }
//           }
//         );

//         const bufferStream = new require("stream").PassThrough();
//         bufferStream.end(mediaVideoData.video.buffer);
//         bufferStream.pipe(uploadStream);
//       });

//       videoUrl = uploadResponse.secure_url;
//       console.log("Video uploaded to Cloudinary:", videoUrl);
//     }

//     const newMediaVideo = new MediaVideo({
//       content: mediaVideoData.content,
//       video: videoUrl,
//       userId: mediaVideoData.userId,
//     });

//     await newMediaVideo.save();

//     return {
//       isSuccess: true,
//       status: 200,
//       message: "Tạo bài viết video thành công",
//       id: newMediaVideo.id,
//       content: newMediaVideo.content,
//       video: newMediaVideo.video,
//       userId: newMediaVideo.userId,
//     };
//   } catch (error) {
//     console.error("Error during media video creation:", error);
//     throw new Error("Error creating media video: " + error.message);
//   }
// };

// const getMediaVideos = async (userId) => {
//   try {
//     const followingList = await Follow.findAll({
//       where: { followerId: userId, status: "accepted" },
//       attributes: ["followingId"],
//     });

//     const followedIds = followingList.map((follow) => follow.followingId);
//     followedIds.push(userId);

//     const mediaVideos = await MediaVideo.findAll({
//       where: { userId: followedIds },
//       include: [
//         {
//           model: User,
//           attributes: ["id", "username", "avatar"], // Thêm thông tin username của người đăng bài
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return {
//       isSuccess: true,
//       status: 200,
//       message: "Lấy danh sách video thành công",
//       data: mediaVideos,
//     };
//   } catch (error) {
//     throw new Error("Error getting media videos: " + error.message);
//   }
// };

// const getAllVideoPost = async () => {
//   try {
//     const list = await MediaVideo.findAll({
//       include: [
//         {
//           model: User,
//           attributes: ["id", "username", "avatar"], // Thêm thông tin username của người đăng bài
//         },
//       ],
//     });
//     return {
//       isSuccess: true,
//       status: 200,
//       message: "Lấy danh sách tất cả bài viết video thành công",
//       data: list,
//     };
//   } catch (error) {
//     throw new Error("Error getting media posts: " + error.message);
//   }
// };

// module.exports = { createMediaVideo, getMediaVideos, getAllVideoPost };
