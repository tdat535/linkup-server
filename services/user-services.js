const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Assuming you have a User model
const RefreshToken = require("../models/refreshToken");
const Follow = require("../models/follow");
const MediaPost = require("../models/mediaPost");
const { Op } = require("sequelize");
const cloudinary = require("../config/cloudinary");

const { getFollow } = require("./follow-services");

const register = async (userData) => {
  try {
    // Kiểm tra xem username đã tồn tại trong database chưa
    const existingUser = await User.findOne({
      where: { email: userData.email },
    });

    if (/\s/.test(userData.username)) {
      return {
        isSuccess: false,
        status: 400,
        error: "Username không được chứa khoảng trắng",
      };
    }

    if (
      !userData.username ||
      !userData.password ||
      !userData.email ||
      !userData.phonenumber
    ) {
      return {
        isSuccess: false,
        status: 400,
        error: "Vui lòng điền đầy đủ thông tin",
      };
    }
    if (existingUser) {
      return {
        isSuccess: false,
        status: 400,
        error: "Username đã tồn tại",
      };
    }
    if (10 > userData.phonenumber.length || 11 < userData.phonenumber.length) {
      return {
        isSuccess: false,
        status: 400,
        error: "Số điện thoại sai định dạng",
      };
    }
    if (!userData.email.endsWith("@gmail.com")) {
      return {
        isSuccess: false,
        status: 400,
        error: "Email sai định dạng",
      };
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      username: userData.username,
      email: userData.email,
      phonenumber: userData.phonenumber,
      password: hashedPassword,
      realname: "test",
      avatar:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    });
    await newUser.save();
    return {
      isSuccess: true,
      status: 200,
      message: "Đăng ký thành công",
      UserId: newUser.id,
      Username: newUser.username,
      Email: newUser.email || null,
      phonenumber: newUser.phonenumber || null,
      UserImage: newUser.avatar || null,
      SocialMedia: newUser.socialMedia || [],
      UserType: newUser.userType || "user",
    };
  } catch (error) {
    throw new Error("Error registering user: " + error.message);
  }
};

const login = async (userData) => {
  try {
    const user = await User.findOne({ where: { email: userData.email } });
    console.log("Received device:", userData.device);
    if (!user) {
      return {
        isSuccess: false,
        status: 404,
        error: "Người dùng không tồn tại",
      };
    }

    if (user.status !== "active") {
      return { isSuccess: false, status: 403, error: "Tài khoản bị khóa" };
    }

    const isPasswordValid = await bcrypt.compare(
      userData.password,
      user.password
    );
    if (!isPasswordValid) {
      return { isSuccess: false, status: 401, error: "Sai mật khẩu" };
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    

    // Lưu RefreshToken vào DB với thông tin thiết bị và thời gian hết hạn 24h
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      device: userData.device || "unknown", // Lưu tên thiết bị
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 ngày
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Đăng nhập thành công",
      AccessToken: accessToken,
      RefreshToken: refreshToken,
      UserId: user.id,
      Username: user.username,
      Email: user.email,
      Phonenumber: user.phonenumber,
      Avatar: user.avatar,
      UserType: user.type || "user",
    };
  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Error logging in", status: 500 };
  }
};

const refreshTokenService = async (token) => {
  try {
    if (!token) {
      return {
        isSuccess: false,
        status: 400,
        error: "Token không hợp lệ",
      };
    }

    const existingToken = await RefreshToken.findOne({ where: { token } });

    if (!existingToken) {
      return {
        isSuccess: false,
        status: 403,
        error: "Token không tồn tại trong hệ thống",
      };
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return {
        isSuccess: false,
        status: 404,
        error: "Không tìm thấy người dùng",
      };
    }

    // Tạo access token mới
    const newAccessToken = generateAccessToken(user);

    return {
      isSuccess: true,
      status: 200,
      message: "Tạo access token mới thành công",
      accessToken: newAccessToken,
      refreshToken: token, // hoặc có thể tạo mới nếu bạn muốn xoay vòng token
    };
  } catch (err) {
    console.error("Lỗi khi refresh token:", err);
    return {
      isSuccess: false,
      status: 401,
      error: "Token không hợp lệ hoặc đã hết hạn",
    };
  }
};

// Hàm tạo Access Token
const generateAccessToken = (User) => {
  return jwt.sign(
    {
      id: User.id,
      type: User.type, // Thêm type vào token
    },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );
};

// Hàm tạo Refresh Token
const generateRefreshToken = (User) => {
  return jwt.sign(
    {
      id: User.id,
      type: User.type, // Thêm type vào token
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "90d",
    }
  );
};

const logout = async (refreshToken) => {
  try {
    const existingToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (!existingToken) {
      return { error: "Không tìm thấy Refresh Token", status: 404 };
    }

    await existingToken.destroy();

    return {
      isSuccess: true,
      status: 200,
      message: "Người dùng đã đăng xuất thành công",
    };
  } catch (error) {
    console.error("Logout Error:", error);
    return { error: "Lỗi khi đăng xuất", status: 500 };
  }
};

const getUserDevices = async (userId) => {
  try {
    const devices = await RefreshToken.findAll({
      where: { userId },
      attributes: ["id", "device", "createdAt"], // Chỉ lấy thông tin cần thiết
    });

    if (!userId) {
      return { error: "Không tìm thấy User Id", status: 404 };
    }

    if (!devices) {
      return { error: "Không tìm thấy Devices", status: 404 };
    }

    return {
      isSuccess: true,
      status: 200,
      message: "Lấy danh sách thiết bị thành công",
      data: devices,
    };
  } catch (error) {
    console.error("Lỗi lấy danh sách thiết bị:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const logoutSpecificDevice = async (deviceId, userId) => {
  try {
    // Xóa token của thiết bị được chọn
    const deleted = await RefreshToken.destroy({
      where: { id: deviceId, userId },
    });

    if (!deleted) {
      return { error: "Không tìm thấy Devices", status: 404 };
    }

    return {
      isSuccess: true,
      status: 200,
      message: "Đăng xuất thiết bị thành công",
    };
  } catch (error) {
    console.error("Lỗi logout thiết bị:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const useSearch = async (userData) => {
  try {
    if (!userData.email && !userData.username && !userData.phonenumber) {
      return {
        error: "Vui lòng nhập username, email hoặc số điện thoại để tìm kiếm.",
        status: 400,
      };
    }
    console.log("currentUserId:", userData.currentUser);

    const searchConditions = [];
    if (userData.email)
      searchConditions.push({ email: { [Op.like]: `%${userData.email}%` } });
    if (userData.username)
      searchConditions.push({
        username: { [Op.like]: `%${userData.username}%` },
      });
    if (userData.phonenumber)
      searchConditions.push({
        phonenumber: { [Op.like]: `%${userData.phonenumber}%` },
      });

    const users = await User.findAll({
      where: { [Op.or]: searchConditions },
      attributes: ["id", "username", "email", "phonenumber", "avatar"],
    });

    if (!users.length) {
      return { error: "Không tìm thấy người dùng phù hợp.", status: 600 };
    }
    return {
      isSuccess: true,
      status: 200,
      message: "Tìm thấy người dùng",
      data: users,
    };
  } catch (error) {
    console.error("Search Error:", error);
    return { error: "Lỗi xảy ra khi tìm kiếm", status: 601 };
  }
};

const getUserPosts = async (userId) => {
  return await MediaPost.findAll({
    where: {
      userId,
      status: "active", // Chỉ lấy các bài viết có trạng thái là 'active'
    },
    include: [
      {
        model: User,
        attributes: ["username", "avatar"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const userProfile = async (userId, currentUserId) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return { error: "Không tìm thấy người dùng", status: 404 };
    }

    // Lấy danh sách bài viết của người dùng
    const userPosts = await getUserPosts(userId);

    // Nếu tài khoản bị khóa, thay đổi username
    const displayUsername =
      user.status === "inactive" ? "Tài khoản đã bị khóa" : user.username;

    if (userId === currentUserId) {
      return {
        isSuccess: true,
        status: 200,
        message: "Hiển thị trang cá nhân của bạn",
        UserId: user.id,
        username: displayUsername,
        email: user.email,
        phonenumber: user.phonenumber,
        avatar: user.avatar,
        following: (await getFollow(userId)).following,
        followers: (await getFollow(userId)).followers,
        posts: userPosts,
      };
    }

    let followStatus = "Theo dõi";

    const isFollowing = await Follow.findOne({
      where: { followerId: currentUserId, followingId: userId },
    });

    const isFollowedBy = await Follow.findOne({
      where: { followerId: userId, followingId: currentUserId },
    });

    if (isFollowing) {
      followStatus = "Đang theo dõi";
    } else if (isFollowedBy) {
      followStatus = "Theo dõi lại";
    }

    return {
      isSuccess: true,
      status: 200,
      message: "Hiển thị trang cá nhân của người dùng",
      UserId: user.id,
      username: displayUsername,
      email: user.email,
      phonenumber: user.phonenumber,
      avatar: user.avatar,
      following: (await getFollow(userId)).following,
      followers: (await getFollow(userId)).followers,
      followStatus,
      posts: userPosts,
    };
  } catch (error) {
    console.error("Profile Error:", error);
    return { error: "Lỗi xảy ra khi lấy thông tin người dùng", status: 500 };
  }
};

const updateProfile = async (userId, updatedData, file) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        isSuccess: false,
        status: 404,
        error: "Không tìm thấy người dùng",
      };
    }

    // Kiểm tra username có chứa khoảng trắng
    if (updatedData.username && /\s/.test(updatedData.username)) {
      return {
        isSuccess: false,
        status: 400,
        error: "Username không được chứa khoảng trắng",
      };
    }

    // Kiểm tra email hợp lệ
    if (updatedData.email && !updatedData.email.endsWith("@gmail.com")) {
      return {
        isSuccess: false,
        status: 400,
        error: "Email sai định dạng",
      };
    }

    // Kiểm tra số điện thoại hợp lệ
    if (
      updatedData.phonenumber &&
      (updatedData.phonenumber.length < 10 || updatedData.phonenumber.length > 11)
    ) {
      return {
        isSuccess: false,
        status: 400,
        error: "Số điện thoại sai định dạng",
      };
    }

    // Upload avatar mới nếu có file
    let avatarUrl = user.avatar;

    if (file && file.buffer) {
      console.log('🟢 Có file được gửi lên');
    
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "User-avatar",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error('❌ Lỗi upload:', error);
              reject(error);
            } else {
              console.log('✅ Upload thành công:', result.secure_url);
              resolve(result);
            }
          }
        ).end(file.buffer);
      });
    
      avatarUrl = uploadResult.secure_url;
    } else {
      console.log('⚠️ Không có file hoặc file.buffer');
    }
    

    // Cập nhật thông tin người dùng
    await user.update({
      username: updatedData.username || user.username,
      email: updatedData.email || user.email,
      phonenumber: updatedData.phonenumber || user.phonenumber,
      realname: updatedData.realname || user.realname,
      avatar: avatarUrl,
    });

    return {
      isSuccess: true,
      status: 200,
      message: "Cập nhật thông tin thành công",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phonenumber: user.phonenumber,
        realname: user.realname,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    return {
      isSuccess: false,
      status: 500,
      error: "Lỗi server khi cập nhật hồ sơ",
    };
  }
};

module.exports = {
  register,
  login,
  refreshTokenService,
  logout,
  useSearch,
  logout,
  getUserDevices,
  logoutSpecificDevice,
  userProfile,
  updateProfile
};
