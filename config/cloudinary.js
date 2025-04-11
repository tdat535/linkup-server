const cloudinary = require("cloudinary").v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Lấy từ Cloudinary Console
  api_key: process.env.CLOUDINARY_API_KEY, // Lấy từ Cloudinary Console
  api_secret: process.env.CLOUDINARY_API_SECRET, // Lấy từ Cloudinary Console
});

module.exports = cloudinary;