const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Price:
 *       type: object
 *       properties:
 *         idProduct:
 *           type: integer
 *           example: 4
 *         idStorage:
 *           type: integer
 *           example: 1
 *         idPromotion:
 *           type: integer
 *           example: 4
 *         price:
 *           type: number
 *           format: float
 *           example: 332
 *         sale:
 *           type: integer
 *           example: 15
 *         count:
 *           type: integer
 *           example: 6
 *     PaginatedPrices:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: integer
 *           example: 100
 *         prices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Price'
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Неверные параметры"
 *         message:
 *           type: string
 *           example: "limit должен быть между 1 и 100"
 *         statusCode:
 *           type: integer
 *           example: 400
 */

/**
 * @swagger
 * /v1/prices:
 *   get:
 *     summary: Получить цены с пагинацией (limit/offset)
 *     tags: [Prices]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество элементов на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Смещение от начала списка
 *     responses:
 *       200:
 *         description: Список цен с пагинацией
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPrices'
 *             example:
 *               totalItems: 100
 *               prices:
 *                 - idProduct: 4
 *                   idStorage: 1
 *                   idPromotion: 4
 *                   price: 332
 *                   sale: 15
 *                   count: 6
 *                 - idProduct: 4
 *                   idStorage: 2
 *                   idPromotion: 4
 *                   price: 332
 *                   sale: 10
 *                   count: 16
 *       400:
 *         description: Неверные параметры пагинации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  // Валидация параметров
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'Неверные параметры пагинации',
      message: 'limit должен быть между 1 и 100',
      statusCode: 400
    });
  }

  if (offset < 0) {
    return res.status(400).json({
      error: 'Неверные параметры пагинации',
      message: 'offset не может быть отрицательным',
      statusCode: 400
    });
  }

  // Моковые данные (в реальном приложении - запрос к БД)
  const allPrices = Array.from({length: 100}, (_, i) => ({
    idProduct: 4,
    idStorage: (i % 3) + 1, // 1-3 склада
    idPromotion: 4,
    price: 332,
    sale: i % 2 === 0 ? 15 : 10,
    count: i % 2 === 0 ? 6 : 16
  }));

  const prices = allPrices.slice(offset, offset + limit);
  
  res.json({
    totalItems: allPrices.length,
    prices
  });
});

/**
 * @swagger
 * /v1/prices/{idProduct}:
 *   get:
 *     summary: Получить цену продукта и акцию
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Цена продукта и информация об акции
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Price'
 *       404:
 *         description: Цена для продукта не найдена
 */
router.get('/:idProduct', (req, res) => {
  const { idProduct } = req.params;
  
  // Пример ответа - в реальном приложении нужно получать данные из БД
  res.json({
    idProduct: Number(idProduct),
    idStorage: 1,
    idPromotion: 4,
    price: 332,
    sale: 15,
    count: 6
  });
});

module.exports = router;