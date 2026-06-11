const bcrypt = require('bcryptjs');
const { runInUserContext } = require('../config/dbUtils');

// Listar todos los usuarios (admin y superadmin)
const getUsers = async (req, res) => {
  try {
    const data = await runInUserContext(req.user, async (client) => {
      const query = `
        SELECT id, nombre, email, rol, tipo, created_at
        FROM usuarios
        ORDER BY created_at DESC
      `;
      const resQuery = await client.query(query);
      return resQuery.rows;
    });
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en getUsers (admin):', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo usuario (generalmente un admin)
const createUser = async (req, res) => {
  try {
    const { nombre, email, password, rol, tipo } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (rol !== 'superadmin' && rol !== 'admin') {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    if (rol === 'admin' && !tipo) {
      return res.status(400).json({ error: 'El tipo es obligatorio para el rol admin' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const tipoFinal = rol === 'superadmin' ? null : tipo.trim().toLowerCase();

    const data = await runInUserContext(req.user, async (client) => {
      // Verificar si el email ya existe
      const checkEmail = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) throw new Error('EMAIL_EXISTS');

      const query = `
        INSERT INTO usuarios (nombre, email, password, rol, tipo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nombre, email, rol, tipo, created_at
      `;
      const resInsert = await client.query(query, [nombre, email, hashedPassword, rol, tipoFinal]);
      return resInsert.rows[0];
    });

    return res.status(201).json(data);
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
    }
    console.error('Error en createUser (admin):', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un usuario existente
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, tipo, password } = req.body;

    if (rol && rol !== 'superadmin' && rol !== 'admin') {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    if (rol === 'admin' && !tipo) {
      return res.status(400).json({ error: 'El tipo es obligatorio para el rol admin' });
    }

    // Hash de la nueva contraseña si se proporcionó
    let hashedPassword = null;
    if (password && password.trim().length >= 6) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const data = await runInUserContext(req.user, async (client) => {
      // Evitar que el superadmin se quite sus propios privilegios accidentalmente
      if (req.user.id === id && rol && rol !== 'superadmin') {
        throw new Error('SELF_DEMOTE_NOT_ALLOWED');
      }

      // Si el rol nuevo es superadmin, anulamos el tipo
      const tipoFinal = rol === 'superadmin' ? null : (tipo ? tipo.trim().toLowerCase() : null);

      let query;
      let params;

      if (hashedPassword) {
        query = `
          UPDATE usuarios 
          SET nombre = COALESCE($1, nombre), 
              email = COALESCE($2, email), 
              rol = COALESCE($3, rol), 
              tipo = COALESCE($4, tipo),
              password = $5
          WHERE id = $6
          RETURNING id, nombre, email, rol, tipo, created_at
        `;
        params = [nombre, email, rol, tipoFinal, hashedPassword, id];
      } else {
        query = `
          UPDATE usuarios 
          SET nombre = COALESCE($1, nombre), 
              email = COALESCE($2, email), 
              rol = COALESCE($3, rol), 
              tipo = COALESCE($4, tipo)
          WHERE id = $5
          RETURNING id, nombre, email, rol, tipo, created_at
        `;
        params = [nombre, email, rol, tipoFinal, id];
      }

      const resUpdate = await client.query(query, params);
      if (resUpdate.rowCount === 0) throw new Error('USER_NOT_FOUND');
      
      return resUpdate.rows[0];
    });

    return res.status(200).json(data);
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Usuario no encontrado' });
    if (err.message === 'SELF_DEMOTE_NOT_ALLOWED') return res.status(403).json({ error: 'No puedes quitarte tus propios privilegios de superadmin' });
    
    // Si viola la constraint UNIQUE del email
    if (err.code === '23505') return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
    
    console.error('Error en updateUser (admin):', err);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(403).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    await runInUserContext(req.user, async (client) => {
      const result = await client.query('DELETE FROM usuarios WHERE id = $1', [id]);
      if (result.rowCount === 0) throw new Error('USER_NOT_FOUND');
    });

    return res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    if (err.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Usuario no encontrado' });
    console.error('Error en deleteUser (admin):', err);
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
