require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const users = await pool.query("SELECT email, rol FROM usuarios LIMIT 5;");
    const patients = await pool.query("SELECT nombre, apellidos FROM pacientes LIMIT 5;");
    console.log("USERS:", users.rows);
    console.log("PATIENTS:", patients.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
