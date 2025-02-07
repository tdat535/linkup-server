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

## 🚀 Cài đặt

1. Clone repo:
   ```sh
   git clone https://github.com/your-username/linkup-api.git
   cd linkup-api
   
Cài đặt dependencies:
npm install
Tạo file .env và cấu hình như sau:

env
Copy
Edit
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=3306
DB_DIALECT=mysql
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000

Chạy project:
npm start
Hoặc dùng nodemon để tự động restart khi có thay đổi:
npm run dev

📌 API Endpoints documents: 
https://linkup-server-rust.vercel.app/api-docs
