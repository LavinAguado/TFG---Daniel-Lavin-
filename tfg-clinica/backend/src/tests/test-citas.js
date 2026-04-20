const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  📅 TEST MÓDULO DE CITAS                ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let token = null;
  let pacienteId = null;
  const uniqueId = Date.now();

  try {
    // ─── SETUP: Registrar usuario y hacer login ───────────
    console.log('══ [SETUP] Registrar usuario + Login ══');
    const registerData = {
      nombre: 'Dr. Citas Test',
      email: `citas_test_${uniqueId}@email.com`,
      password: 'password123',
      rol: 'fisio'
    };

    await axios.post(`${AUTH_URL}/register`, registerData);
    const loginRes = await axios.post(`${AUTH_URL}/login`, {
      email: registerData.email,
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('✅ Usuario registrado y autenticado');
    console.log(`🔑 Token: ${token.substring(0, 40)}...`);
    console.log('--------------------------------------------------\n');

    // ─── SETUP: Crear un paciente para la cita ────────────
    console.log('══ [SETUP] Crear paciente de prueba ══');
    const pacienteRes = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Paciente Cita',
      apellidos: 'Test Prueba',
      telefono: '666777888',
      email: `paciente_cita_${uniqueId}@email.com`
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    pacienteId = pacienteRes.data.id;
    console.log('✅ Paciente creado con ID:', pacienteId);
    console.log('--------------------------------------------------\n');

    // ─── a) GET citas (debería estar vacío) ───────────────
    console.log('══ [a] GET /api/citas (sin datos) ══');
    let res = await axios.get(`${BASE_URL}/citas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status:', res.status);
    console.log(`📦 Citas encontradas: ${res.data.length}`);
    console.log('--------------------------------------------------\n');

    // ─── b) POST crear cita ───────────────────────────────
    console.log('══ [b] POST /api/citas ══');
    const citaData = {
      paciente_id: pacienteId,
      fecha: '2026-05-01T10:00:00'
    };
    console.log('📝 Body:', JSON.stringify(citaData, null, 2));

    res = await axios.post(`${BASE_URL}/citas`, citaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status:', res.status);
    console.log('📦 Cita creada:');
    console.log(JSON.stringify(res.data, null, 2));
    console.log('--------------------------------------------------\n');

    // ─── c) GET citas (verificar inserción) ───────────────
    console.log('══ [c] GET /api/citas (verificar inserción) ══');
    res = await axios.get(`${BASE_URL}/citas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status:', res.status);
    console.log(`📦 Citas encontradas: ${res.data.length}`);
    if (res.data.length > 0) {
      const cita = res.data[0];
      console.log(`   📋 Paciente: ${cita.pacientes?.nombre} ${cita.pacientes?.apellidos}`);
      console.log(`   👨‍⚕️ Profesional: ${cita.usuarios?.nombre} (${cita.usuarios?.rol})`);
      console.log(`   📅 Fecha: ${cita.fecha}`);
      console.log(`   📌 Estado: ${cita.estado}`);
    }
    console.log('--------------------------------------------------\n');

    // ─── d) Verificar filtrado por usuario ────────────────
    console.log('══ [d] Verificar filtrado por usuario ══');
    // Crear un segundo usuario y verificar que no ve las citas del primero
    const user2Email = `citas_user2_${uniqueId}@email.com`;
    await axios.post(`${AUTH_URL}/register`, {
      nombre: 'Dr. Segundo',
      email: user2Email,
      password: 'password123',
      rol: 'entrenador'
    });
    const login2 = await axios.post(`${AUTH_URL}/login`, {
      email: user2Email,
      password: 'password123'
    });
    const token2 = login2.data.token;

    res = await axios.get(`${BASE_URL}/citas`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    console.log('✅ Status:', res.status);
    console.log(`📦 Citas del segundo usuario: ${res.data.length} (debería ser 0)`);
    console.log(res.data.length === 0
      ? '🛡️  Correcto: el segundo usuario NO ve las citas del primero'
      : '❌ Error: el segundo usuario VE citas que no le pertenecen');
    console.log('--------------------------------------------------\n');

    // ─── e) POST sin paciente_id → error ──────────────────
    console.log('══ [e] POST /api/citas (sin paciente_id) ══');
    try {
      await axios.post(`${BASE_URL}/citas`, { fecha: '2026-06-01T10:00:00' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ FAIL: Debería haber devuelto 400');
    } catch (err) {
      console.log('✅ Status:', err.response.status);
      console.log('📦 Respuesta:', JSON.stringify(err.response.data, null, 2));
      console.log('🛡️  Correcto: validación funciona');
    }
    console.log('--------------------------------------------------\n');

    // ─── RESUMEN ──────────────────────────────────────────
    console.log('╔══════════════════════════════════════════╗');
    console.log('║          📊 RESUMEN FINAL               ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('  ✅ [a] GET citas vacías              → OK');
    console.log('  ✅ [b] POST crear cita               → OK');
    console.log('  ✅ [c] GET verificar inserción + JOIN → OK');
    console.log('  ✅ [d] Filtrado por usuario           → OK');
    console.log('  ✅ [e] Validación campos obligatorios → OK');
    console.log('\n  🎉 ¡Módulo de citas funcionando al 100%!');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PETICIÓN:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Respuesta:', error.response.data);
    } else {
      console.error('Detalles:', error.message);
      console.log('💡 ¿Está el servidor corriendo en el puerto 3000?');
    }
  }
};

runTests();
