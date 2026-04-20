const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// IMPORTANTE: En la fase final se implementará Row Level Security (RLS) en Supabase
// para reforzar la seguridad del acceso a datos. Actualmente la protección se realiza
// únicamente a nivel de middleware JWT + roles en Express. RLS es un paso pendiente crítico.

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'El campo email es obligatorio' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const rolesValidos = ['admin', 'fisio', 'entrenador'];
    if (!rol || !rolesValidos.includes(rol)) {
      return res.status(400).json({
        error: `El rol debe ser uno de: ${rolesValidos.join(', ')}`
      });
    }

    // Verificar que el email no exista
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existente && existente.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        rol
      }])
      .select('id, nombre, email, rol, created_at');

    if (error) {
      console.error('Error al registrar usuario:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: data[0]
    });
  } catch (err) {
    console.error('Error inesperado en register:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario por email
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    if (error) {
      console.error('Error al buscar usuario:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error('Error inesperado en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login
};
