const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const MediaPost = require('./mediaPost');
const Messenger = require('./messenger');

const Report = sequelize.define('Report', {
  type: {
    type: DataTypes.ENUM('user', 'post'),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reportedPostId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'finished'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
});

Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });
Report.belongsTo(MediaPost, { foreignKey: 'reportedPostId', as: 'reportedPost' });

module.exports =  Report;
