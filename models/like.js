const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const MediaPost = require('./mediaPost'); // Import sau khi đã định nghĩa MediaPost
const User = require('./user'); // Import sau khi đã định nghĩa User

const Like = sequelize.define('Like', {
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    }, {
    timestamps: true
});

Like.belongsTo(MediaPost, { foreignKey: 'postId', onDelete: 'CASCADE' });
MediaPost.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE' });

Like.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Like, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = Like;

