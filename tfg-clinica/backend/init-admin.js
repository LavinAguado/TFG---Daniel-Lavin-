const { pool } = require('./src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createSuperadmin = async () => {
  const email = 'admin@clinica.com';
  const password = 'adminpassword';
  const nombre = 'Administrador Sistema';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insertar si no existe
    const sql = `
      INSERT INTO usuarios (nombre, email, password, rol, tipo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password = $3, nombre = $1, rol = $4, tipo = $5;
    `;

    await pool.query(sql, [nombre, email, hash, 'superadmin', 'fisio']);
    
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  🛡️  SUPERADMIN CONFIGURADO CON ÉXITO     ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('--------------------------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear superadmin:', err);
    process.exit(1);
  }
};

createSuperadmin();
