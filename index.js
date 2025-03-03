require('dotenv').config();
const express = require('express');
const { sequelize, connectDB } = require('./config/database');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Import models
require('./models/user');
require('./models/mediaPost');
require('./models/comment');
require('./models/like');
require('./models/messenger');

app.use('/api/auth', require('./routes/user'));
app.use('/api/media', require('./routes/mediaPost'));
app.use('/api/comment', require('./routes/comment'));
app.use('/api/like', require('./routes/like'));
app.use('/api/texting', require('./routes/messenger'));
app.use('/api/follow',require('./routes/follow'));
app.use("/upload", require("./routes/upload"));

app.use("/uploads", express.static("uploads")); // Cho phép truy cập ảnh đã tải lên

// Đọc file API document
const path = require('path');
const redoc = require('redoc-express');
const fs = require('fs');
// Kiểm tra file JSON trước khi gửi
app.get('/docs/api-documents.json', (req, res) => {
  const filePath = path.join(__dirname, 'docs', 'api-documents.json');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(filePath);
});
// Serve API documentation using Redoc
app.get('/docs', redoc({
  title: 'LinkUp API Docs',
  specUrl: '/docs/api-documents.json',
}));


// Kết nối DB và chạy server
connectDB().then(() => {
  sequelize.sync({ alter: true })
    .then(() => console.log('✅ Đã đồng bộ database'))
    .catch(err => console.error('❌ Có lỗi khi đồng bộ database:', err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
});
