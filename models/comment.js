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
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ
Comment.belongsTo(MediaPost, { foreignKey: 'post_id', onDelete: 'CASCADE' });
MediaPost.hasMany(Comment, { foreignKey: 'post_id', onDelete: 'CASCADE' });

Comment.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(Comment, { foreignKey: 'user_id', onDelete: 'CASCADE' });

module.exports = Comment;
