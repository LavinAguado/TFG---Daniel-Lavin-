const express = require('express');
const cors = require('cors');

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

// Aquí se importarán y usarán las rutas
const pacientesRoutes = require('./routes/pacientesRoutes');
app.use('/api', pacientesRoutes);

module.exports = app;
