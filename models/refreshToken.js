const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user'); // Import model User

// Định nghĩa model RefreshToken
const RefreshToken = sequelize.define('RefreshToken', {
    userId: {
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
User.hasOne(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

module.exports = RefreshToken;
