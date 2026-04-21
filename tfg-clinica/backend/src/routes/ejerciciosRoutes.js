const express = require('express');
const router = express.Router();
const ejerciciosController = require('../controllers/ejerciciosController');
const { soloAdmin } = require('../middleware/authMiddleware');

router.get('/ejercicios', ejerciciosController.getEjercicios);
router.post('/ejercicios', soloAdmin, ejerciciosController.createEjercicio);

module.exports = router;
