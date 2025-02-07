require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // Thêm mysql2 nếu cần

// Tạo kết nối đến cơ sở dữ liệu MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    dialectModule: mysql2,
    logging: false, // Tắt log query SQL trong console
  }
);

// Kiểm tra kết nối
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};  

module.exports = { sequelize, connectDB };
