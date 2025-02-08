require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const { sequelize, connectDB } = require('./config/database');

const app = express();

app.use(express.json());

// Import model để đảm bảo Sequelize thiết lập quan hệ
require('./models/user');
require('./models/mediaPost');
require('./models/comment');

// Import routes
app.use('/api/auth', require('./routes/user')); 
app.use('/api/media', require('./routes/mediaPost')); 
app.use('/api/comment', require('./routes/comment'));

// Cấu hình Swagger JSDoc
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Swagger UI hosted on Vercel",
    },
  },
  apis: [path.join(__dirname, "docs/swagger.js")], // Đọc tài liệu từ docs/swagger.js
};

const swaggerSpec = swaggerJsdoc(options);

// 👉 Cấu hình middleware tùy chỉnh cho Swagger UI trên Vercel
app.use("/api-docs", (req, res, next) => {
  if (req.path === "/") {
    return res.send(swaggerUi.generateHTML(swaggerSpec));
  }
  return swaggerUi.serve(req, res, next);
});

// Route mặc định
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Kết nối DB và đồng bộ Sequelize
connectDB().then(() => {
  sequelize.sync({ alter: true }) // `alter: true` để tự động cập nhật bảng mà không mất dữ liệu
    .then(() => console.log('✅ Đã đồng bộ database'))
    .catch(err => console.error('❌ Có lỗi khi đồng bộ database:', err));

  // Khởi động server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});

module.exports = app;
