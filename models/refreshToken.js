const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Định nghĩa model RefreshToken
const RefreshToken = sequelize.define('RefreshToken', {
    token: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = RefreshToken;
