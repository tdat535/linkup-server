const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const { sequelize, connectDB } = require("./config/database");

// Import thư viện swagger-ui-dist để phục vụ file tĩnh
const swaggerUiDist = require("swagger-ui-dist").absolutePath();

const app = express();
app.use(express.json());

// Cấu hình Swagger JSDoc
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Swagger UI hosted on Vercel",
    },
  },
  apis: [path.join(__dirname, "docs/swagger.js")],
};

const swaggerSpec = swaggerJsdoc(options);

// 👉 Phục vụ Swagger UI từ `swagger-ui-dist`
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      docExpansion: "none",
      url: "/swagger-ui/swagger-ui-bundle.js", // Chỉ định tệp JS cụ thể
      layout: "BaseLayout",
    },
  })
);
app.use("/swagger-ui", express.static(path.join(__dirname, "public/swagger-ui")));

// Route mặc định
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Kết nối DB và khởi động server
connectDB().then(() => {
  sequelize.sync({ alter: true })
    .then(() => console.log("✅ Database đã đồng bộ"))
    .catch(err => console.error("❌ Lỗi khi đồng bộ database:", err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
  });
});

module.exports = app;
