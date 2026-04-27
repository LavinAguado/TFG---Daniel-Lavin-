const { pool } = require('../config/db');
const { runInUserContext } = require('../config/dbUtils');
const { generateEntrenamientoPDF } = require('../utils/pdfGenerator');
const { sendTrainingEmail } = require('../utils/emailService');

const createEntrenamiento = async (req, res) => {
  try {
    const { paciente_id, fecha, notas, ejercicios } = req.body;

    if (!paciente_id || !fecha) {
      return res.status(400).json({ error: 'paciente_id y fecha son obligatorios' });
    }

    const data = await runInUserContext(req.user, async (client) => {
      await client.query('BEGIN');
      try {
        // 1. Obtener datos del paciente (para el PDF y Email)
        const resP = await client.query('SELECT nombre, apellidos, email FROM pacientes WHERE id = $1', [paciente_id]);
        if (resP.rows.length === 0) throw new Error('PATIENT_NOT_FOUND');
        const paciente = resP.rows[0];

        // 2. Insertar entrenamiento
        const notaFinal = req.user.tipo ? `[${req.user.tipo.toUpperCase()}] ${notas || ''}`.trim() : notas;
        const resInsert = await client.query(
          'INSERT INTO entrenamientos (paciente_id, usuario_id, fecha, notas) VALUES ($1, $2, $3, $4) RETURNING *',
          [paciente_id, req.user.id, fecha, notaFinal]
        );
        const entrenamiento = resInsert.rows[0];

        // 3. Insertar ejercicios si vienen en el payload
        if (ejercicios && Array.isArray(ejercicios)) {
          for (const ej of ejercicios) {
            await client.query(
              'INSERT INTO entrenamiento_ejercicios (entrenamiento_id, ejercicio_id, series, repeticiones, esfuerzo) VALUES ($1, $2, $3, $4, $5)',
              [entrenamiento.id, ej.ejercicio_id, ej.series, ej.repeticiones, ej.esfuerzo]
            );
          }
        }

        await client.query('COMMIT');

        // --- PROCESO POST-GUARDADO (PDF y Email) ---
        // Obtenemos el entrenamiento completo con ejercicios para el PDF
        const resFull = await client.query(`
          SELECT e.*, 
                 json_build_object('nombre', p.nombre, 'apellidos', p.apellidos, 'email', p.email) as pacientes,
                 (
                   SELECT json_agg(json_build_object(
                     'series', ee.series, 'repeticiones', ee.repeticiones, 'esfuerzo', ee.esfuerzo,
                     'ejercicios', json_build_object('nombre', ej.nombre, 'video_url', ej.video_url)
                   ))
                   FROM entrenamiento_ejercicios ee
                   JOIN ejercicios ej ON ee.ejercicio_id = ej.id
                   WHERE ee.entrenamiento_id = e.id
                 ) as entrenamiento_ejercicios
          FROM entrenamientos e
          JOIN pacientes p ON e.paciente_id = p.id
          WHERE e.id = $1
        `, [entrenamiento.id]);

        const fullEntrenamiento = resFull.rows[0];

        // Generar PDF de forma asíncrona (sin bloquear respuesta)
        generateEntrenamientoPDF(fullEntrenamiento).then(pdfBuffer => {
          if (paciente.email) {
            sendTrainingEmail(paciente.email, paciente.nombre, pdfBuffer);
          }
        }).catch(err => console.error('❌ Error post-creación entrenamiento:', err));

        return fullEntrenamiento;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    });

    return res.status(201).json(data);
  } catch (err) {
    if (err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ error: 'Paciente no encontrado o acceso denegado' });
    }
    console.error('Error en createEntrenamiento:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const addEjercicioAEntrenamiento = async (req, res) => {
  try {
    const { entrenamiento_id, ejercicio_id, series, repeticiones, esfuerzo } = req.body;

    if (!entrenamiento_id || !ejercicio_id) {
      return res.status(400).json({ error: 'entrenamiento_id y ejercicio_id son obligatorios' });
    }

    const data = await runInUserContext(req.user, async (client) => {
      // Verificar entrenamiento (dentro de RLS)
      const checkEnt = await client.query('SELECT id FROM entrenamientos WHERE id = $1', [entrenamiento_id]);
      if (checkEnt.rows.length === 0) throw new Error('TRAINING_NOT_FOUND');

      const query = `
        INSERT INTO entrenamiento_ejercicios (entrenamiento_id, ejercicio_id, series, repeticiones, esfuerzo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const resInsert = await client.query(query, [entrenamiento_id, ejercicio_id, series, repeticiones, esfuerzo]);
      return resInsert.rows[0];
    });

    return res.status(201).json(data);
  } catch (err) {
    if (err.message === 'TRAINING_NOT_FOUND') {
      return res.status(404).json({ error: 'Entrenamiento no encontrado o acceso denegado' });
    }
    console.error('Error en addEjercicioAEntrenamiento:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getEntrenamientos = async (req, res) => {
  try {
    const data = await runInUserContext(req.user, async (client) => {
      const query = `
        SELECT 
          e.*,
          json_build_object('id', p.id, 'nombre', p.nombre, 'apellidos', p.apellidos) as pacientes,
          json_build_object('id', u.id, 'nombre', u.nombre, 'rol', u.rol) as usuarios,
          (
            SELECT json_agg(json_build_object(
              'id', ee.id, 'series', ee.series, 'repeticiones', ee.repeticiones, 'esfuerzo', ee.esfuerzo,
              'ejercicios', json_build_object('id', ej.id, 'nombre', ej.nombre, 'descripcion', ej.descripcion)
            ))
            FROM entrenamiento_ejercicios ee
            JOIN ejercicios ej ON ee.ejercicio_id = ej.id
            WHERE ee.entrenamiento_id = e.id
          ) as entrenamiento_ejercicios
        FROM entrenamientos e
        LEFT JOIN pacientes p ON e.paciente_id = p.id
        LEFT JOIN usuarios u ON e.usuario_id = u.id
        ORDER BY e.fecha DESC
      `;
      const resQuery = await client.query(query);
      return resQuery.rows;
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en getEntrenamientos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getEntrenamientoPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const entrenamiento = await runInUserContext(req.user, async (client) => {
      const query = `
        SELECT 
          e.*,
          json_build_object('id', p.id, 'nombre', p.nombre, 'apellidos', p.apellidos, 'email', p.email) as pacientes,
          json_build_object('id', u.id, 'nombre', u.nombre, 'rol', u.rol) as usuarios,
          (
            SELECT json_agg(json_build_object(
              'id', ee.id, 'series', ee.series, 'repeticiones', ee.repeticiones, 'esfuerzo', ee.esfuerzo,
              'ejercicios', json_build_object('id', ej.id, 'nombre', ej.nombre, 'descripcion', ej.descripcion, 'video_url', ej.video_url)

            ))
            FROM entrenamiento_ejercicios ee
            JOIN ejercicios ej ON ee.ejercicio_id = ej.id
            WHERE ee.entrenamiento_id = e.id
          ) as entrenamiento_ejercicios
        FROM entrenamientos e
        LEFT JOIN pacientes p ON e.paciente_id = p.id
        LEFT JOIN usuarios u ON e.usuario_id = u.id
        WHERE e.id = $1
      `;
      const resQuery = await client.query(query, [id]);
      return resQuery.rows[0];
    });

    if (!entrenamiento) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado o acceso denegado' });
    }

    const pdfBuffer = await generateEntrenamientoPDF(entrenamiento);

    const nombrePaciente = entrenamiento.pacientes
      ? `${entrenamiento.pacientes.nombre}_${entrenamiento.pacientes.apellidos}`.replace(/\s+/g, '_')
      : 'paciente';
    const fechaCorta = new Date(entrenamiento.fecha).toISOString().split('T')[0];
    const filename = `entrenamiento_${nombrePaciente}_${fechaCorta}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Error en getEntrenamientoPDF:', err);
    return res.status(500).json({ error: 'Error interno al generar el PDF' });
  }
};

const getEntrenamientoById = async (req, res) => {
  try {
    const { id } = req.params;
    // Uso pool directamente para permitir acceso público vía link del PDF
    const query = `
      SELECT 
        e.*,
        json_build_object('id', p.id, 'nombre', p.nombre, 'apellidos', p.apellidos) as pacientes,
        (
          SELECT json_agg(json_build_object(
            'id', ee.id, 'series', ee.series, 'repeticiones', ee.repeticiones, 'esfuerzo', ee.esfuerzo,
            'ejercicios', json_build_object('id', ej.id, 'nombre', ej.nombre, 'descripcion', ej.descripcion, 'video_url', ej.video_url)
          ))
          FROM entrenamiento_ejercicios ee
          JOIN ejercicios ej ON ee.ejercicio_id = ej.id
          WHERE ee.entrenamiento_id = e.id
        ) as entrenamiento_ejercicios
      FROM entrenamientos e
      LEFT JOIN pacientes p ON e.paciente_id = p.id
      WHERE e.id = $1
    `;
    const resQuery = await pool.query(query, [id]);
    
    if (resQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    return res.status(200).json(resQuery.rows[0]);
  } catch (err) {
    console.error('Error en getEntrenamientoById:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createEntrenamiento,
  addEjercicioAEntrenamiento,
  getEntrenamientos,
  getEntrenamientoPDF,
  getEntrenamientoById
};

