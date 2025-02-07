require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');            // Thêm mysql2 nếu cần

// Tạo kết nối đến cơ sở dữ liệu MySQL bằng biến môi trường
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    dialectModule: mysql2,
  }
);

// Kiểm tra kết nối
sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
