const express = require('express');
const app = express();

app.use(express.json()); // Middleware để xử lý JSON request

app.use('/api/auth', require('./routes/user')); // Có thể cần thay đổi nếu bạn đã chuyển route vào thư mục /api

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
