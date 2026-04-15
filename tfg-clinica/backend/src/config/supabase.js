require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 1. Obtener las credenciales del entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 2. Validar que las credenciales existen
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las credenciales de Supabase en el archivo `.env` (SUPABASE_URL o SUPABASE_ANON_KEY)');
}

// 3. Crear el cliente
const supabase = createClient(supabaseUrl, supabaseKey);

// 4. Función de prueba
const testSupabaseConnection = async () => {
  console.log("👉 Ejecutando testSupabaseConnection...");

  try {
    // Para probar la conexión sin requerir tablas ya creadas, forzamos la petición a 
    // una tabla ficticia y evaluamos la respuesta del servidor.
    const { error } = await supabase
      .from('_dummy_table_check_')
      .select('*')
      .limit(1);

    if (error) {
      // Supabase devuelve este error explícitamente cuando las credenciales están bien 
      // y se ha llegado a la base de datos, pero la tabla no existe.
      if (error.message.includes('Could not find the table')) {
        console.log('✅ Conexión con Supabase establecida exitosamente!');
        console.log('ℹ️  Nota: Aún no tienes tablas creadas, pero la comunicación y las credenciales funcionan a la perfección.');
        return;
      }
      
      // Si el error es otro (por ejemplo, credenciales inválidas o sin internet)
      console.error('❌ Error test Supabase:', error.message);
      return;
    }

    console.log('✅ Conexión con Supabase establecida exitosamente!');
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
};

// 5. Exportar cliente y función de prueba
module.exports = {
  supabase,
  testSupabaseConnection
};
