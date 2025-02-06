// database.js
const { Sequelize } = require('sequelize');

// Tạo kết nối đến cơ sở dữ liệu MySQL
const sequelize = new Sequelize('mysql://root:123456@localhost:3306/linkup_db');
// Kiểm tra kết nối
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
