const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Price:
 *       type: object
 *       properties:
 *         idPrice:
 *           type: integer
 *           example: 3
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
 *     PriceArray:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Price'
 *       example:
 *         - idPrice: 3
 *           idProduct: 4
 *           idStorage: 1
 *           idPromotion: 4
 *           price: 332
 *           sale: 15
 *           count: 6
 *         - idPrice: 2
 *           idProduct: 4
 *           idStorage: 2
 *           idPromotion: 4
 *           price: 332
 *           sale: 10
 *           count: 16
 */

/**
 * @swagger
 * /v1/prices:
 *   get:
 *     summary: Получить цены на все продукты
 *     tags: [Prices]
 *     responses:
 *       200:
 *         description: Список цен на продукты
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PriceArray'
 */
router.get('/', (req, res) => {
  res.json([
    {
      idPrice: 3,
      idProduct: 4,
      idStorage: 1,
      idPromotion: 4,
      price: 332,
      sale: 15,
      count: 6
    },
    {
      idPrice: 2,
      idProduct: 4,
      idStorage: 2,
      idPromotion: 4,
      price: 332,
      sale: 10,
      count: 16
    }
  ]);
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
 *       - in: query
 *         name: idProduct
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
    idPrice: 3,
    idProduct: Number(idProduct),
    idStorage: 1,
    idPromotion: 4,
    price: 332,
    sale: 15,
    count: 6
  });
});

module.exports = router;