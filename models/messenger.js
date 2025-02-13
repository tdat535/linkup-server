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
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ với User
Messenger.belongsTo(User, { foreignKey: 'sender_id', onDelete: 'CASCADE' });
User.hasMany(Messenger, { foreignKey: 'sender_id', onDelete: 'CASCADE' });

Messenger.belongsTo(User, { foreignKey: 'receiver_id', onDelete: 'CASCADE' });
User.hasMany(Messenger, { foreignKey: 'receiver_id', onDelete: 'CASCADE' });

module.exports = Messenger;
