const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user'); // Import model User

// Định nghĩa model RefreshToken
const RefreshToken = sequelize.define('RefreshToken', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Đặt user_id làm khóa chính
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

// Thiết lập quan hệ với User
User.hasOne(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = RefreshToken;
