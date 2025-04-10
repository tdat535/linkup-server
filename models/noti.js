const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user'); // Import sau khi đã định nghĩa User

// Định nghĩa model Comment
const Notification = sequelize.define('Notification', {
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receivingDate: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true
});

// Quan hệ với User
Notification.belongsTo(User, { foreignKey: 'receiverId', onDelete: 'CASCADE' });
User.hasMany(Notification, { foreignKey: 'receiverId', onDelete: 'CASCADE' });

module.exports = Notification;
