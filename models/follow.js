const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user'); // Import model User

const Follow = sequelize.define('Follow', {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  followedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW // Lưu thời gian theo dõi
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked', 'unfollowed'),
    allowNull: false,
    defaultValue: 'accepted' // Mặc định là đang theo dõi
  }
}, {
  timestamps: false
});

// Định nghĩa quan hệ Follow giữa User với chính nó
User.belongsToMany(User, { 
  through: Follow,
  as: 'Followers',
  foreignKey: 'followingId'
});

User.belongsToMany(User, { 
  through: Follow,
  as: 'Following',
  foreignKey: 'followerId'
});

module.exports = Follow;
