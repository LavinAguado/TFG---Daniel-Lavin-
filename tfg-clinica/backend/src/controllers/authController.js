const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// IMPORTANTE: RLS pendiente. Esta estructura de roles facilitará su implementación futura.

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol, tipo } = req.body;

    // Validaciones
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
    } else {
      // superadmin
      if (tipo) {
        return res.status(400).json({ error: 'Si el rol es superadmin, el tipo debe ser nulo' });
      }
    }

    // Comprobar si es el primer usuario (semilla) o si lo crea un superadmin
    let isSuperAdminReq = req.user && req.user.rol === 'superadmin';
    
    if (!isSuperAdminReq) {
      // Permitir si no hay NINGÚN usuario en la BD (para poder crear el primero)
      const { data: superadmins } = await supabase.from('usuarios').select('id').limit(1);
      if (superadmins && superadmins.length > 0) {
        return res.status(403).json({ error: 'Acceso denegado: Solo un superadmin puede registrar nuevos usuarios.' });
      }
      // Si es la semilla, obligar a que sea superadmin
      if (rol !== 'superadmin') {
        return res.status(403).json({ error: 'El primer usuario del sistema debe ser un superadmin' });
      }
    }

    // Verificar duplicado
    const { data: existente } = await supabase.from('usuarios').select('id').eq('email', email.trim().toLowerCase()).limit(1);
    if (existente && existente.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        rol,
        tipo: finalTipo
      }])
      .select('id, nombre, email, rol, tipo, created_at');

    if (error) throw error;

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: data[0]
    });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .limit(1);

    if (error) throw error;
    if (!usuarios || usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
