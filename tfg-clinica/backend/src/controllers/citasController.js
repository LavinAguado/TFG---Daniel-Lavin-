const { runInUserContext } = require('../config/dbUtils');

const getCitas = async (req, res) => {
  try {
    const data = await runInUserContext(req.user, async (client) => {
      const query = `
        SELECT 
          c.*,
          json_build_object('id', p.id, 'nombre', p.nombre, 'apellidos', p.apellidos, 'email', p.email) as pacientes,
          json_build_object('id', u.id, 'nombre', u.nombre, 'email', u.email, 'rol', u.rol) as usuarios
        FROM citas c
        LEFT JOIN pacientes p ON c.paciente_id = p.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        ORDER BY c.fecha ASC
      `;
      const resQuery = await client.query(query);
      return resQuery.rows;
    });
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en getCitas:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createCita = async (req, res) => {
  try {
    const { paciente_id, fecha, estado, comentarios } = req.body;
    if (!paciente_id || !fecha) return res.status(400).json({ error: 'paciente_id y fecha son obligatorios' });

    const data = await runInUserContext(req.user, async (client) => {
      const checkP = await client.query('SELECT id FROM pacientes WHERE id = $1', [paciente_id]);
      if (checkP.rows.length === 0) throw new Error('PATIENT_NOT_FOUND');

      const query = `
        INSERT INTO citas (paciente_id, usuario_id, fecha, estado, comentarios)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const resInsert = await client.query(query, [paciente_id, req.user.id, fecha, estado || 'pendiente', comentarios]);
      const citaId = resInsert.rows[0].id;

      const resFull = await client.query(`
        SELECT c.*, 
               json_build_object('id', p.id, 'nombre', p.nombre, 'apellidos', p.apellidos) as pacientes,
               json_build_object('id', u.id, 'nombre', u.nombre, 'rol', u.rol) as usuarios
        FROM citas c
        LEFT JOIN pacientes p ON c.paciente_id = p.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = $1
      `, [citaId]);
      return resFull.rows[0];
    });
    return res.status(201).json(data);
  } catch (err) {
    if (err.message === 'PATIENT_NOT_FOUND') return res.status(404).json({ error: 'Paciente no encontrado' });
    console.error('Error en createCita:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, estado, comentarios } = req.body;

    const data = await runInUserContext(req.user, async (client) => {
      const query = `
        UPDATE citas 
        SET fecha = COALESCE($1, fecha), 
            estado = COALESCE($2, estado), 
            comentarios = COALESCE($3, comentarios)
        WHERE id = $4
        RETURNING *
      `;
      const resUpdate = await client.query(query, [fecha, estado, comentarios, id]);
      if (resUpdate.rowCount === 0) throw new Error('CITA_NOT_FOUND');
      
      const resFull = await client.query(`
        SELECT c.*, 
               json_build_object('id', p.id, 'nombre', p.nombre, 'apellidos', p.apellidos) as pacientes
        FROM citas c
        LEFT JOIN pacientes p ON c.paciente_id = p.id
        WHERE c.id = $1
      `, [id]);
      return resFull.rows[0];
    });
    return res.status(200).json(data);
  } catch (err) {
    if (err.message === 'CITA_NOT_FOUND') return res.status(404).json({ error: 'Cita no encontrada' });
    console.error('Error en updateCita:', err);
    return res.status(500).json({ error: 'Error al actualizar cita' });
  }
};

const deleteCita = async (req, res) => {
  try {
    const { id } = req.params;
    await runInUserContext(req.user, async (client) => {
      const result = await client.query('DELETE FROM citas WHERE id = $1', [id]);
      if (result.rowCount === 0) throw new Error('CITA_NOT_FOUND');
    });
    return res.status(200).json({ message: 'Cita eliminada correctamente' });
  } catch (err) {
    if (err.message === 'CITA_NOT_FOUND') return res.status(404).json({ error: 'Cita no encontrada' });
    console.error('Error en deleteCita:', err);
    return res.status(500).json({ error: 'Error al eliminar cita' });
  }
};

module.exports = {
  getCitas,
  createCita,
  updateCita,
  deleteCita
};

