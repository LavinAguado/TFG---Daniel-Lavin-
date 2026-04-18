const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register -> Registrar nuevo usuario
router.post('/register', authController.register);

// POST /api/auth/login -> Iniciar sesión y obtener token
router.post('/login', authController.login);

module.exports = router;
