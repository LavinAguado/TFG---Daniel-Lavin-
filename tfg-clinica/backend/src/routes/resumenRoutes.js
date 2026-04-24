const express = require('express');
const router = express.Router();
const resumenController = require('../controllers/resumenController');
const { verificarToken } = require('../middleware/authMiddleware');

// GET /api/resumen-ia/:paciente_id
// Privada: Requiere autenticación
router.get('/resumen-ia/:paciente_id', verificarToken, resumenController.getResumenPacienteIA);

module.exports = router;
