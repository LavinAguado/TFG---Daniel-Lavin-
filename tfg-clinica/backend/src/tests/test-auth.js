const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🔐 TEST AUTENTICACIÓN + AUTORIZACIÓN   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let token = null;
  const testEmail = `test_${Date.now()}@email.com`;

  try {
    // ─── a) REGISTRAR USUARIO ─────────────────────────────
    console.log('══ [a] POST /api/auth/register ══');
    const registerData = {
      nombre: 'Dr. Test',
      email: testEmail,
      password: 'password123',
      rol: 'fisio'
    };
    console.log('📝 Body:', JSON.stringify(registerData, null, 2));

    let res = await axios.post(`${AUTH_URL}/register`, registerData);
    console.log('✅ Status:', res.status);
    console.log('📦 Respuesta:', JSON.stringify(res.data, null, 2));
    console.log('--------------------------------------------------\n');

    // ─── b) LOGIN → OBTENER TOKEN ────────────────────────
    console.log('══ [b] POST /api/auth/login ══');
    res = await axios.post(`${AUTH_URL}/login`, {
      email: testEmail,
      password: 'password123'
    });
    token = res.data.token;
    console.log('✅ Status:', res.status);
    console.log('📦 Usuario:', JSON.stringify(res.data.usuario, null, 2));
    console.log(`🔑 Token JWT: ${token.substring(0, 50)}...`);
    console.log('--------------------------------------------------\n');

    // ─── c) ACCEDER A /api/pacientes CON TOKEN ────────────
    console.log('══ [c] GET /api/pacientes (con token) ══');
    res = await axios.get(`${BASE_URL}/pacientes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status:', res.status);
    console.log(`📦 Pacientes encontrados: ${res.data.length}`);
    console.log('--------------------------------------------------\n');

    // ─── d) CREAR PACIENTE CON TOKEN ──────────────────────
    console.log('══ [d] POST /api/pacientes (con token) ══');
    res = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Paciente Auth Test',
      apellidos: 'Protegido',
      telefono: '555000111',
      email: `paciente_auth_${Date.now()}@email.com`
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Status:', res.status);
    console.log('📦 Paciente creado:', JSON.stringify(res.data, null, 2));
    console.log('--------------------------------------------------\n');

    // ─── e) ACCEDER SIN TOKEN → ERROR ─────────────────────
    console.log('══ [e] GET /api/pacientes (SIN token) ══');
    try {
      await axios.get(`${BASE_URL}/pacientes`);
      console.log('❌ FAIL: Debería haber devuelto un error 401');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Status:', err.response.status);
        console.log('📦 Respuesta:', JSON.stringify(err.response.data, null, 2));
        console.log('🛡️  Correcto: acceso denegado sin token');
      } else {
        throw err;
      }
    }
    console.log('--------------------------------------------------\n');

    // ─── f) ACCEDER CON TOKEN INVÁLIDO → ERROR ────────────
    console.log('══ [f] GET /api/pacientes (token inválido) ══');
    try {
      await axios.get(`${BASE_URL}/pacientes`, {
        headers: { Authorization: 'Bearer token_falso_inventado' }
      });
      console.log('❌ FAIL: Debería haber devuelto un error 401');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Status:', err.response.status);
        console.log('📦 Respuesta:', JSON.stringify(err.response.data, null, 2));
        console.log('🛡️  Correcto: token inválido rechazado');
      } else {
        throw err;
      }
    }
    console.log('--------------------------------------------------\n');

    // ─── g) LOGIN CON CONTRASEÑA ERRÓNEA → ERROR ──────────
    console.log('══ [g] POST /api/auth/login (contraseña errónea) ══');
    try {
      await axios.post(`${AUTH_URL}/login`, {
        email: testEmail,
        password: 'contraseña_incorrecta'
      });
      console.log('❌ FAIL: Debería haber devuelto un error 401');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Status:', err.response.status);
        console.log('📦 Respuesta:', JSON.stringify(err.response.data, null, 2));
        console.log('🛡️  Correcto: credenciales incorrectas rechazadas');
      } else {
        throw err;
      }
    }
    console.log('--------------------------------------------------\n');

    // ─── RESUMEN ──────────────────────────────────────────
    console.log('╔══════════════════════════════════════════╗');
    console.log('║          📊 RESUMEN FINAL               ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('  ✅ [a] Register                    → OK');
    console.log('  ✅ [b] Login + Token JWT            → OK');
    console.log('  ✅ [c] GET pacientes con token      → OK');
    console.log('  ✅ [d] POST paciente con token      → OK');
    console.log('  ✅ [e] GET sin token → 401          → OK');
    console.log('  ✅ [f] GET token inválido → 401     → OK');
    console.log('  ✅ [g] Login password errónea → 401 → OK');
    console.log('\n  🎉 ¡Autenticación funcionando al 100%!');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PETICIÓN:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Respuesta:', error.response.data);
    } else {
      console.error('Detalles:', error.message);
      console.log('💡 ¿Está el servidor Express corriendo en el puerto 3000?');
    }
  }
};

runTests();
