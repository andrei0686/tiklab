const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /v1/products:
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
   */
  router.post('/', (req, res) => {
    const { name, description } = req.body;
    const newProduct = { idProduct: 2, name, description };
    res.status(201).json(newProduct);
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