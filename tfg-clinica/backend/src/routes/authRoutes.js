const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, soloSuperadmin } = require('../middleware/authMiddleware');

// Ruta pública (Login y Register semilla)
router.post('/login', authController.login);

// El register lo hacemos mixto:
// Como middleware opcional, extraemos el token si lo hay para que el controller
// sepa si es un superadmin creando a otro, o si es la inicialización del sistema.
const extractTokenOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const jwt = require('jsonwebtoken');
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch(e) {}
  }
  next();
};

router.post('/register', extractTokenOptional, authController.register);
router.get('/admins', verificarToken, authController.getAdmins);

module.exports = router;
