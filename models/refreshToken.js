const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');  // Import kết nối

// Định nghĩa model User
const RefreshToken = sequelize.define('RefreshToken', {
    token: {
        type: DataTypes.STRING,
        allowNull: false
    }
    }, 
    {
        timestamps: true
    }
);

module.exports = RefreshToken;