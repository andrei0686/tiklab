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
 *           example: "Product not found"
 *         message:
 *           type: string
 *           example: "The requested product with ID 99 was not found"
 *         statusCode:
 *           type: integer
 *           example: 404
 */



/**
 * @swagger
 * /v2/products:
 *   get:
 *     summary: Получить список продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список продуктов
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
      error: 'Internal Server Error',
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
 *         description: Созданный продукт
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные входные данные
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
 *         description: Данные продукта
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
    
    if (productId > 100) { // Пример условия для имитации ненайденного продукта
      return res.status(404).json({
        error: 'Product not found',
        message: `The requested product with ID ${idProduct} was not found`,
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
 *     summary: Обновить продукт
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
 *         description: Обновленные данные продукта
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Неверные входные данные
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

    if (productId > 100) { // Пример условия для имитации ненайденного продукта
      return res.status(404).json({
        error: 'Product not found',
        message: `The requested product with ID ${idProduct} was not found`,
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
      error: 'Internal Server Error',
      message: error.message,
      statusCode: 500
    });
  }
});

module.exports = router;