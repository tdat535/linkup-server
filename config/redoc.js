const redoc = require("redoc-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LinkUp API",
      version: "1.0.0",
      description: "API documentation for LinkUp",
    },
    servers: [
      {
        url: "https://linkup-server-rust.vercel.app", // Đổi sang domain của Vercel
        description: "Vercel Server",
      },
    ],
  },
  apis: ["routes/*.js", "docs/*.js"], // Load tài liệu cũ
};

const swaggerSpec = swaggerJsDoc(options);

const redocDocs = (app) => {
  app.get("/api-docs", redoc({ 
    title: "API Documentation", 
    specUrl: "/api-docs.json" 
  }));

  // Đảm bảo route này trả về JSON đúng
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("Redoc available at /api-docs");
};

module.exports = redocDocs;
