const { pool } = require('./src/config/db');

const fix = async () => {
  try {
    const sql = `
      -- Habilitar RLS en ejercicios si no lo está
      ALTER TABLE ejercicios ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ejercicios FORCE ROW LEVEL SECURITY;

      -- Política para profesionales (admin y superadmin)
      DROP POLICY IF EXISTS ejercicios_profesionales_all ON ejercicios;
      CREATE POLICY ejercicios_profesionales_all ON ejercicios
      FOR ALL TO public
      USING (get_current_user_role() IN ('superadmin', 'admin'))
      WITH CHECK (get_current_user_role() IN ('superadmin', 'admin'));

      -- Política de lectura para pacientes (opcional, por si acaso)
      DROP POLICY IF EXISTS ejercicios_lectura_publica ON ejercicios;
      CREATE POLICY ejercicios_lectura_publica ON ejercicios
      FOR SELECT TO public
      USING (true);
    `;
    await pool.query(sql);
    console.log('✅ Políticas de ejercicios actualizadas.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
};

fix();
