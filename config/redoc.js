const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../docs/api-documents.json"); // Load file JSON trực tiếp

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("✅ Swagger docs available at /api-docs");
};

module.exports = swaggerDocs;
