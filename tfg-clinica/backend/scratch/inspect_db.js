const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Inspeccionando restricciones de la tabla "citas"...');
    const res = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid) 
      FROM pg_constraint c 
      JOIN pg_namespace n ON n.oid = c.connamespace 
      WHERE conrelid = 'citas'::regclass;
    `);
    console.log('Restricciones:', res.rows);

    console.log('\nInspeccionando índices de la tabla "citas"...');
    const resIdx = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'citas';
    `);
    console.log('Índices:', resIdx.rows);

    console.log('\nInspeccionando disparadores (triggers) de la tabla "citas"...');
    const resTrig = await client.query(`
      SELECT tgname 
      FROM pg_trigger 
      WHERE tgrelid = 'citas'::regclass;
    `);
    console.log('Triggers:', resTrig.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
