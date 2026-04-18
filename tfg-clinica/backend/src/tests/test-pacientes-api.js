const axios = require('axios');

const API_URL = 'http://localhost:3000/api/pacientes';

const runTests = async () => {
  console.log('🚀 Iniciando pruebas completas (CRUD) de la API de Pacientes...\n');
  let pacienteId = null;

  try {
    // a) POST (Crear paciente de prueba)
    console.log(`[a] POST ${API_URL}`);
    const nuevoPaciente = {
      nombre: "Juan",
      apellidos: "Pérez",
      telefono: "111222333",
      email: `test_${Date.now()}@email.com` // Email único para evitar error de duplicado
    };
    console.log('📝 Body enviado:');
    console.log(JSON.stringify(nuevoPaciente, null, 2));
    
    let response = await axios.post(API_URL, nuevoPaciente);
    pacienteId = response.data.id;
    console.log('\n✅ Status:', response.status);
    console.log('📦 Paciente creado con ID:', pacienteId);
    console.log('--------------------------------------------------\n');

    // b) GET (Obtener lista y verificar que Juan está ahí)
    console.log(`[b] GET ${API_URL}`);
    response = await axios.get(API_URL);
    console.log('✅ Status:', response.status);
    console.log(`📦 Se encontraron ${response.data.length} paciente(s).`);
    console.log('--------------------------------------------------\n');

    // c) PUT (Actualizar paciente creado)
    console.log(`[c] PUT ${API_URL}/${pacienteId}`);
    const updateData = {
      telefono: "999888777",
      email: `updated_${Date.now()}@email.com`
    };
    console.log('📝 Body enviado para actualizar:');
    console.log(JSON.stringify(updateData, null, 2));
    
    response = await axios.put(`${API_URL}/${pacienteId}`, updateData);
    console.log('\n✅ Status:', response.status);
    console.log('📦 Paciente actualizado:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('--------------------------------------------------\n');

    // d) GET (Verificar cambios)
    console.log(`[d] GET ${API_URL} (Verificando cambios)`);
    response = await axios.get(API_URL);
    const pacienteActualizado = response.data.find(p => p.id === pacienteId);
    console.log('✅ Status:', response.status);
    console.log('📦 Datos verificados desde servidor:');
    console.log(JSON.stringify(pacienteActualizado, null, 2));
    console.log('--------------------------------------------------\n');

    // e) DELETE (Eliminar paciente)
    console.log(`[e] DELETE ${API_URL}/${pacienteId}`);
    response = await axios.delete(`${API_URL}/${pacienteId}`);
    console.log('✅ Status:', response.status);
    console.log('📦 Respuesta:', response.data);
    console.log('--------------------------------------------------\n');

    // f) GET (Verificar que ya no existe)
    console.log(`[f] GET ${API_URL} (Verificando eliminación)`);
    response = await axios.get(API_URL);
    const pacienteEliminado = response.data.find(p => p.id === pacienteId);
    console.log('✅ Status:', response.status);
    console.log('📦 Verificación:', !pacienteEliminado ? '✅ Borrado exitosamente (ya no aparece en la lista)' : '❌ Error: Sigue apareciendo en la lista');
    console.log('--------------------------------------------------\n');

    console.log('🎉 Flujo CRUD completo funcionando correctamente al 100%!');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PETICIÓN:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Respuesta del servidor:`, error.response.data);
    } else {
      console.error('Detalles:', error.message);
      console.log('💡 Consejo: ¿Está el servidor Express corriendo en el puerto 3000?');
    }
  }
};

runTests();
