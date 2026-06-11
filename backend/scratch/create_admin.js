const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    // Primero intentamos borrarlo si existe para asegurar la clave
    await pool.query('DELETE FROM usuarios WHERE email = $1', ['antigravity@theratrack.com']);
    
    const query = `
      INSERT INTO usuarios (nombre, email, password, rol, tipo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING email, rol
    `;
    
    const res = await pool.query(query, [
      'Admin Antigravity', 
      'antigravity@theratrack.com', 
      hash, 
      'superadmin', 
      null
    ]);
    
    console.log('✅ Usuario SuperAdmin creado con éxito:', res.rows[0].email);
  } catch (err) {
    console.error('❌ Error creando usuario:', err);
  } finally {
    await pool.end();
  }
}

createAdmin();
