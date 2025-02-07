const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user'); // Import sau khi đã định nghĩa User

// Định nghĩa model MediaPost
const MediaPost = sequelize.define('MediaPost', {
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ
MediaPost.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(MediaPost, { foreignKey: 'user_id', onDelete: 'CASCADE' });

module.exports = MediaPost;
