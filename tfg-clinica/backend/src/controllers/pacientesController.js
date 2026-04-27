const { runInUserContext } = require('../config/dbUtils');

const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const getPacientes = async (req, res) => {
  try {
    const data = await runInUserContext(req.user, async (client) => {
      const resQuery = await client.query('SELECT * FROM pacientes ORDER BY created_at DESC');
      return resQuery.rows;
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en getPacientes:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createPaciente = async (req, res) => {
  try {
    const { nombre, apellidos, fecha_nacimiento, telefono, email } = req.body;

    if (!nombre?.trim() || !apellidos?.trim()) {
      return res.status(400).json({ error: 'Nombre y apellidos son obligatorios' });
    }

    if (email && !validarEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    const data = await runInUserContext(req.user, async (client) => {
      // Verificar duplicado (dentro de RLS)
      if (email) {
        const check = await client.query('SELECT id FROM pacientes WHERE email = $1 LIMIT 1', [email]);
        if (check.rows.length > 0) throw new Error('DUPLICATE_EMAIL');
      }

      const query = `
        INSERT INTO pacientes (nombre, apellidos, fecha_nacimiento, telefono, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const resInsert = await client.query(query, [
        nombre.trim(), 
        apellidos.trim(), 
        fecha_nacimiento || null, 
        telefono || null, 
        email || null
      ]);
      return resInsert.rows[0];
    });

    return res.status(201).json([data]); // Devolver array para mantener compatibilidad frontend anterior si es necesario
  } catch (err) {
    if (err.message === 'DUPLICATE_EMAIL') {
      return res.status(400).json({ error: 'Ya existe un paciente con ese correo electrónico' });
    }
    console.error('Error en createPaciente:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
};

const updatePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, fecha_nacimiento, telefono, email } = req.body;

    const data = await runInUserContext(req.user, async (client) => {
      const query = `
        UPDATE pacientes 
        SET nombre = COALESCE($1, nombre),
            apellidos = COALESCE($2, apellidos),
            fecha_nacimiento = COALESCE($3, fecha_nacimiento),
            telefono = COALESCE($4, telefono),
            email = COALESCE($5, email)
        WHERE id = $6
        RETURNING *
      `;
      const resUpdate = await client.query(query, [nombre, apellidos, fecha_nacimiento, telefono, email, id]);
      return resUpdate.rows[0];
    });

    if (!data) return res.status(404).json({ error: 'Paciente no encontrado' });
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en updatePaciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deletePaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await runInUserContext(req.user, async (client) => {
      const resDelete = await client.query('DELETE FROM pacientes WHERE id = $1 RETURNING id', [id]);
      return resDelete.rows[0];
    });

    if (!result) return res.status(404).json({ error: 'Paciente no encontrado' });
    return res.status(200).json({ mensaje: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('Error en deletePaciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPacientes,
  createPaciente,
  updatePaciente,
  deletePaciente
};
