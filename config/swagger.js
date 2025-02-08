const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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
  apis: ["routes/*.js"], // Load API docs từ thư mục routes
};

const swaggerSpec = swaggerJsDoc(options);

const swaggerDocs = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCssUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
    })
  );
  console.log("Swagger docs available at /api-docs");
};

module.exports = swaggerDocs;
