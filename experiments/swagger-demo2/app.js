const express = require('express');
const usersRouter = require('./v1/users'); // Импортируем роутер
const storagesRouter = require('./v1/storages'); // Импортируем роутер
const productsRouter = require('./v1/products'); // Импортируем роутер
const pricesRouter = require('./v1/prices'); // Импортируем роутер

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const YAML = require('yaml');

// Конфигурация Swagger
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: '12 стульев API',
        version: '1.0.0',
        description: 'API для управления продуктами, пользователями и заказами',
      },
      servers: [
        { 
          url: 'http://localhost:3000/', 
          description: 'Локальный сервер (v1)' 
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          // Перенесите сюда общие схемы из роутеров, если нужно
        }
      },
      tags: [
        { name: 'Storages', description: 'Операции со складами' },
        { name: 'Products', description: 'Операции с продуктами' },
       // { name: 'Orders', description: 'Операции с заказами' }, 
        { name: 'Prices', description: 'Операции с ценами и скидками' },
        { name: 'Users', description: 'Операции с пользователями' }
      ]
    },
    apis: ['./v1/*.js'], // Путь к файлам с JSDoc
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


app.use(express.json()); // Middleware для парсинга JSON
app.use('/v1/users', usersRouter);
app.use('/v1/storages', storagesRouter);
app.use('/v1/products', productsRouter);
app.use('/v1/prices', pricesRouter);

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
  console.log('Swagger UI: http://localhost:3000/api-docs');
  console.log('OpenAPI JSON: http://localhost:3000/openapi.json');
  console.log('OpenAPI YAML: http://localhost:3000/openapi.yaml');
});

