const express = require('express');
const router = express.Router();

// routes/storages.js
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
 *   examples:  # Добавляем примеры для массива
 *     StorageArrayExample:
 *       value:  # Пример массива складов
 *         - id: 1
 *           name: "Склад 1"
 *         - id: 2
 *           name: "Склад 2"
 *         - id: 3
 *           name: "Склад 3"
 */

/**
 * @swagger
 * /storages:
 *   get:
 *     summary: Получить список складов
 *     tags: [storages]
 *     responses:
 *       200:
 *         description: Список складов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Storage'
 *             examples:  # Подключаем пример
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
 * /storages/{id}:
 *   get:
 *     summary: Получить склад по ID
 *     tags: [storages]
 *     parameters:
 *       - in: path
 *         name: id
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
 */
router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Склад ' + req.params.id });
});

module.exports = router;