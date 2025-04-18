const express = require('express');
const usersRouter = require('./routes/users'); // Импортируем роутер
const storagesRouter = require('./routes/storages'); // Импортируем роутер
const ordersRouter = require('./routes/orders'); // Импортируем роутер

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


app.use(express.json()); // Middleware для парсинга JSON
app.use('/users', usersRouter); // Подключаем роутер
app.use('/storages', storagesRouter); // Подключаем роутер
app.use('/orders', ordersRouter); // Подключаем роутер

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
  console.log('Swagger UI: http://localhost:3000/api-docs');
  console.log('OpenAPI JSON: http://localhost:3000/openapi.json');
  console.log('OpenAPI YAML: http://localhost:3000/openapi.yaml');
});


// POST /orders // {idUser:1, region:1} создается новый заказ или возвращается уже созданный {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4},{idProduct:22, count:2,}]} 
// POST /orders/{idOrder}   // добавление товара в заказ {idUser:1, region:1, idProduct:123, count:4,} возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4},{idProduct:22, count:2,}]} где idOreder номер открытого заказа
// PATCH /orders/{idOrder}  // изменение количество товара в заказе {idUser:1, region:1, idProduct:123, count:7,} возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4,idProduct:22, count:2,}]} где idOreder номер открытого заказа
// DELETE /orders/{idOrder}/{idProduct} // удаление товара из заказа. возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4,idProduct:22, count:2,}]} 
// GET /orders/{idOrder} возвращается весь заказ {idUser:1, region:1, idOreder:45, products:[{idProduct:123, count:4,idProduct:22, count:2,}]} 
// GET /orders?iduser={idUser} возвращает заказы пользователя
// GET /orsers?iduser={idUser}?
// PUT /orders/product/

// POST /users/  // добавить пользователя {name:"Вася", phone:444444, address:"", region:"central" }
// GET /users //выводит список кользователей
// GET /users/{idUser} //выводит данные пользователя
// PATCH /users/{idUser} // изменяет данные пользователя  {name:"Вася П" }  возвращает  данные пользователя  {name:"Вася П", phone:444444, address:"", region:"central" }

// GET /products // получает продукты
// POST /products // создает продукт {name:"стул", description:"кухонный",...} возвращает  {idProduct:2 , name:"стул", description:"кухонный",...}
// GET /products/{idProduct} // возвращает описание продукта
// PATCH /products/{idProduct} // изменяет продукт {name:"стул", description:"обеденный"} возвращает  {idProduct:2 , name:"стул", description:"кухонный",...}

// POST /storages/{idStorage}/reserves/{idProduct} // резервирование товара на складе передается { idOrder:3, count: 10 } return {idReserve:6, idProduct:5, idOrder:3, count: 3 } count - сколько удалось зарехервировать.
// DELETE /storages/{idStorage}/reserves/{idProduct} // закрывает заказ удаля из резерва товар { idOrder:3}
// PATCH /storages/{idStorage}/reserves/{idProduct} // изменить количество резерва товара для заказа { idOrder:3, count: 20 } return {idReserve:6, idOrder:3, count: 18 } count - сколько удалось зарехервировать. idOrder -номер заказа пример для отмены резерва необходимо указать count=0
// GET /storages // возвращает список складов [ {idStorage:1, name:"склад 1"}, {idStorage:2, name:"склад 2"}, {idStorage:3, name:"склад 3"}]
// GET /storages/{idStorage}/reserves?idOrder=3 // возвращает все товары зарезервированные под заказ [ {idReserve:6, idProduct:5, idOrder:3, count: 3 }, {idReserve:7, idProduct:23, idOrder:3, count: 6 } ]


// POST /prices  // создает цену на товар {}
// GET /prices?idProduct={idProduct} // получаем цену продукта
// GET /