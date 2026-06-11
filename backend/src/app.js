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
const seguimientoRoutes = require('./routes/seguimientoRoutes');
const resumenRoutes = require('./routes/resumenRoutes');
const archivosRoutes = require('./routes/archivosRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { verificarToken } = require('./middleware/authMiddleware');

// Rutas públicas (no requieren token o manejan su propia seguridad pública)
app.use('/api/auth', authRoutes);
app.use('/api', seguimientoRoutes);

// Rutas protegidas (requieren token JWT)
app.use('/api', verificarToken, pacientesRoutes);
app.use('/api', verificarToken, citasRoutes);
app.use('/api', verificarToken, ejerciciosRoutes);
app.use('/api', verificarToken, entrenamientosRoutes);
app.use('/api', verificarToken, resumenRoutes);
app.use('/api/archivos', archivosRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
