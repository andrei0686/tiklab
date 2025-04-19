const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         idOrder:
 *           type: integer
 *           example: 1
 *         idUser:
 *           type: integer
 *           example: 123
 *         region:
 *           type: string
 *           example: "Moscow"
 * 
 *     OrderItem:
 *       type: object
 *       properties:
 *         idProduct:
 *           type: integer
 *           example: 456
 *         quantity:
 *           type: integer
 *           example: 2
 *         idStorage:
 *           type: integer
 *           example: 789
 *         price:
 *           type: number
 *           format: float
 *           example: 99.99
 *         discount:
 *           type: number
 *           format: float
 *           example: 10.0
 *         promotionId:
 *           type: integer
 *           example: 55
 * 
 *     AddProductResponse:
 *       type: object
 *       properties:
 *         idOrder:
 *           type: integer
 *           example: 1
 *         quantityAdded:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /orders/add:
 *   post:
 *     summary: Добавить товар в заказ
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idUser:
 *                 type: integer
 *               idProduct:
 *                 type: integer
 *               region:
 *                 type: string
 *               quantity:
 *                 type: integer
 *             required:
 *               - idUser
 *               - idProduct
 *               - region
 *               - quantity
 *             example:
 *               idUser: 123
 *               idProduct: 456
 *               region: "Moscow"
 *               quantity: 2
 *     responses:
 *       200:
 *         description: Товар успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddProductResponse'
 *       400:
 *         description: Неверные параметры запроса
 */
router.post('/add', (req, res) => {
  const { idUser, idProduct, region, quantity } = req.body;
  // Здесь должна быть логика добавления товара
  res.json({
    idOrder: 1, // Пример ID заказа
    quantityAdded: quantity
  });
});

/**
 * @swagger
 * /orders/{idOrder}/remove:
 *   delete:
 *     summary: Удалить товар из заказа
 *     tags: [Orders]
 *     parameters:
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
 *             type: object
 *             properties:
 *               idProduct:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *             required:
 *               - idProduct
 *               - quantity
 *             example:
 *               idProduct: 456
 *               quantity: 1
 *     responses:
 *       200:
 *         description: Товар успешно удален из заказа
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *               example:
 *                 success: true
 *                 message: "Товар удален из заказа"
 *       404:
 *         description: Заказ или товар не найден
 */
router.delete('/:idOrder/remove', (req, res) => {
  const { idOrder } = req.params;
  const { idProduct, quantity } = req.body;
  // Здесь должна быть логика удаления товара
  res.json({
    success: true,
    message: "Товар удален из заказа"
  });
});

/**
 * @swagger
 * /orders/{idOrder}/items:
 *   get:
 *     summary: Получить список товаров в заказе
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: idOrder
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список товаров в заказе
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderItem'
 *       404:
 *         description: Заказ не найден
 */
router.get('/:idOrder/items', (req, res) => {
  const { idOrder } = req.params;
  // Здесь должна быть логика получения товаров
  res.json([
    {
      idProduct: 456,
      quantity: 2,
      idStorage: 789,
      price: 99.99,
      discount: 10.0,
      promotionId: 55
    }
  ]);
});

module.exports = router;