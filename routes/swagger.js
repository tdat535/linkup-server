const express = require("express");
const router = express.Router();

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// Cấu hình Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LinkUp API",
            version: "1.0.0",
            description: "API documentation for LinkUp"
        }
    },
    apis: ["./docs/*.js"] // Chỉ định các file chứa mô tả API
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Gắn Swagger UI vào router
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
