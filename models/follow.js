const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const User = require('./user');

const Follow = sequelize.define('Follow', {
    followers: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    followed: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  Follow.belongsTo(User, { foreignKey: 'followers', onDelete: 'CASCADE' });
User.hasMany(Follow, { foreignKey: 'followers', onDelete: 'CASCADE' });
  Follow.belongsTo(User, { foreignKey: 'followed', onDelete: 'CASCADE' });
User.hasMany(Follow, { foreignKey: 'followed', onDelete: 'CASCADE' });
  module.exports = Follow;