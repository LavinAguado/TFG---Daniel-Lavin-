const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// GET /api/citas -> Obtener citas
router.get('/citas', citasController.getCitas);

// GET /api/staff -> Obtener lista de profesionales para el selector
router.get('/staff', citasController.getProfesionales);

// GET /api/usuarios/admins -> Obtener lista de administradores
router.get('/usuarios/admins', citasController.getAdmins);

// POST /api/citas -> Crear nueva cita (usuario_id obligatorio)
router.post('/citas', citasController.createCita);

// PUT /api/citas/:id -> Actualizar cita
router.put('/citas/:id', citasController.updateCita);

// DELETE /api/citas/:id -> Eliminar cita
router.delete('/citas/:id', citasController.deleteCita);

module.exports = router;
