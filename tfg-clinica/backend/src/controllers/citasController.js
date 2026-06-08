const { pool } = require('../config/db');
const { runInUserContext } = require('../config/dbUtils');

// Duración por defecto de una cita: 1 hora (en milisegundos)
const DURACION_CITA_MS = 60 * 60 * 1000;

/**
 * Comprueba si ya existe una cita que se solape en la misma franja de 1 h
 * para el mismo paciente o el mismo profesional.
 * @param {object} client   - cliente pg dentro de la transacción
 * @param {string} paciente_id
 * @param {string} usuario_id
 * @param {string} fecha    - ISO timestamp de la nueva cita
 * @param {string|null} excludeId - ID de la cita actual (para updates)
 * @returns {{ tipo: 'paciente'|'profesional', cita: object } | null}
 */
async function checkSolapamiento(client, paciente_id, usuario_id, fecha, excludeId = null) {
  // Dos citas de 1 h se solapan si la diferencia de inicio es < 1 h.
  // Condición: existing.fecha > (nueva - 1h) AND existing.fecha < (nueva + 1h)
  const query = `
    SELECT id, paciente_id, usuario_id, fecha
    FROM citas
    WHERE estado != 'cancelada'
      AND fecha > ($1::timestamptz - interval '1 hour')
      AND fecha < ($1::timestamptz + interval '1 hour')
      AND (paciente_id = $2 OR usuario_id = $3)
      ${excludeId ? 'AND id != $4' : ''}
    LIMIT 1
  `;
  const params = excludeId
    ? [fecha, paciente_id, usuario_id, excludeId]
    : [fecha, paciente_id, usuario_id];

  const res = await client.query(query, params);

  if (res.rows.length === 0) return null;

  const conflicto = res.rows[0];
  const tipo = conflicto.paciente_id === paciente_id ? 'paciente' : 'profesional';
  return { tipo, cita: conflicto };
}

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

const getProfesionales = async (req, res) => {
  console.log('📡 [Backend] Recibida petición en /api/staff o /api/profesionales');
  const client = await pool.connect();
  try {
    // Desactivar RLS a nivel de sesión para esta consulta.
    // FORCE ROW LEVEL SECURITY bloquearía esta consulta incluso con pool normal.
    // Este endpoint es de solo lectura y no expone datos sensibles.
    await client.query('SET LOCAL row_security = off');
    const resQuery = await client.query(`
      SELECT id, nombre, tipo, rol
      FROM usuarios
      WHERE rol IN ('admin', 'superadmin')
      ORDER BY nombre ASC
    `);
    console.log(`[getProfesionales] Devolviendo ${resQuery.rows.length} profesionales`);
    return res.status(200).json(resQuery.rows);
  } catch (err) {
    console.error('Error en getProfesionales:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

const getAdmins = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('SET LOCAL row_security = off');
    const resQuery = await client.query(`
      SELECT id, nombre, tipo
      FROM usuarios
      WHERE rol = 'admin'
      ORDER BY nombre ASC
    `);
    console.log(`[getAdmins] Devolviendo ${resQuery.rows.length} administradores`);
    return res.status(200).json(resQuery.rows);
  } catch (err) {
    console.error('Error en getAdmins:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

const createCita = async (req, res) => {
  try {
    const { paciente_id, usuario_id, fecha, estado, comentarios } = req.body;
    
    if (!paciente_id || !fecha || !usuario_id) {
      return res.status(400).json({ error: 'paciente_id, usuario_id y fecha son obligatorios' });
    }

    const data = await runInUserContext(req.user, async (client) => {
      const checkP = await client.query('SELECT id FROM pacientes WHERE id = $1', [paciente_id]);
      if (checkP.rows.length === 0) throw new Error('PATIENT_NOT_FOUND');

      const checkU = await client.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
      if (checkU.rows.length === 0) throw new Error('PROFESIONAL_NOT_FOUND');

      // Validación de solapamiento: mismo paciente o mismo profesional en la franja de 1 h
      const solape = await checkSolapamiento(client, paciente_id, usuario_id, fecha);
      if (solape) {
        const msg = solape.tipo === 'paciente'
          ? 'OVERLAP_PACIENTE'
          : 'OVERLAP_PROFESIONAL';
        throw new Error(msg);
      }

      const query = `
        INSERT INTO citas (paciente_id, usuario_id, fecha, estado, comentarios)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const resInsert = await client.query(query, [paciente_id, usuario_id, fecha, estado || 'pendiente', comentarios]);
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
    if (err.message === 'PROFESIONAL_NOT_FOUND') return res.status(404).json({ error: 'Profesional no encontrado' });
    if (err.message === 'OVERLAP_PACIENTE') return res.status(409).json({ error: 'El paciente ya tiene una cita en esa franja horaria' });
    if (err.message === 'OVERLAP_PROFESIONAL') return res.status(409).json({ error: 'El profesional ya tiene una cita en esa franja horaria' });
    console.error('Error en createCita:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, estado, comentarios, usuario_id } = req.body;

    const data = await runInUserContext(req.user, async (client) => {
      // Validar si el profesional que intentan asignar existe
      if (usuario_id) {
        const checkU = await client.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
        if (checkU.rows.length === 0) throw new Error('PROFESIONAL_NOT_FOUND');
      }

      // Si cambian fecha o profesional, validar solapamiento
      if (fecha || usuario_id) {
        // Obtener la cita actual para rellenar campos que no se envían
        const citaActual = await client.query('SELECT * FROM citas WHERE id = $1', [id]);
        if (citaActual.rows.length === 0) throw new Error('CITA_NOT_FOUND');
        const ca = citaActual.rows[0];

        const fechaFinal = fecha || ca.fecha;
        const usuarioFinal = usuario_id || ca.usuario_id;
        const pacienteFinal = ca.paciente_id;

        const solape = await checkSolapamiento(client, pacienteFinal, usuarioFinal, fechaFinal, id);
        if (solape) {
          const msg = solape.tipo === 'paciente'
            ? 'OVERLAP_PACIENTE'
            : 'OVERLAP_PROFESIONAL';
          throw new Error(msg);
        }
      }

      const query = `
        UPDATE citas 
        SET fecha = COALESCE($1, fecha), 
            estado = COALESCE($2, estado), 
            comentarios = COALESCE($3, comentarios),
            usuario_id = COALESCE($4, usuario_id)
        WHERE id = $5
        RETURNING *
      `;
      const resUpdate = await client.query(query, [fecha, estado, comentarios, usuario_id, id]);
      if (resUpdate.rowCount === 0) throw new Error('CITA_NOT_FOUND');
      
      const resFull = await client.query(`
        SELECT c.*, 
               json_build_object('id', p.id, 'nombre', p.nombre, 'apellidos', p.apellidos) as pacientes,
               json_build_object('id', u.id, 'nombre', u.nombre, 'rol', u.rol) as usuarios
        FROM citas c
        LEFT JOIN pacientes p ON c.paciente_id = p.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = $1
      `, [id]);
      return resFull.rows[0];
    });
    return res.status(200).json(data);
  } catch (err) {
    if (err.message === 'CITA_NOT_FOUND') return res.status(404).json({ error: 'Cita no encontrada' });
    if (err.message === 'PROFESIONAL_NOT_FOUND') return res.status(404).json({ error: 'Profesional no encontrado' });
    if (err.message === 'OVERLAP_PACIENTE') return res.status(409).json({ error: 'El paciente ya tiene una cita en esa franja horaria' });
    if (err.message === 'OVERLAP_PROFESIONAL') return res.status(409).json({ error: 'El profesional ya tiene una cita en esa franja horaria' });
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
  getProfesionales,
  getAdmins,
  createCita,
  updateCita,
  deleteCita
};

