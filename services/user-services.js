const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('../models/user'); // Assuming you have a User model
const RefreshToken = require('../models/refreshToken');

const register = async (userData) => {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({
            username: userData.username,
            email: userData.email,
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
        const user = await User.findOne({ where: { email: userData.email } }); 
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        //const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await RefreshToken.create({ token: refreshToken, userId: user.id });

        return { 
            AccesToken: accessToken,
            RefreshToken: refreshToken, 
            UserId: user.id,
            Username: user.username,
            Email: user.email || null,
            UserImage: user.userImage || null,
            SocialMedia: user.socialMedia || [],
            UserType: user.userType || 'user',
        }
    } catch (error) {
        throw new Error('Error logging in: ' + error.message);
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