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
        url: "https://linkup-server-rust.vercel.app",
        description: "Vercel Server",
      },
    ],
  },
  apis: ["routes/*.js", "docs/*.js"], // Load cả file Swagger cũ
};

const swaggerSpec = swaggerJsDoc(options);

const redocDocs = (app) => {
  app.get("/api-docs", redoc({ 
    title: "API Docs", 
    specUrl: "/api-docs.json" 
  }));

  app.get("/api-docs.json", (req, res) => {
    res.json(swaggerSpec);
  });

  console.log("Redoc available at /api-docs");
};

module.exports = redocDocs;
