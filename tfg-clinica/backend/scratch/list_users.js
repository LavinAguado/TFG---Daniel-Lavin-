const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function listUsers() {
  try {
    const res = await pool.query('SELECT id, nombre, email, rol, tipo FROM usuarios');
    console.log('--- USUARIOS EN DB ---');
    console.table(res.rows);
  } catch (err) {
    console.error('❌ Error listando usuarios:', err.message);
  } finally {
    await pool.end();
  }
}

listUsers();
