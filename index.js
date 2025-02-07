require('dotenv').config();
const express = require('express');

const { sequelize, connectDB } = require('./config/database');

const app = express();

app.use(express.json());

// Import model để đảm bảo Sequelize thiết lập quan hệ
require('./models/user');
require('./models/mediaPost');
require('./models/comment');

// Import routes
app.use("/api-docs", require("./routes/swagger")); 

app.use('/api/auth', require('./routes/user')); 
app.use('/api/media', require('./routes/mediaPost')); 
app.use('/api/comment', require('./routes/comment'));

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



