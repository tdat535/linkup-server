const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('../models/user'); // Assuming you have a User model
const RefreshToken = require('../models/refreshToken');

const register = async (userData) => {
    try {
        // Kiểm tra xem username đã tồn tại trong database chưa
        const existingUser = await User.findOne({ where: { username: userData.username } });

        if (existingUser) {
            return { error: "Username đã tồn tại", status: 400 };
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({
            username: userData.username,
            password: hashedPassword
        });
        await newUser.save();
        return {
            UserId: newUser.id,
            Username: newUser.username,
            Email: newUser.email || null,
            UserImage: newUser.userImage || null,
            SocialMedia: newUser.socialMedia || [],
            UserType: newUser.userType || 'user',
         };
    } catch (error) {
        throw new Error('Error registering user: ' + error.message);
    }
};

const login = async (userData) => {
    try {
        const user = await User.findOne({ where: { username: userData.username } });

        if (!user) {
            return { error: "Người dùng ko tồn tại", status: 404 };
        }

        const isPasswordValid = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordValid) {
            return { error: "Sai mật khẩu", status: 401 };
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // 🔥 Sửa lỗi userId -> user_id
        await RefreshToken.create({ token: refreshToken, user_id: user.id });

        return {
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            UserId: user.id,
            Username: user.username,
            Email: user.email || null,
            UserImage: user.userImage || null,
            SocialMedia: user.socialMedia || [],
            UserType: user.userType || "user",
        };
    } catch (error) {
        console.error("Login Error:", error);
        return { error: "Error logging in", status: 500 };
    }
};

const createNewAccessToken = async (token) => {
    try {
        if (!token) {
            throw new Error('Refresh Token is required');
        }

        // Kiểm tra Refresh Token có tồn tại trong database không
        const storedToken = await RefreshToken.findOne({ where: { token } });

        if (!storedToken) {
            throw new Error('Invalid Refresh Token');
        }

        // Giải mã Refresh Token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            throw new Error('User not found');
        }

        // Tạo Access Token mới
        const newAccessToken = generateAccessToken(user.id);

        return {
            IsSuccess: true,
            Status: 200,
            AccessToken: newAccessToken,
            TokenType: "bearer"
        };
    } catch (error) {
        throw new Error('Error refreshing token: ' + error.message);
    }
};

// Hàm tạo Access Token
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Hàm tạo Refresh Token
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '1h' });
};

module.exports = { register, login, createNewAccessToken };