const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  try {
    // 1. Obtener un usuario y un paciente para usar de prueba
    const uRes = await client.query('SELECT id FROM usuarios LIMIT 2');
    const pRes = await client.query('SELECT id FROM pacientes LIMIT 2');
    
    if (uRes.rows.length < 2 || pRes.rows.length < 2) {
      console.log('Se necesitan al menos 2 usuarios y 2 pacientes en la base de datos para esta prueba.');
      console.log('Usuarios encontrados:', uRes.rows.length);
      console.log('Pacientes encontrados:', pRes.rows.length);
      return;
    }

    const u1 = uRes.rows[0].id;
    const u2 = uRes.rows[1].id;
    const p1 = pRes.rows[0].id;
    const p2 = pRes.rows[1].id;

    const fecha = '2026-06-08T16:00:00.000Z';

    console.log('Tratando de insertar cita 1 (u1, p1, fecha)...');
    const res1 = await client.query(
      'INSERT INTO citas (paciente_id, usuario_id, fecha, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [p1, u1, fecha, 'pendiente']
    );
    console.log('Cita 1 insertada con éxito:', res1.rows[0]);

    console.log('Tratando de insertar cita 2 (u2, p2, fecha) - misma fecha, distintos profesionales y pacientes...');
    const res2 = await client.query(
      'INSERT INTO citas (paciente_id, usuario_id, fecha, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [p2, u2, fecha, 'pendiente']
    );
    console.log('Cita 2 insertada con éxito:', res2.rows[0]);

    // Limpieza
    console.log('Limpiando citas de prueba...');
    await client.query('DELETE FROM citas WHERE id IN ($1, $2)', [res1.rows[0].id, res2.rows[0].id]);
    console.log('Limpieza completada.');

  } catch (err) {
    console.error('ERROR AL INSERTAR CITAS TRASLAPADAS:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
