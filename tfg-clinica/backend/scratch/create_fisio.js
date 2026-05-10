const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createFisio() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    await pool.query('DELETE FROM usuarios WHERE email = $1', ['fisio@theratrack.com']);
    
    const query = `
      INSERT INTO usuarios (nombre, email, password, rol, tipo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING email, rol, tipo
    `;
    
    const res = await pool.query(query, [
      'Fisio Test', 
      'fisio@theratrack.com', 
      hash, 
      'admin', 
      'fisio'
    ]);
    
    console.log('✅ Usuario Admin (Fisio) creado con éxito:', res.rows[0].email);
  } catch (err) {
    console.error('❌ Error creando usuario:', err);
  } finally {
    await pool.end();
  }
}

createFisio();
