const express = require('express')
const router = express.Router()
const { 
  getTests,
  createTest,
  getTestById 
} = require('../controllers/tests')

router.get('/', getTests)
router.post('/', createTest)
router.get('/:id', getTestById)

module.exports = router