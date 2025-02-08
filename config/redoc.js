const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const swaggerDocs = (app) => {
  const swaggerSpec = JSON.parse(fs.readFileSync(path.join(__dirname, "../docs/api-documents.json"), "utf-8"));

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("✅ Swagger docs available at /api-docs");
};

module.exports = swaggerDocs;
