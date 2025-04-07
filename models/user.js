const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối

// Định nghĩa model User
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phonenumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('unknow', 'male', 'female'),
    allowNull: false,
    defaultValue: 'unknow'
  },
  type: {
    type: DataTypes.ENUM('admin', 'subAdmin', 'user'),
    allowNull: false,
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

module.exports = User;
