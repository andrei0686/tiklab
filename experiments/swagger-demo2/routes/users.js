const express = require('express');
const router = express.Router();

// routes/users.js
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
 *           example: "Вася пупкин"
 *     Product:
 *       type: object
 *       properties:
 *         idProduct:
 *           type: integer
 *           example: 2
 *         name:
 *           type: string
 *           example: "стул"
 *         description:
 *           type: string
 *           example: "кухонный"
 *     ProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "стул"
 *         description:
 *           type: string
 *           example: "кухонный"
 *       required:
 *         - name
 */

/**
 * @swagger
 * /users:
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
  res.json([{ id: 1, name: 'Вася пупкин' }]);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
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
router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Вася пупкин' });
});

/**
 * @swagger
 * /products:
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
 */
router.get('/', (req, res) => {
  res.json([{ idProduct: 1, name: 'Стол', description: 'Обеденный' }]);
});

/**
 * @swagger
 * /products:
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
 */
router.post('/', (req, res) => {
  const { name, description } = req.body;
  const newProduct = { idProduct: 2, name, description };
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /products/{idProduct}:
 *   get:
 *     summary: Получить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные продукта
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.get('/:idProduct', (req, res) => {
  res.json({ 
    idProduct: req.params.idProduct, 
    name: 'Стул', 
    description: 'Кухонный' 
  });
});

/**
 * @swagger
 * /products/{idProduct}:
 *   patch:
 *     summary: Обновить продукт
 *     tags: [Products]
 *     parameters:
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
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Обновленные данные продукта
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.patch('/:idProduct', (req, res) => {
  const { name, description } = req.body;
  res.json({ 
    idProduct: req.params.idProduct, 
    name: name || 'Стул', 
    description: description || 'Кухонный' 
  });
});

module.exports = router;