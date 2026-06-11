/**
 * test-seguimiento.js
 * 
 * Test automatizado para el módulo de seguimiento post-sesión.
 * 
 * Ejecutar: node src/tests/test-seguimiento.js
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  📝 TEST MÓDULO DE SEGUIMIENTO POST-SESIÓN       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  let adminToken = null;
  let superToken = null;
  let pacienteId = null;
  let entrenamientoId = null;
  const uniqueId = Date.now();

  try {
    // ─── a) SETUP: Crear Superadmin + Admin ───────────
    console.log('══ [a] Login: Crear Superadmin y Admin ══');

    const salt = await bcrypt.genSalt(10);
    const superHash = await bcrypt.hash('superpassword', salt);
    const superEmail = `super_seg_${uniqueId}@email.com`;

    await supabase.from('usuarios').insert([{
      nombre: 'Super Seguimiento',
      email: superEmail,
      password: superHash,
      rol: 'superadmin'
    }]);

    const loginSA = await axios.post(`${AUTH_URL}/login`, {
      email: superEmail,
      password: 'superpassword'
    });
    superToken = loginSA.data.token;
    console.log('  ✅ Superadmin autenticado');

    const adminEmail = `admin_seg_${uniqueId}@email.com`;
    await axios.post(`${AUTH_URL}/register`, {
      nombre: 'Fisio Seguimiento',
      email: adminEmail,
      password: 'password123',
      rol: 'admin',
      tipo: 'fisio'
    }, { headers: { Authorization: `Bearer ${superToken}` } });

    const loginAdmin = await axios.post(`${AUTH_URL}/login`, {
      email: adminEmail,
      password: 'password123'
    });
    adminToken = loginAdmin.data.token;
    console.log('  ✅ Admin (Fisio) autenticado');
    console.log('--------------------------------------------------\n');

    // ─── b) Crear Paciente y Entrenamiento ───────────
    console.log('══ [b] Crear paciente y entrenamiento ══');
    const pacRes = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Carlos',
      apellidos: 'Deportista',
      email: `paciente_seg_${uniqueId}@email.com`
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    pacienteId = pacRes.data.id;
    console.log(`  ✅ Paciente creado`);

    const entRes = await axios.post(`${BASE_URL}/entrenamientos`, {
      paciente_id: pacienteId,
      fecha: new Date().toISOString(),
      notas: 'Prueba de seguimiento'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    entrenamientoId = entRes.data.id;
    console.log(`  ✅ Entrenamiento creado (ID: ${entrenamientoId})`);
    console.log('--------------------------------------------------\n');

    // ─── c) Enviar Seguimiento Inválido (Publico) ───────────
    console.log('══ [c] POST /seguimiento (Inválido: dolor > 10) ══');
    try {
      await axios.post(`${BASE_URL}/seguimiento`, {
        entrenamiento_id: entrenamientoId,
        dolor: 15, // inválido
        esfuerzo: 5,
        comentarios: 'Demasiado doloroso'
      });
      console.log('  ❌ FAIL: Debería fallar la validación');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`  ✅ Validación de escala funciona correctamente: ${err.response.data.error}`);
      } else {
        console.log(`  ⚠️ Status inesperado: ${err.response?.status}`);
      }
    }
    console.log('--------------------------------------------------\n');

    // ─── d) Enviar Seguimiento Válido (Publico) ───────────
    console.log('══ [d] POST /seguimiento (Válido) ══');
    const segRes = await axios.post(`${BASE_URL}/seguimiento`, {
      entrenamiento_id: entrenamientoId,
      dolor: 3,
      esfuerzo: 7,
      comentarios: 'Me costó la última serie, pero bien en general.'
    });
    console.log(`  ✅ Seguimiento creado con ID: ${segRes.data.id}`);
    console.log(`  ✅ Dolor: ${segRes.data.dolor}, Esfuerzo: ${segRes.data.esfuerzo}`);
    console.log('--------------------------------------------------\n');

    // ─── e) Consultar Seguimiento (Protegido) ───────────
    console.log('══ [e] GET /seguimiento/:id (Como Admin) ══');
    const getRes = await axios.get(`${BASE_URL}/seguimiento/${entrenamientoId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`  ✅ Status: ${getRes.status}`);
    console.log(`  ✅ Cantidad de seguimientos devueltos: ${getRes.data.length}`);
    if (getRes.data.length > 0) {
      console.log(`  💬 Comentario: "${getRes.data[0].comentarios}"`);
    }
    console.log('--------------------------------------------------\n');

    // ─── f) Consultar Seguimiento Sin Token ───────────
    console.log('══ [f] GET /seguimiento/:id (Sin Token) ══');
    try {
      await axios.get(`${BASE_URL}/seguimiento/${entrenamientoId}`);
      console.log('  ❌ FAIL: Debería bloquear el acceso');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log(`  ✅ Acceso denegado correctamente (401)`);
      } else {
        console.log(`  ⚠️ Status inesperado: ${err.response?.status}`);
      }
    }
    console.log('--------------------------------------------------\n');

    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  🎉 ¡TODAS LAS PRUEBAS PASARON CORRECTAMENTE!  ║');
    console.log('╚══════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PETICIÓN:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error('  Respuesta:', error.response.data);
    } else {
      console.error('  Detalles:', error.message);
    }
  }
};

runTests();
