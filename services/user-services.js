const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const User = require("../models/user"); // Assuming you have a User model
const RefreshToken = require("../models/refreshToken");
const Follow = require("../models/follow");
const MediaPost = require("../models/mediaPost");
const { Op } = require("sequelize");

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

    if (!user) {
      return {
        isSuccess: false,
        status: 404,
        error: "Người dùng không tồn tại",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      userData.password,
      user.password
    );
    if (!isPasswordValid) {
      return {
        isSuccess: false,
        status: 404,
        error: "Sai mật khẩu",
      };
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await RefreshToken.create({ userId: user.id, token: refreshToken });
    // // 🔥 Kiểm tra nếu user đã có token thì update, nếu chưa có thì tạo mới
    // const existingToken = await RefreshToken.findOne({ where: { userId: user.id } });

    // if (existingToken) {
    //     await existingToken.update({ token: refreshToken });
    // } else {
    //
    // }

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

const createNewAccessToken = async (token) => {
  try {
    if (!token) {
      return {
        isSuccess: false,
        status: 404,
        error: "Refresh Token is required",
      };
    }

    // Kiểm tra Refresh Token có tồn tại trong database không
    const storedToken = await RefreshToken.findOne({ where: { token } });

    if (!storedToken) {
      return {
        isSuccess: false,
        status: 404,
        error: "Invalid Refresh Token",
      };
    }

    // Giải mã Refresh Token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return {
        isSuccess: false,
        status: 404,
        error: "User not found",
      };
    }

    // Tạo Access Token mới
    const newAccessToken = generateAccessToken(user);

    return {
      IsSuccess: true,
      Status: 200,
      AccessToken: newAccessToken,
      TokenType: "bearer",
    };
  } catch (error) {
    throw new Error("Error refreshing token: " + error.message);
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
    { expiresIn: "24h" }
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
      expiresIn: "7d",
    }
  );
};

const logout = async (refreshToken) => {
  try {
    // Tìm Refresh Token trong cơ sở dữ liệu
    const existingToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    // Nếu không tìm thấy token
    if (!existingToken) {
      return { error: "Không tìm thấy Refresh Token", status: 404 };
    }

    // Xóa refresh token khỏi cơ sở dữ liệu
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

    if (userId === currentUserId) {
      return {
        isSuccess: true,
        status: 200,
        message: "Hiển thị trang cá nhân của bạn",
        UserId: user.id,
        username: user.username,
        email: user.email,
        phonenumber: user.phonenumber,
        avatar: user.avatar,
        following: (await getFollow(userId)).following,
        followers: (await getFollow(userId)).followers,
        posts: userPosts, // Thêm danh sách bài viết vào đây
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
      username: user.username,
      email: user.email,
      phonenumber: user.phonenumber,
      avatar: user.avatar,
      following: (await getFollow(userId)).following,
      followers: (await getFollow(userId)).followers,
      followStatus,
      posts: userPosts, // Thêm danh sách bài viết vào đây
    };
  } catch (error) {
    console.error("Profile Error:", error);
    return { error: "Lỗi xảy ra khi lấy thông tin người dùng", status: 500 };
  }
};

module.exports = {
  register,
  login,
  createNewAccessToken,
  logout,
  useSearch,
  logout,
  userProfile,
};
