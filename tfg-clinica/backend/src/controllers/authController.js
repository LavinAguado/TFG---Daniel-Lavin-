const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// El controlador de autenticación utiliza el pool de PostgreSQL directamente
// para evitar restricciones de RLS durante el proceso de login/registro.

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol, tipo } = req.body;

    if (!nombre || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Datos incompletos o contraseña muy corta' });
    }

    if (!['superadmin', 'admin'].includes(rol)) {
      return res.status(400).json({ error: 'El rol debe ser superadmin o admin' });
    }

    let finalTipo = null;
    if (rol === 'admin') {
      const tiposValidos = ['fisio', 'entrenador'];
      if (!tipo || !tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: `Si el rol es admin, el tipo debe ser uno de: ${tiposValidos.join(', ')}` });
      }
      finalTipo = tipo;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO usuarios (nombre, email, password, rol, tipo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, email, rol, tipo, created_at
    `;

    const result = await pool.query(query, [nombre.trim(), email.trim().toLowerCase(), hashedPassword, rol, finalTipo]);

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }
    console.error('Error en register:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Intentando login para: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = $1 LIMIT 1';
    const result = await pool.query(query, [email.trim().toLowerCase()]);

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Login exitoso');
    return res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, tipo: usuario.tipo }
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login
};

