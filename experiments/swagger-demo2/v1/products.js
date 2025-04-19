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
 *           example: "продукт не найден"
 *         message:
 *           type: string
 *           example: "запрошенный ID 99 не найден"
 *         statusCode:
 *           type: integer
 *           example: 404
 */

/**
 * @swagger
 * /v1/products:
 *   get:
 *     summary: Получить список всех продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает массив продуктов.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  try {
    res.json([{ idProduct: 1, name: 'Стол', description: 'Обеденный' }]);
  } catch (error) {
    res.status(500).json({ 
      error: 'Внутреняя ошибка сервера',
      message: error.message,
      statusCode: 500
    });
  }
});

/**
 * @swagger
 * /v1/products:
 *   post:
 *     summary: Создать новый продукт
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Продукт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Невалидные входные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name is required',
        statusCode: 400
      });
    }

    const newProduct = { idProduct: 2, name, description };
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      statusCode: 500
    });
  }
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
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:idProduct', (req, res) => {
  try {
    const { idProduct } = req.params;
    const productId = parseInt(idProduct);
    
    if (productId > 100) {
      return res.status(404).json({
        error: 'Product not found',
        message: `Product with ID ${idProduct} not found`,
        statusCode: 404
      });
    }

    res.json({ 
      idProduct: productId, 
      name: 'Стул', 
      description: 'Кухонный' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      statusCode: 500
    });
  }
});

/**
 * @swagger
 * /v1/products/{idProduct}:
 *   patch:
 *     summary: Частично обновить продукт
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Продукт успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Невалидные входные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Продукт не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:idProduct', (req, res) => {
  try {
    const { idProduct } = req.params;
    const { name, description } = req.body;
    const productId = parseInt(idProduct);

    if (!name && !description) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'At least one field (name or description) must be provided',
        statusCode: 400
      });
    }

    if (productId > 100) {
      return res.status(404).json({
        error: 'Продукт не найден',
        message: `продукт ID ${idProduct} не найден`,
        statusCode: 404
      });
    }

    res.json({ 
      idProduct: productId, 
      name: name || 'Стул', 
      description: description || 'Кухонный' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'внутренняя ошибка',
      message: error.message,
      statusCode: 500
    });
  }
});

module.exports = router;