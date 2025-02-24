const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const MediaPost = require('./mediaPost'); // Import sau khi đã định nghĩa MediaPost
const User = require('./user'); // Import sau khi đã định nghĩa User

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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ
Comment.belongsTo(MediaPost, { foreignKey: 'postId', onDelete: 'CASCADE' });
MediaPost.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });

Comment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = Comment;
