const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Storage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Склад 1"
 *     Reserve:
 *       type: object
 *       properties:
 *         idReserve:
 *           type: integer
 *           example: 6
 *         idProduct:
 *           type: integer
 *           example: 5
 *         idOrder:
 *           type: integer
 *           example: 3
 *         count:
 *           type: integer
 *           example: 3
 *     ReserveInput:
 *       type: object
 *       properties:
 *         idOrder:
 *           type: integer
 *           example: 3
 *         count:
 *           type: integer
 *           example: 10
 *       required:
 *         - idOrder
 *         - count
 *   examples:
 *     StorageArrayExample:
 *       value:
 *         - id: 1
 *           name: "Склад 1"
 *         - id: 2
 *           name: "Склад 2"
 *         - id: 3
 *           name: "Склад 3"
 *     ReserveArrayExample:
 *       value:
 *         - idReserve: 6
 *           idProduct: 5
 *           idOrder: 3
 *           count: 3
 *         - idReserve: 7
 *           idProduct: 23
 *           idOrder: 3
 *           count: 6
 */

/**
 * @swagger
 * /v1/storages:
 *   get:
 *     summary: Получить список складов
 *     tags: [Storages]
 *     responses:
 *       200:
 *         description: Список складов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Storage'
 *             examples:
 *               example-1:
 *                 $ref: '#/components/examples/StorageArrayExample'
 */
router.get('/', (req, res) => {
  res.json([
    { id: 1, name: 'Склад 1' },
    { id: 2, name: 'Склад 2' },
    { id: 3, name: 'Склад 3' }
  ]);
});

/**
 * @swagger
 * /v1/storages/{idStorage}:
 *   get:
 *     summary: Получить склад по ID
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: idStorage
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные склада
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Storage'
 */
router.get('/:idStorage', (req, res) => {
  res.json({ id: req.params.idStorage, name: 'Склад ' + req.params.idStorage });
});

/**
 * @swagger
 * /v1/storages/{idStorage}/reserves/{idProduct}:
 *   post:
 *     summary: Зарезервировать товар на складе
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: idStorage
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReserveInput'
 *     responses:
 *       200:
 *         description: Товар успешно зарезервирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserve'
 *       400:
 *         description: Неверные параметры запроса
 */
router.post('/:idStorage/reserves/:idProduct', (req, res) => {
  const { idOrder, count } = req.body;
  const reservedCount = Math.min(count, 3); // Пример логики резервирования
  
  res.json({
    idReserve: 6,
    idProduct: req.params.idProduct,
    idOrder,
    count: reservedCount
  });
});

/**
 * @swagger
 * /v1/storages/{idStorage}/reserves/{idProduct}:
 *   delete:
 *     summary: Удалить резерв товара со склада
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: idStorage
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idProduct
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
 *               idOrder:
 *                 type: integer
 *                 example: 3
 *             required:
 *               - idOrder
 *     responses:
 *       200:
 *         description: Резерв успешно удален
 *       404:
 *         description: Резерв не найден
 */
router.delete('/:idStorage/reserves/:idProduct', (req, res) => {
  res.status(200).json({ message: 'Резерв удален' });
});

/**
 * @swagger
 * /v1/storages/{idStorage}/reserves/{idProduct}:
 *   patch:
 *     summary: Изменить количество резерва товара
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: idStorage
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReserveInput'
 *     responses:
 *       200:
 *         description: Количество резерва изменено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserve'
 *       400:
 *         description: Неверные параметры запроса
 */
router.patch('/:idStorage/reserves/:idProduct', (req, res) => {
  const { idOrder, count } = req.body;
  const reservedCount = Math.min(count, 18); // Пример логики изменения резерва
  
  res.json({
    idReserve: 6,
    idOrder,
    count: reservedCount
  });
});

/**
 * @swagger
 * /v1/storages/{idStorage}/reserves:
 *   get:
 *     summary: Получить резервы товаров по заказу
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: idStorage
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idOrder
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список резервов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserve'
 *             examples:
 *               example-1:
 *                 $ref: '#/components/examples/ReserveArrayExample'
 *       400:
 *         description: Не указан idOrder
 */
router.get('/:idStorage/reserves', (req, res) => {
  const { idOrder } = req.query;
  
  res.json([
    { idReserve: 6, idProduct: 5, idOrder: Number(idOrder), count: 3 },
    { idReserve: 7, idProduct: 23, idOrder: Number(idOrder), count: 6 }
  ]);
});

module.exports = router;