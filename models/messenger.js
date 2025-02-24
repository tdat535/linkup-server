const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user'); // Import sau khi đã định nghĩa User

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
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ với User
Messenger.belongsTo(User, { foreignKey: 'senderId', onDelete: 'CASCADE' });
User.hasMany(Messenger, { foreignKey: 'senderId', onDelete: 'CASCADE' });

Messenger.belongsTo(User, { foreignKey: 'receiverId', onDelete: 'CASCADE' });
User.hasMany(Messenger, { foreignKey: 'receiverId', onDelete: 'CASCADE' });

module.exports = Messenger;
