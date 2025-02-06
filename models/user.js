// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Import kết nối

// Định nghĩa model User
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Tạo bảng nếu chưa tồn tại
User.sync()
  .then(() => console.log('User table has been created.'))
  .catch(err => console.error('Error creating table:', err));

module.exports = User;
