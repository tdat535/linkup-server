const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user'); // Import sau khi đã định nghĩa User
const MediaPost = require('./mediaPost'); // Import bài viết chữ

// Định nghĩa model Comment
const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postType: {
    type: DataTypes.ENUM('post', 'video'), // Xác định loại bài viết
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Quan hệ với User
Comment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });

Comment.belongsTo(MediaPost, { foreignKey: 'postId', onDelete: 'CASCADE' });
MediaPost.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });

// Không thiết lập quan hệ trực tiếp với MediaPost và MediaVideo để linh hoạt hơn
// Khi query, sẽ dựa vào postType để xác định bảng nào cần lấy dữ liệu

module.exports = Comment;
