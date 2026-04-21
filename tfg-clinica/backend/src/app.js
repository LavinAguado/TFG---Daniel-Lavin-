const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const pacientesRoutes = require('./routes/pacientesRoutes');
const citasRoutes = require('./routes/citasRoutes');
const ejerciciosRoutes = require('./routes/ejerciciosRoutes');
const entrenamientosRoutes = require('./routes/entrenamientosRoutes');
const { verificarToken } = require('./middleware/authMiddleware');

// Rutas públicas (no requieren token)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren token JWT)
app.use('/api', verificarToken, pacientesRoutes);
app.use('/api', verificarToken, citasRoutes);
app.use('/api', verificarToken, ejerciciosRoutes);
app.use('/api', verificarToken, entrenamientosRoutes);

module.exports = app;
