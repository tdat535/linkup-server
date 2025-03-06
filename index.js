require('dotenv').config();
const express = require('express');
const path = require('path'); // Đảm bảo require path sớm
const fs = require('fs');
const cors = require("cors");
const { sequelize, connectDB } = require('./config/database');

const app = express();
const corsOptions = {
  origin: ['http://localhost:3000', 'http://api-linkup.id.vn', 'http://localhost:5173'], // Cấp phép các domain gửi yêu cầu
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization','api_key']
};

app.use(cors(corsOptions)); // Đảm bảo cấu hình này được đặt đúng
app.use(express.json());

// Kiểm tra và tạo thư mục uploads nếu chưa tồn tại
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use('/uploads', express.static(uploadPath));

// Import models
require('./models/user');
require('./models/mediaPost');
require('./models/comment');
require('./models/like');
require('./models/messenger');

// Routes
app.use('/api/auth', require('./routes/user'));
app.use('/api/media', require('./routes/mediaPost'));
app.use('/api/comment', require('./routes/comment'));
app.use('/api/like', require('./routes/like'));
app.use('/api/texting', require('./routes/messenger'));
app.use('/api/follow', require('./routes/follow'));
app.use("/upload", require("./routes/upload"));

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
  sequelize.sync() // Loại bỏ `alter: true` nếu không cần thiết
    .then(() => console.log('✅ Đã đồng bộ database'))
    .catch(err => console.error('❌ Có lỗi khi đồng bộ database:', err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📄 API Docs: http://localhost:${PORT}/docs`);
  });
});
