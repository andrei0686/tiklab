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
 * /v1/users:
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
 * /v1/users/{id}:
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


module.exports = router;