require('dotenv').config();
const express = require('express');
const { sequelize, connectDB } = require('./config/database');

const app = express();
app.use(express.json());

// Import models
require('./models/user');
require('./models/mediaPost');
require('./models/comment');

const swaggerDocs = require('./config/redoc');
swaggerDocs(app);

app.use('/api/auth', require('./routes/user'));
app.use('/api/media', require('./routes/mediaPost'));
app.use('/api/comment', require('./routes/comment'));

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
