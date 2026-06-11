const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM citas');
    console.log('Citas existentes:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
