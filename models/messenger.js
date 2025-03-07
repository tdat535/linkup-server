const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user'); // Import model User

// Định nghĩa model Messenger
const Messenger = sequelize.define('Messenger', {
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  senderId: {
    type: DataTypes.INTEGER,
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

// Thiết lập quan hệ với User
Messenger.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Messenger.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });


module.exports = Messenger;
