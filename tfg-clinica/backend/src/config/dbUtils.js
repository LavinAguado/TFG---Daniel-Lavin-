const { pool } = require('./db');

/**
 * Ejecuta una consulta o serie de consultas dentro de una transacción
 * estableciendo el contexto de RLS para el usuario actual.
 * 
 * @param {Object} user - Objeto usuario { id, rol }
 * @param {Function} callback - Función que recibe el cliente de la DB
 */
const runInUserContext = async (user, callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Establecer variables de sesión para RLS
    // 'true' al final de set_config lo hace local a la transacción
    if (user && user.id) {
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [user.id]);
      await client.query("SELECT set_config('app.current_user_role', $1, true)", [user.rol]);
    }


    const result = await callback(client);
    
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  runInUserContext
};
