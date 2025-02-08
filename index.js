require('dotenv').config();
const express = require('express');
const { sequelize, connectDB } = require('./config/database');

const app = express();
app.use(express.json());

// Import models
require('./models/user');
require('./models/mediaPost');
require('./models/comment');

app.use('/api/auth', require('./routes/user'));
app.use('/api/media', require('./routes/mediaPost'));
app.use('/api/comment', require('./routes/comment'));

const path = require('path');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

// Đọc file API document
const apiSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'api-documents.json'), 'utf8'));

// Cấu hình Swagger UI với customCssUrl
app.get('/swagger', swaggerUi.serve, swaggerUi.setup(apiSpec, {
  swaggerOptions: {
    url: 'https://linkup-server-rust.vercel.app/docs/api-documents.json', // Dùng đường dẫn tuyệt đối
  },
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
}));

// Serve file API JSON
app.get('/docs/api-documents.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'docs', 'api-documents.json'));
});

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
