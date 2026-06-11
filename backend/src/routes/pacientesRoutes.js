const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');

// GET /api/pacientes -> Obtener todos los pacientes
router.get('/pacientes', pacientesController.getPacientes);

// POST /api/pacientes -> Crear un nuevo paciente
router.post('/pacientes', pacientesController.createPaciente);

// PUT /api/pacientes/:id -> Actualizar un paciente existente
router.put('/pacientes/:id', pacientesController.updatePaciente);

// DELETE /api/pacientes/:id -> Eliminar un paciente
router.delete('/pacientes/:id', pacientesController.deletePaciente);

module.exports = router;
