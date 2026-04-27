const express = require('express');
const router = express.Router();
const ejerciciosController = require('../controllers/ejerciciosController');
const { soloAdmin } = require('../middleware/authMiddleware');

router.get('/ejercicios', ejerciciosController.getEjercicios);
router.post('/ejercicios', soloAdmin, ejerciciosController.createEjercicio);
router.put('/ejercicios/:id', soloAdmin, ejerciciosController.updateEjercicio);
router.delete('/ejercicios/:id', soloAdmin, ejerciciosController.deleteEjercicio);


module.exports = router;
