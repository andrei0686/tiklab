const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Гена крокодил"
 *         phone:
 *           type: string
 *           example: "444444"
 *         address:
 *           type: string
 *           example: ""
 *         region:
 *           type: integer
 *           example: 1
 *     UserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Вася"
 *         phone:
 *           type: string
 *           example: "444444"
 *         address:
 *           type: string
 *           example: ""
 *         region:
 *           type: integer
 *           example: 1
 *       required:
 *         - name
 *         - phone
 *         - region
 *     Order:
 *       type: object
 *       properties:
 *         idOrder:
 *           type: integer
 *           example: 45
 *         idUser:
 *           type: integer
 *           example: 1
 *         region:
 *           type: integer
 *           example: 1
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     OrderItem:
 *       type: object
 *       properties:
 *         idProduct:
 *           type: integer
 *           example: 123
 *         count:
 *           type: integer
 *           example: 4
 *     OrderInput:
 *       type: object
 *       properties:
 *         region:
 *           type: integer
 *           example: 1
 *       required:
 *         - region
 *     OrderProductInput:
 *       type: object
 *       properties:
 *         idProduct:
 *           type: integer
 *           example: 123
 *         count:
 *           type: integer
 *           example: 4
 *       required:
 *         - idProduct
 *         - count
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Пользователь не найден"
 *         message:
 *           type: string
 *           example: "Пользователь с ID 999 не найден"
 *         statusCode:
 *           type: integer
 *           example: 404
 *     ErrorService:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Скдал не доступен"
 *         message:
 *           type: string
 *           example: "сервис склада не доступен"
 *         statusCode:
 *           type: integer
 *           example: 503 
 *     ErrorInternal:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Внутреняя ошибка сервера"
 *         message:
 *           type: string
 *           example: "Не достаточно памяти"
 *         statusCode:
 *           type: integer
 *           example: 500
 */

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Добавить пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/', (req, res) => {
  const { name, phone, address, region } = req.body;
  const newUser = { id: 2, name, phone, address, region };
  res.status(201).json(newUser);
});

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Генадий ', phone: '444444', address: '', region: 1 }]);
});

/**
 * @swagger
 * /v1/users/{idUser}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/:idUser', (req, res) => {
  res.json({ 
    id: req.params.idUser, 
    name: 'Алексей Всемогущий', 
    phone: '444444', 
    address: '', 
    region: 1 
  });
});

/**
 * @swagger
 * /v1/users/{idUser}:
 *   patch:
 *     summary: Изменить данные пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Алеша Алексеевич"
 *     responses:
 *       200:
 *         description: Данные пользователя обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch('/:idUser', (req, res) => {
  const { name } = req.body;
  res.json({ 
    id: req.params.idUser, 
    name: name || 'Алеша А', 
    phone: '444444', 
    address: '', 
    region: 1 
  });
});

/**
 * @swagger
 * /v1/users/{idUser}/orders:
 *   post:
 *     summary: Создать новый заказ или получить существующий
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       200:
 *         description: Заказ создан или получен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post('/:idUser/orders', (req, res) => {
  const { region } = req.body;
  res.json({
    idUser: req.params.idUser,
    region,
    idOrder: 45,
    products: [
      { idProduct: 123, count: 4 },
      { idProduct: 22, count: 2 }
    ]
  });
});
/**
 * @swagger
 * /v1/users/{idUser}/orders/{idOrder}:
 *   post:
 *     summary: Добавить товар в заказ
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: idOrder
 *         required: true
 *         schema:
 *           type: integer
 *           example: 45
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderProductInput'
 *     responses:
 *       200:
 *         description: Товар добавлен в заказ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Не найдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               productIsFinished:
 *                 value:
 *                   error: "Товар закончился"
 *                   message: "Товар закончился на складе выберите другой товар"
 *                   statusCode: 404
 *               userNotFound:
 *                 value:
 *                   error: "Пользователь не найден"
 *                   message: "Пользователь с ID 999 не найден"
 *                   statusCode: 404
 *               orderNotFound:
 *                 value:
 *                   error: "Заказ не найден"
 *                   message: "Заказ с ID 999 не найден"
 *                   statusCode: 404
 *               productNotFound:
 *                 value:
 *                   error: "Товар не найден"
 *                   message: "Товар с ID 999 не найден"
 *                   statusCode: 404
 *       503:
 *         description: Сервис не доступен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorService'
 *             examples:
 *               storageNotAvailabel:
 *                 value:
 *                   error: "Склад не доступен"
 *                   message: "Сервис склада не доступен попробуйте позже"
 *                   statusCode: 503
 *       500:
 *         description: Внутреняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorInternal'
 *             examples:
 *               internallError:
 *                 value:
 *                   error: "Внутреняя ошибка сервреа"
 *                   message: "Не достаточно памяти"
 *                   statusCode: 500
 */
router.post('/:idUser/orders/:idOrder', (req, res) => {
  try {
    const { idProduct, count } = req.body;
    const { idUser, idOrder } = req.params;

    // Проверка существования пользователя 
    if (idUser > 100) {
      return res.status(404).json({
        error: "Пользователь не найден",
        message: `Пользователь с ID ${idUser} не найден`,
        statusCode: 404
      });
    }

    // Проверка существования заказа 
    if (idOrder > 100) {
      return res.status(404).json({
        error: "Заказ не найден",
        message: `Заказ с ID ${idOrder} не найден`,
        statusCode: 404
      });
    }

    // Проверка существования товара 
    if (idProduct > 1000) {
      return res.status(404).json({
        error: "Товар не найден",
        message: `Товар с ID ${idProduct} не найден`,
        statusCode: 404
      });
    }

    res.json({
      idUser: Number(idUser),
      region: 1,
      idOrder: Number(idOrder),
      products: [
        { idProduct: Number(idProduct), count: Number(count) },
        { idProduct: 22, count: 2 }
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: "Внутренняя ошибка сервера",
      message: error.message,
      statusCode: 500
    });
  }
});

/**
 * @swagger
 * /v1/users/{idUser}/orders/{idOrder}:
 *   patch:
 *     summary: Изменить количество товара в заказе
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idOrder
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderProductInput'
 *     responses:
 *       200:
 *         description: Количество товара изменено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.patch('/:idUser/orders/:idOrder', (req, res) => {
  const { idProduct, count } = req.body;
  res.json({
    idUser: req.params.idUser,
    region: 1,
    idOrder: req.params.idOrder,
    products: [
      { idProduct: 123, count: 7 },
      { idProduct: 22, count: 2 }
    ]
  });
});

/**
 * @swagger
 * /v1/users/{idUser}/orders/{idOrder}:
 *   delete:
 *     summary: Удалить товар из заказа
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idOrder
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Товар удален из заказа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.delete('/:idUser/orders/:idOrder', (req, res) => {
  const { idProduct } = req.query;
  res.json({
    idUser: req.params.idUser,
    region: 1,
    idOrder: req.params.idOrder,
    products: [
      { idProduct: 123, count: 4 },
      { idProduct: 22, count: 2 }
    ]
  });
});

/**
 * @swagger
 * /v1/users/{idUser}/orders/{idOrder}:
 *   get:
 *     summary: Получить заказ по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idOrder
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные заказа
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.get('/:idUser/orders/:idOrder', (req, res) => {
  res.json({
    idUser: req.params.idUser,
    region: 1,
    idOrder: req.params.idOrder,
    products: [
      { idProduct: 123, count: 4 },
      { idProduct: 22, count: 2 }
    ]
  });
});

/**
 * @swagger
 * /v1/users/{idUser}/orders:
 *   get:
 *     summary: Получить заказы пользователя по статусу
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           example: "closed"
 *     responses:
 *       200:
 *         description: Список заказов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/:idUser/orders', (req, res) => {
  const { state } = req.query;
  res.json([{
    idUser: req.params.idUser,
    region: 1,
    idOrder: 45,
    products: [
      { idProduct: 123, count: 4 },
      { idProduct: 22, count: 2 }
    ],
    state: state || 'open'
  }]);
});

module.exports = router;