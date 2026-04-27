const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/archivosController');
const { verificarToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');

// Todas las rutas requieren autenticación
// POST /api/archivos/:paciente_id -> Subir archivo
router.post('/:paciente_id', verificarToken, upload.single('archivo'), archivosController.uploadArchivo);

// GET /api/archivos/:paciente_id -> Listar archivos de un paciente
router.get('/:paciente_id', verificarToken, archivosController.getArchivosPaciente);

// GET /api/archivos/file/:id -> Obtener Signed URL para un archivo específico
router.get('/file/:id', verificarToken, archivosController.getArchivo);

module.exports = router;
