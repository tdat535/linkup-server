// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require("cors");
const { sequelize, connectDB } = require('./config/database');
const { initSocket } = require('./services/socket');
const http = require("http");

const app = express(); // Khởi tạo app trước khi tạo server
const server = http.createServer(app); // Tạo server HTTP

// const corsOptions = {
//   origin: ['http://localhost:3000', 'http://api-linkup.id.vn'], // Cấp phép các domain gửi yêu cầu
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

app.use(cors()); // Đảm bảo cấu hình này được đặt đúng
app.use(express.json());
initSocket(server); // Khởi tạo socket.io và liên kết với server
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

app.use(cors());
// Đọc file API document
// API Documentation (Redoc)
const redoc = require('redoc-express');
app.get('/docs/api-documents.json', (req, res) => {
  const filePath = path.join(__dirname, 'docs', 'api-documents.json');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(filePath);
});
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