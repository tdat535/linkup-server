const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RefreshToken = sequelize.define("RefreshToken", {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  device: {
    type: DataTypes.STRING, // Lưu thông tin thiết bị
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = RefreshToken;
