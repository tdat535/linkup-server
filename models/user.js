const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối

// Định nghĩa model User
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  realname: {
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
  }
}, {
  timestamps: true
});

module.exports = User;
