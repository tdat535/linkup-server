const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const Noti = sequelize.define('Noti', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  receivingDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

// Thiết lập quan hệ
Noti.belongsTo(User, { foreignKey: 'receiverId', onDelete: 'CASCADE' });
User.hasMany(Noti, { foreignKey: 'receiverId', onDelete: 'CASCADE' });


module.exports = Noti;
