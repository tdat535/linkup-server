const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user'); // Import sau khi đã định nghĩa User

// Định nghĩa model MediaVideo
const MediaVideo = sequelize.define('MediaVideo', {
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  video: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ
MediaVideo.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(MediaVideo, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = MediaVideo;
