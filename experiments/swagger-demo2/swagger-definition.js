// swagger-definition.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.1',
      description: 'API для управления пользователями и данными',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Локальный сервер' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Путь к файлам с JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;