const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/adminController');
const { verificarToken, soloSuperadmin } = require('../middleware/authMiddleware');

// Todas las rutas en este archivo están protegidas para que SOLO el superadmin pueda acceder
router.use(verificarToken, soloSuperadmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
