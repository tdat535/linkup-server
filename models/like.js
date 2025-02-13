const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối
const MediaPost = require('./mediaPost'); // Import sau khi đã định nghĩa MediaPost
const User = require('./user'); // Import sau khi đã định nghĩa User

const Like = sequelize.define('Like', {
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    }, {
    timestamps: true
});

Like.belongsTo(MediaPost, { foreignKey: 'post_id', onDelete: 'CASCADE' });
MediaPost.hasMany(Like, { foreignKey: 'post_id', onDelete: 'CASCADE' });

Like.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(Like, { foreignKey: 'user_id', onDelete: 'CASCADE' });

module.exports = Like;

