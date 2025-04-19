const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         idProduct:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Стол"
 *         description:
 *           type: string
 *           example: "Обеденный"
 *     ProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Стул"
 *         description:
 *           type: string
 *           example: "Кухонный"
 *       required:
 *         - name
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
 *     PaginatedProducts:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: integer
 *           example: 100
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /v1/products:
 *   get:
 *     summary: Получить список продуктов с пагинацией (limit/offset)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество элементов
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Смещение от начала списка
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает список продуктов.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProducts'
 *             example:
 *               totalItems: 100
 *               products:
 *                 - idProduct: 1
 *                   name: "Стол"
 *                   description: "Обеденный"
 *                 - idProduct: 2
 *                   name: "Стул"
 *                   description: "Кухонный"
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
  const allProducts = Array.from({length: 100}, (_, i) => ({
    idProduct: i + 1,
    name: i % 2 === 0 ? 'Стол' : 'Стул',
    description: i % 2 === 0 ? 'Обеденный' : 'Кухонный'
  }));

  const products = allProducts.slice(offset, offset + limit);
  
  res.json({
    totalItems: allProducts.length,
    products
  });
});

/**
 * @swagger
 * /v1/products/{idProduct}:
 *   get:
 *     summary: Получить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает данные продукта.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:idProduct', (req, res) => {
  const { idProduct } = req.params;
  const productId = parseInt(idProduct);
  
  if (productId > 100 || productId < 1) {
    return res.status(404).json({
      error: 'Продукт не найден',
      message: `Продукт с ID ${idProduct} не найден`,
      statusCode: 404
    });
  }

  res.json({ 
    idProduct: productId, 
    name: productId % 2 === 0 ? 'Стул' : 'Стол', 
    description: productId % 2 === 0 ? 'Кухонный' : 'Обеденный'
  });
});

module.exports = router;