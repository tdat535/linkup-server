# LinkUp API

LinkUp API là một backend được xây dựng bằng Node.js và Express, sử dụng MySQL làm cơ sở dữ liệu. API này hỗ trợ các tính năng như đăng ký, đăng nhập, đăng bài, bình luận, và sử dụng refresh token.

## 🛠 Công nghệ sử dụng

- Node.js
- Express.js
- Sequelize (ORM)
- MySQL
- JSON Web Token (JWT)
- bcryptjs (Mã hóa mật khẩu)
- dotenv (Quản lý biến môi trường)

## 📋 Các tính năng

- Đăng ký người dùng
- Đăng nhập người dùng
- Đăng bài viết
- Bình luận bài viết
- Sử dụng refresh token để cấp lại access token
- Bảo mật bằng JWT và bcryptjs
- Quản lý biến môi trường bằng dotenv
- Sử dụng Sequelize để tương tác với MySQL
- Sử dụng nodemon để tự động restart server khi có thay đổi
## 🚀 Cài đặt

1. Clone repo:
   ```sh
   git clone https://github.com/your-username/linkup-api.git
   cd linkup-api
   ```
2. Cài đặt dependencies:
   ```sh
   npm install
   ```

3. Tạo file .env và cấu hình như sau:
   ```sh
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_DIALECT=mysql
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   PORT=3000
   ```

4.Chạy project bằng nodemon để tự động restart khi có thay đổi:
   ```sh
   npm start
   ```

📌 API Endpoints documents: 
   ```sh
   https://linkup-server-rust.vercel.app/api-docs
   ```
