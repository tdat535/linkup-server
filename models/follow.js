const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const Follow = sequelize.define('Follow', {
  followerId: { // Người thực hiện follow
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    primaryKey: true 
  },
  followingId: { // Người được follow
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    primaryKey: true 
  },
  followedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('accepted', 'blocked', 'unfollowed'),
    allowNull: false,
    defaultValue: 'accepted'
  }
}, { timestamps: false });

// Thiết lập quan hệ đúng
User.hasMany(Follow, { foreignKey: 'followerId', as: 'Following' });
User.hasMany(Follow, { foreignKey: 'followingId', as: 'Followers' });

Follow.belongsTo(User, { foreignKey: 'followerId', as: 'Follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'FollowingUser' });

module.exports = Follow;



