const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetPasswords() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    await pool.query('UPDATE usuarios SET password = $1 WHERE email IN ($2, $3)', 
      [hash, 'superadmin@theratrack.com', 'antigravity@theratrack.com']);
    
    console.log('✅ Contraseñas de superadmin y antigravity actualizadas a: password123');
  } catch (err) {
    console.error('❌ Error actualizando contraseñas:', err.message);
  } finally {
    await pool.end();
  }
}

resetPasswords();
