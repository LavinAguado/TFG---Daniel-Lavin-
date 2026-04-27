const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimientoController');
const { verificarToken } = require('../middleware/authMiddleware');

// POST /api/seguimiento-completo
// Pública: El paciente envía su feedback detallado
router.post('/seguimiento-completo', seguimientoController.createSeguimientoCompleto);

// GET /api/seguimiento/:entrenamiento_id
// Privada: El profesional revisa el feedback
router.get('/seguimiento/:entrenamiento_id', verificarToken, seguimientoController.getSeguimientoByEntrenamiento);


module.exports = router;
