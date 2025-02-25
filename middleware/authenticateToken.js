const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy Bearer token từ header Authorization

    if (!token) {
        return res.status(401).json({ error: 'Token không được cung cấp' });
    }

    // Giải mã token và xác thực người dùng
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        req.user = user; // Lưu thông tin người dùng vào request
        next(); // Tiếp tục với route handler
    });
};

module.exports = authenticateToken;
