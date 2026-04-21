const express = require('express');
const router = express.Router();
const entrenamientosController = require('../controllers/entrenamientosController');
const { soloAdmin } = require('../middleware/authMiddleware');

router.get('/entrenamientos', entrenamientosController.getEntrenamientos);
router.post('/entrenamientos', soloAdmin, entrenamientosController.createEntrenamiento);
router.post('/entrenamientos/ejercicio', soloAdmin, entrenamientosController.addEjercicioAEntrenamiento);

module.exports = router;
