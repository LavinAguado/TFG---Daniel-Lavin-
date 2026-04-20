const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// GET /api/citas -> Obtener citas (filtradas por rol)
router.get('/citas', citasController.getCitas);

// POST /api/citas -> Crear nueva cita
router.post('/citas', citasController.createCita);

module.exports = router;
