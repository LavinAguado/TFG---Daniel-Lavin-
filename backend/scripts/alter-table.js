require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function alterTable() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la BD');
    
    // Añadir columna tipo a la tabla usuarios (ignorar si ya existe)
    await client.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) NULL;
    `);
    
    // Migración opcional de datos existentes para que no rompan
    await client.query(`
      UPDATE usuarios 
      SET tipo = rol, rol = 'admin' 
      WHERE rol IN ('fisio', 'entrenador');
    `);

    // Eliminar el constraint de rol anterior
    await client.query(`
      ALTER TABLE usuarios 
      DROP CONSTRAINT IF EXISTS usuarios_rol_check;
    `);

    console.log('✅ Columna tipo añadida correctamente a usuarios');
    client.release();
  } catch (err) {
    console.error('❌ Error alterando tabla:', err);
  } finally {
    pool.end();
  }
}

alterTable();
