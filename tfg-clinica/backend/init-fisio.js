const { pool } = require('./src/config/db');
const bcrypt = require('bcryptjs');

const createRegularAdmin = async () => {
  const email = 'fisio@clinica.com';
  const password = 'fisiopassword';
  const nombre = 'Fisioterapeuta Demo';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO usuarios (nombre, email, password, rol, tipo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password = $3, nombre = $1, rol = $4, tipo = $5;
    `;

    await pool.query(sql, [nombre, email, hash, 'admin', 'fisio']);
    
    console.log('Regular admin created:', email, password);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

createRegularAdmin();
