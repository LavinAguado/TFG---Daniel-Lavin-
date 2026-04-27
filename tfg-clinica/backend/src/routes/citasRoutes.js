const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

// GET /api/citas -> Obtener citas (filtradas por rol)
router.get('/citas', citasController.getCitas);
router.post('/citas', citasController.createCita);
router.put('/citas/:id', citasController.updateCita);
router.delete('/citas/:id', citasController.deleteCita);


module.exports = router;
