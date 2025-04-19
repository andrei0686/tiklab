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






// GET /products // получает продукты
// POST /products // создает продукт {name:"стул", description:"кухонный",...} возвращает  {idProduct:2 , name:"стул", description:"кухонный",...}
// GET /products/{idProduct} // возвращает описание продукта
// PATCH /products/{idProduct} // изменяет продукт {name:"стул", description:"обеденный"} возвращает  {idProduct:2 , name:"стул", description:"кухонный",...}

// POST /users  // добавить пользователя {name:"Вася", phone:444444, address:"", region:"центральный" }
// GET /users //выводит список кользователей
// GET /users/{idUser} //выводит данные пользователя
// PATCH /users/{idUser} // изменяет данные пользователя  {name:"Алеша Алексеевич" }  возвращает  данные пользователя  {name:"Алеша А", phone:444444, address:"", region:"центральный" }

// POST /users/{idUser}/orders // { region:1} создается новый заказ или возвращается уже созданный {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4},{idProduct:22, count:2,}]} 
// POST /users/{idUser}/orders/{idOrder}   // добавление товара в заказ {idUser:1, region:1, idProduct:123, count:4,} возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4},{idProduct:22, count:2,}]} где idOreder номер открытого заказа
// PATCH /users/{idUser}/orders/{idOrder}  // изменение количество товара в заказе {idUser:1, region:1, idProduct:123, count:7,} возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4,idProduct:22, count:2,}]} где idOreder номер открытого заказа
// DELETE /users/{idUser}/orders/{idOrder}?idProduct={idProduct} // удаление товара из заказа. возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4,idProduct:22, count:2,}]} 
// GET /users/{idUser}/orders/{idOrder} возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4,idProduct:22, count:2,}]} 
// GET /users/{idUser}/orders?state="closed" возвращает закрытые заказы пользователя
// GET /users/{idUser}/orsers?iduser={idUser}?


// GET /prices?idProduct={idProduct} // получаем цену продукта и акцию со скидкой если она есть {idPrice:3, idProduct:4, idStorage:1, idPromotion: 4, price:332, sale:15 , count: 6} count количество для акции, sale скидка, price цена
// GET /prices // получаем цены на все продукты [{idPrice:3, idProduct:4, idStorage:1, idPromotion: 4, price:332, sale:15 , count: 6},{idPrice:2, idProduct:4, idStorage:2, idPromotion: 4, price:332, sale:10 , count: 16}]



// POST /storages/{idStorage}/reserves/{idProduct} // резервирование товара на складе передается { idOrder:3, count: 10 } return {idReserve:6, idProduct:5, idOrder:3, count: 3 } count - сколько удалось зарехервировать.
// DELETE /storages/{idStorage}/reserves/{idProduct} // закрывает заказ удаляя из резерва товар { idOrder:3}
// PATCH /storages/{idStorage}/reserves/{idProduct} // изменить количество резерва товара для заказа { idOrder:3, count: 20 } return {idReserve:6, idOrder:3, count: 18 } count - сколько удалось зарехервировать. idOrder -номер заказа пример для отмены резерва необходимо указать count=0
// GET /storages // возвращает список складов [ {idStorage:1, name:"склад 1"}, {idStorage:2, name:"склад 2"}, {idStorage:3, name:"склад 3"}]
// GET /storages/{idStorage}/reserves?idOrder=3 // возвращает все товары зарезервированные под заказ [ {idReserve:6, idProduct:5, idOrder:3, count: 3 }, {idReserve:7, idProduct:23, idOrder:3, count: 6 } ]


