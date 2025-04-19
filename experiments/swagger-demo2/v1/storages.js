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
 *         idProduct:
 *           type: integer
 *           example: 5
 *         idOrder:
 *           type: integer
 *           example: 3
 *         count:
 *           type: integer
 *           example: 10
 *       required:
 *         - idProduct
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
 *     ReserveCancelExample:
 *       value:
 *         idReserve: 6
 *         idProduct: 5
 *         idOrder: 3
 *         count: 0
 *         message: "Резерв отменен"
 */

// Вспомогательная функция для валидации
const validateReserveInput = (input) => {
  if (!input.idProduct || !input.idOrder || input.count === undefined) {
    return { isValid: false, error: "Все поля (idProduct, idOrder, count) обязательны" };
  }
  if (input.count < 0) {
    return { isValid: false, error: "Количество не может быть отрицательным" };
  }
  return { isValid: true };
};

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
 *       404:
 *         description: Склад не найден
 */
router.get('/:idStorage', (req, res) => {
  if (req.params.idStorage > 3) {
    return res.status(404).json({
      error: `Склад ${req.params.idStorage} не найден`,
      message: `Склад ${req.params.idStorage} не найден`,
      statusCode: 404
    });
  }
  res.json({ id: req.params.idStorage, name: 'Склад ' + req.params.idStorage });
});
 
/**
 * @swagger
 * /v1/storages/{idStorage}/reserves:
 *   delete:
 *     summary: Удалить резерв товара
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: idStorage
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idOrder
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Резерв успешно удален
 *       400:
 *         description: Неверные параметры запроса
 *       404:
 *         description: Резерв не найден
 */
router.delete('/:idStorage/reserves', (req, res) => {
  const { idProduct, idOrder } = req.query;
  if (!idProduct || !idOrder) {
    return res.status(400).json({ error: "Необходимо указать idProduct и idOrder" });
  }
  
  // Логика удаления резерва
  res.status(204).end();
});

/**
 * @swagger
 * /v1/storages/{idStorage}/reserves:
 *   patch:
 *     summary: Зарезервировать товар на складе (count:0 - отмена резерва)
 *     tags: [Storages]
 *     parameters:
 *       - in: path
 *         name: idStorage
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReserveInput'
 *           examples:
 *             Резервирование товар:
 *               value:
 *                 idProduct: 5
 *                 idOrder: 3
 *                 count: 10
 *             Отмена резерва:
 *               value:
 *                 idProduct: 5
 *                 idOrder: 3
 *                 count: 0
 *     responses:
 *       200:
 *         description: Количество резерва изменено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserve'
 *             examples:
 *               normalResponse:
 *                 value:
 *                   idReserve: 6
 *                   idProduct: 5
 *                   idOrder: 3
 *                   count: 10
 *               cancelResponse:
 *                 $ref: '#/components/examples/ReserveCancelExample'
 *       400:
 *         description: Неверные параметры запроса
 *       404:
 *         description: Резерв не найден
 */
router.patch('/:idStorage/reserves', (req, res) => {
  const { isValid, error } = validateReserveInput(req.body);
  if (!isValid) {
    return res.status(400).json({ error });
  }

  const { idProduct, idOrder, count } = req.body;
  
  // Обработка отмены резерва (count = 0)
  if (count === 0) {
    return res.json({
      idReserve: 6,
      idProduct: Number(idProduct),
      idOrder: Number(idOrder),
      count: 0,
      message: "Резерв отменен"
    });
  }

  res.json({
    idReserve: 6,
    idProduct: Number(idProduct),
    idOrder: Number(idOrder),
    count: count
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
  if (!idOrder) {
    return res.status(400).json({ error: "Необходимо указать idOrder" });
  }
  
  res.json([
    { idReserve: 6, idProduct: 5, idOrder: Number(idOrder), count: 3 },
    { idReserve: 7, idProduct: 23, idOrder: Number(idOrder), count: 6 }
  ]);
});

module.exports = router;