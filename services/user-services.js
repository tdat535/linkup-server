const bcrypt = require('bcryptjs');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('../models/user'); // Assuming you have a User model
const RefreshToken = require('../models/refreshToken');
const Follow = require('../models/follow');
const { Op } = require("sequelize");

const { getFollow } = require('./follow-services');

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
            password: hashedPassword,
            realname: userData.realname || null,
            avatar: "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
        });
        await newUser.save();
        return {
            UserId: newUser.id,
            Username: newUser.username,
            Email: newUser.email || null,
            phonenumber: newUser.phonenumber || null,
            UserImage: newUser.avatar || null,
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
            Email: user.email,
            Realname: user.realname,
            Phonenumber: user.phonenumber,
            Avatar: user.avatar,
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
      if (!userData.email && !userData.username && !userData.phonenumber) {
          return { error: "Vui lòng nhập username, email hoặc số điện thoại để tìm kiếm.", status: 400 };
      }
      console.log("currentUserId:", userData.currentUser);


      const searchConditions = [];
      if (userData.email) searchConditions.push({ email: { [Op.like]: `%${userData.email}%` } });
      if (userData.username) searchConditions.push({ username: { [Op.like]: `%${userData.username}%` } });
      if (userData.phonenumber) searchConditions.push({ phonenumber: { [Op.like]: `%${userData.phonenumber}%` } });

      const users = await User.findAll({
          where: { [Op.or]: searchConditions },
          attributes: ["id", "username", "email", "phonenumber", "avatar", "realname"],
      });

      if (!users.length) {
          return { error: "Không tìm thấy người dùng phù hợp.", status: 600 };
      }



      return users;

  } catch (error) {
      console.error("Search Error:", error);
      return { error: "Lỗi xảy ra khi tìm kiếm", status: 601 };
  }
};

const userProfile = async (userId, currentUserId) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return { error: "Không tìm thấy người dùng", status: 404 };
        }

        // 🔥 Lấy danh sách follow
        const followData = await getFollow(userId);

        // 🔥 Nếu xem profile của người khác, kiểm tra trạng thái follow
        let status = null;
        if (userId !== currentUserId) {
            const followRequest = await Follow.findOne({ where: { followerId: currentUserId, followingId: userId } });
            const followBack = await Follow.findOne({ where: { followerId: userId, followingId: currentUserId } });

            status = "Kết bạn"; // Mặc định

            if (followRequest && followRequest.status === 'accepted' && followBack && followBack.status === 'accepted') {
                status = "Bạn bè";
            } else if (followRequest && followRequest.status === 'accepted') {
                status = "Đang chờ chấp nhận";
            }
        }

        return {
            UserId: user.id,
            username: user.username,
            email: user.email,
            realname: user.realname,
            phonenumber: user.phonenumber,
            avatar: user.avatar,
            following: followData.following, 
            followers: followData.followers, 
            status, 
        };
    } catch (error) {
        console.error("Profile Error:", error);
        return { error: "Lỗi xảy ra khi lấy thông tin người dùng", status: 500 };
    }
};
  
  
module.exports = { register, login, createNewAccessToken, logout, useSearch, logout, userProfile};
