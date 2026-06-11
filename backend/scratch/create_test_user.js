const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTestUser() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    
    const email = 'test@test.com';
    await pool.query('DELETE FROM usuarios WHERE email = $1', [email]);
    
    await pool.query(`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
    `, ['Usuario Test', email, hash, 'superadmin']);
    
    console.log('✅ Usuario Test creado: test@test.com / 123456');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

createTestUser();
