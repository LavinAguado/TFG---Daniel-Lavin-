const express = require('express');
const router = express.Router();
const entrenamientosController = require('../controllers/entrenamientosController');
const { soloAdmin, verificarRol } = require('../middleware/authMiddleware');

router.get('/entrenamientos', entrenamientosController.getEntrenamientos);
router.post('/entrenamientos', verificarRol('admin', 'superadmin'), entrenamientosController.createEntrenamiento);
router.post('/entrenamientos/ejercicio', verificarRol('admin', 'superadmin'), entrenamientosController.addEjercicioAEntrenamiento);


// Ruta para generar y descargar PDF de un entrenamiento
// Acceso: admin (solo sus entrenamientos) y superadmin (todos)
router.get('/entrenamientos/:id', entrenamientosController.getEntrenamientoById);
router.get('/entrenamientos/:id/pdf', verificarRol('admin', 'superadmin'), entrenamientosController.getEntrenamientoPDF);


module.exports = router;

