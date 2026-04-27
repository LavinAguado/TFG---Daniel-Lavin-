const { pool } = require('../config/db');
const { runInUserContext } = require('../config/dbUtils');

const createSeguimientoCompleto = async (req, res) => {
  try {
    const { entrenamiento_id, dolor, esfuerzo, comentarios, ejercicios } = req.body;

    if (!entrenamiento_id) {
      return res.status(400).json({ error: 'entrenamiento_id es obligatorio' });
    }

    const executeTransaction = async (client) => {
      try {
        await client.query('BEGIN');

        const checkEnt = await client.query('SELECT id FROM entrenamientos WHERE id = $1', [entrenamiento_id]);
        if (checkEnt.rows.length === 0) throw new Error('TRAINING_NOT_FOUND');

        const querySeg = `
          INSERT INTO seguimiento (entrenamiento_id, dolor, esfuerzo, comentarios)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const resSeg = await client.query(querySeg, [entrenamiento_id, dolor, esfuerzo, comentarios]);
        const seguimientoId = resSeg.rows[0].id;

        if (ejercicios && Array.isArray(ejercicios)) {
          for (const ej of ejercicios) {
            const queryEj = `
              INSERT INTO seguimiento_ejercicios (seguimiento_id, ejercicio_id, esfuerzo_real, dificultad, comentario)
              VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(queryEj, [
              seguimientoId, 
              ej.ejercicio_id, 
              ej.esfuerzo_real, 
              ej.dificultad, 
              ej.comentario
            ]);
          }
        }

        await client.query('COMMIT');
        return resSeg.rows[0];
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    };

    let data;
    if (req.user) {
      data = await runInUserContext(req.user, executeTransaction);
    } else {
      data = await executeTransaction(pool);
    }

    return res.status(201).json(data);
  } catch (err) {
    if (err.message === 'TRAINING_NOT_FOUND') {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }
    console.error('Error en createSeguimientoCompleto:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getSeguimientoByEntrenamiento = async (req, res) => {
  try {
    const { entrenamiento_id } = req.params;

    const data = await runInUserContext(req.user, async (client) => {
      const query = `
        SELECT 
          s.*,
          (
            SELECT json_agg(json_build_object(
              'id', se.id, 
              'ejercicio_id', se.ejercicio_id,
              'esfuerzo_real', se.esfuerzo_real,
              'dificultad', se.dificultad,
              'comentario', se.comentario,
              'ejercicio_nombre', ej.nombre
            ))
            FROM seguimiento_ejercicios se
            JOIN ejercicios ej ON se.ejercicio_id = ej.id
            WHERE se.seguimiento_id = s.id
          ) as ejercicios_detalle
        FROM seguimiento s 
        WHERE s.entrenamiento_id = $1 
        ORDER BY s.fecha DESC
      `;
      const resQuery = await client.query(query, [entrenamiento_id]);
      return resQuery.rows;
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en getSeguimientoByEntrenamiento:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createSeguimientoCompleto,
  getSeguimientoByEntrenamiento
};
