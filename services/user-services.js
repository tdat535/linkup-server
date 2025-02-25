const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('../models/user'); // Assuming you have a User model
const RefreshToken = require('../models/refreshToken');
const { Op } = require("sequelize");

const register = async (userData) => {
    try {
        // Kiểm tra xem username đã tồn tại trong database chưa
        const existingUser = await User.findOne({ where: { username: userData.username } });

        if (/\s/.test(userData.username)) {
            return { error: "Username không được chứa khoảng trắng", status: 400 };
        }

        if(!userData.username || !userData.password || !userData.email || !userData.phonenumber){
            return { error: "Vui lòng điền đầy đủ thông tin", status: 400 };
        }
        if (existingUser) {
            return { error: "Username đã tồn tại", status: 400 };
        }
        if (10 > userData.phonenumber.length || 11 < userData.phonenumber.length){
            return { error: "Số điện thoại sai định dạng", status: 401 };
        }
        if (!userData.email.endsWith("@gmail.com")){
            return { error: "Email sai định dạng", status: 401 };
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({
            username: userData.username,
            email: userData.email,
            phonenumber: userData.phonenumber,
            password: hashedPassword
        });
        await newUser.save();
        return {
            UserId: newUser.id,
            Username: newUser.username,
            Email: newUser.email || null,
            phonenumber: newUser.phonenumber || null,
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
            return { error: "Người dùng không tồn tại", status: 404 };
        }

        const isPasswordValid = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordValid) {
            return { error: "Sai mật khẩu", status: 401 };
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await RefreshToken.create({ userId: user.id, token: refreshToken });
        // // 🔥 Kiểm tra nếu user đã có token thì update, nếu chưa có thì tạo mới
        // const existingToken = await RefreshToken.findOne({ where: { userId: user.id } });

        // if (existingToken) {
        //     await existingToken.update({ token: refreshToken });
        // } else {
        //     
        // }

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

const logout = async (refreshToken) => {
    try {
        // Tìm Refresh Token trong cơ sở dữ liệu
        const existingToken = await RefreshToken.findOne({ where: { token: refreshToken } });

        // Nếu không tìm thấy token
        if (!existingToken) {
            return { error: "Không tìm thấy Refresh Token", status: 404 };
        }

        // Xóa refresh token khỏi cơ sở dữ liệu
        await existingToken.destroy();

        return {
            message: "Người dùng đã đăng xuất thành công",
            status: 200
        };
    } catch (error) {
        console.error("Logout Error:", error);
        return { error: "Lỗi khi đăng xuất", status: 500 };
    }
};


const useSearch = async (userData) => {
    try {
      // Kiểm tra xem có ít nhất một trong ba trường không trống
      if (!userData.email && !userData.username && !userData.phonenumber) {
        return { error: "Vui lòng nhập username, email hoặc số điện thoại để tìm kiếm.", status: 400 };
      }
  
      // Tự động phân loại input
      if (userData.phonenumber && userData.phonenumber.startsWith("0")) {
        userData.phonenumber = userData.phonenumber.trim(); // Nếu bắt đầu với '0' là phonenumber
      } else if (userData.email && userData.email.includes("@gmail.com")) {
        userData.email = userData.email.trim(); // Nếu chứa '@gmail.com' là email
      } else {
        userData.username = userData.username.trim(); // Còn lại là username
      }
  
      // Tiến hành tìm kiếm với điều kiện đã phân loại
      const dataexist = await User.findOne({
        where: {
          [Op.or]: [
            userData.email ? { email: userData.email } : null,
            userData.username ? { username: userData.username } : null,
            userData.phonenumber ? { phonenumber: userData.phonenumber } : null
          ].filter(Boolean) // Loại bỏ các giá trị null để tránh lỗi
        }
      });
  
      if (!dataexist) {
        return { error: "Không tìm thấy người dùng này.", status: 600 };
      }
  
      return {
        userId: dataexist.id,
        username: dataexist.username,
        email: dataexist.email,
        phonenumber: dataexist.phonenumber
      };
    } catch (error) {
      console.error("Search Error:", error);
      return { error: "Lỗi xảy ra khi tìm kiếm", status: 601 };
    }
  };
  


module.exports = { register, login, createNewAccessToken, logout, useSearch, logout };
