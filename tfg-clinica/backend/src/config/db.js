require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const testConnection = async () => {
  console.log("👉 Ejecutando testConnection...");

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ DB conectada');
    console.log('🕒', res.rows[0].now);
  } catch (err) {
    console.error('❌ Error DB:', err.message);
  }
};

module.exports = {
  pool,
  testConnection
};