const express = require('express');
const swaggerUi = require('swagger-ui-express');
//const swaggerSpec = require('./swagger-definition');
const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const YAML = require('yaml');

// Конфигурация Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '12 стульев',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'], // Путь к файлам с JSDoc
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Сохраняем в JSON-файл
fs.writeFileSync('openapi.json', JSON.stringify(swaggerSpec, null, 2));

// Сохранение в YAML
const yamlString = YAML.stringify(swaggerSpec);
fs.writeFileSync('openapi.yaml', yamlString);

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Эндпоинт для скачивания openapi.json
app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Скачивание openapi.yaml
app.get('/openapi.yaml', (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(yamlString);
  });

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
  console.log('Swagger UI: http://localhost:3000/api-docs');
  console.log('OpenAPI JSON: http://localhost:3000/openapi.json');
  console.log('OpenAPI YAML: http://localhost:3000/openapi.yaml');
});