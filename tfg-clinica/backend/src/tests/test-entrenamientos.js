const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🏋️ TEST EJERCICIOS Y ENTRENAMIENTOS   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let token = null;
  let pacienteId = null;
  let ejercicioId = null;
  let entrenamientoId = null;
  const uniqueId = Date.now();

  try {
    // ─── SETUP: Login ───────────
    console.log('══ [SETUP] Registrar usuario + Login ══');
    const registerData = {
      nombre: 'Entrenador Test',
      email: `entrenador_${uniqueId}@email.com`,
      password: 'password123',
      rol: 'entrenador'
    };
    await axios.post(`${AUTH_URL}/register`, registerData);
    const loginRes = await axios.post(`${AUTH_URL}/login`, {
      email: registerData.email,
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('✅ Autenticado con éxito');
    console.log('--------------------------------------------------\n');

    // ─── SETUP: Paciente ───────────
    console.log('══ [SETUP] Crear paciente ══');
    const pacRes = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Deportista',
      apellidos: 'Pro',
      email: `deportista_${uniqueId}@email.com`
    }, { headers: { Authorization: `Bearer ${token}` } });
    pacienteId = pacRes.data.id;
    console.log('✅ Paciente creado:', pacienteId);
    console.log('--------------------------------------------------\n');

    // ─── a) POST Crear Ejercicio ───────────
    console.log('══ [a] POST /api/ejercicios ══');
    const ejRes = await axios.post(`${BASE_URL}/ejercicios`, {
      nombre: 'Sentadilla Libre',
      descripcion: 'Sentadilla profunda con barra',
      video_url: 'https://youtube.com/test'
    }, { headers: { Authorization: `Bearer ${token}` } });
    ejercicioId = ejRes.data.id;
    console.log('✅ Ejercicio creado:', ejRes.data);
    console.log('--------------------------------------------------\n');

    // ─── b) POST Crear Entrenamiento ───────────
    console.log('══ [b] POST /api/entrenamientos ══');
    const entRes = await axios.post(`${BASE_URL}/entrenamientos`, {
      paciente_id: pacienteId,
      fecha: new Date().toISOString(),
      notas: 'Día de pierna pesado'
    }, { headers: { Authorization: `Bearer ${token}` } });
    entrenamientoId = entRes.data.id;
    console.log('✅ Entrenamiento creado:', entRes.data);
    console.log('--------------------------------------------------\n');

    // ─── c) POST Añadir Ejercicio a Entrenamiento ───────────
    console.log('══ [c] POST /api/entrenamientos/ejercicio ══');
    const addRes = await axios.post(`${BASE_URL}/entrenamientos/ejercicio`, {
      entrenamiento_id: entrenamientoId,
      ejercicio_id: ejercicioId,
      series: 4,
      repeticiones: 10,
      esfuerzo: 8
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('✅ Ejercicio añadido a entrenamiento:', addRes.data);
    console.log('--------------------------------------------------\n');

    // ─── d) GET Obtener Entrenamientos con Relaciones ───────────
    console.log('══ [d] GET /api/entrenamientos ══');
    const getRes = await axios.get(`${BASE_URL}/entrenamientos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status:', getRes.status);
    console.log(`📦 Total de entrenamientos devueltos: ${getRes.data.length}`);
    
    if (getRes.data.length > 0) {
      const ent = getRes.data[0];
      console.log(`\n📄 DETALLE DEL ENTRENAMIENTO (Join funcional):`);
      console.log(`   Paciente: ${ent.pacientes?.nombre} ${ent.pacientes?.apellidos}`);
      console.log(`   Entrenador: ${ent.usuarios?.nombre}`);
      console.log(`   Notas: ${ent.notas}`);
      console.log(`   🏋️ Ejercicios (${ent.entrenamiento_ejercicios?.length}):`);
      ent.entrenamiento_ejercicios?.forEach(ee => {
        console.log(`      - ${ee.ejercicios?.nombre}: ${ee.series}x${ee.repeticiones} [Esfuerzo: ${ee.esfuerzo}]`);
      });
    }
    console.log('--------------------------------------------------\n');

    console.log('🎉 ¡Flujo de ejercicios y entrenamientos funcionando correctamente!');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PETICIÓN:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Respuesta:', error.response.data);
    } else {
      console.error('Detalles:', error.message);
    }
  }
};

runTests();
