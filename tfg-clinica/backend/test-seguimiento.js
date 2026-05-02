const { pool } = require('./src/config/db');
const { createSeguimientoCompleto } = require('./src/controllers/seguimientoController');

async function test() {
  try {
    const entRes = await pool.query('SELECT id, paciente_id FROM entrenamientos LIMIT 1');
    if (entRes.rows.length === 0) {
      console.log('No trainings found to test with.');
      process.exit(0);
    }
    const entrenamiento_id = entRes.rows[0].id;
    const paciente_id = entRes.rows[0].paciente_id; // For RLS check

    const ejRes = await pool.query('SELECT id FROM ejercicios LIMIT 1');
    const ejercicio_id = ejRes.rows[0].id;

    // We will bypass RLS by passing no req.user (it will use the superuser pool)
    const req = {
      body: {
        entrenamiento_id,
        dolor: 2,
        esfuerzo: 6,
        comentarios: 'Test direct call general',
        ejercicios: [
          {
            ejercicio_id,
            esfuerzo_real: 7,
            dificultad: 5,
            comentario: 'Test direct call exercise'
          }
        ]
      }
    };

    const res = {
      status: function(s) {
        this.statusCode = s;
        return this;
      },
      json: async function(data) {
        if (this.statusCode >= 400) {
          console.error('Error response:', data);
          process.exit(1);
        }
        console.log('Success response:', data);
        
        // Verify in DB
        const seguimientoId = data.id;
        const dbSegEj = await pool.query('SELECT * FROM seguimiento_ejercicios WHERE seguimiento_id = $1', [seguimientoId]);
        console.log('DB Seguimiento_Ejercicios:', dbSegEj.rows[0]);

        // Cleanup
        await pool.query('DELETE FROM seguimiento WHERE id = $1', [seguimientoId]);
        console.log('Test successful. Cleanup done.');
        process.exit(0);
      }
    };

    console.log('Calling createSeguimientoCompleto...');
    await createSeguimientoCompleto(req, res);

  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
}

test();
