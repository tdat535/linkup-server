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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ
MediaPost.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(MediaPost, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = MediaPost;
