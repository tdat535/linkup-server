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
  type: {
    type: DataTypes.ENUM('admin', 'subAdmin', 'user'),
    allowNull: false,
    defaultValue: 'user'
  },
}, {
  timestamps: true
});

module.exports = User;
