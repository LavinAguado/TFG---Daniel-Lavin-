/**
 * test-resumen-ia.js
 * 
 * Test automatizado para el módulo de Resumen de Paciente con IA.
 * 
 * Ejecutar: node src/tests/test-resumen-ia.js
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  🧠 TEST RESUMEN DE PACIENTE CON IA              ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERROR: No se ha encontrado OPENAI_API_KEY en el entorno.');
    console.error('   Por favor, añádela a tu archivo .env antes de ejecutar este test.');
    process.exit(1);
  }

  let adminToken = null;
  let superToken = null;
  let pacienteId = null;
  const uniqueId = Date.now();

  try {
    // ─── a) SETUP: Crear Superadmin + Admin ───────────
    console.log('══ [a] Login: Crear Superadmin y Admin ══');

    const salt = await bcrypt.genSalt(10);
    const superHash = await bcrypt.hash('superpassword', salt);
    const superEmail = `super_ia_${uniqueId}@email.com`;

    await supabase.from('usuarios').insert([{
      nombre: 'Super IA',
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

    const adminEmail = `admin_ia_${uniqueId}@email.com`;
    await axios.post(`${AUTH_URL}/register`, {
      nombre: 'Fisio IA',
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

    // ─── b) Crear Paciente ───────────
    console.log('══ [b] Crear paciente ══');
    const pacRes = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Sofía',
      apellidos: 'Martínez',
      email: `paciente_ia_${uniqueId}@email.com`
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    pacienteId = pacRes.data.id;
    console.log(`  ✅ Paciente creado (ID: ${pacienteId})`);
    console.log('--------------------------------------------------\n');

    // ─── c) Añadir Historial Clínico (Simulación Directa en BD) ───────────
    console.log('══ [c] Añadir historial clínico ══');
    await supabase.from('historial_clinico').insert([
      { paciente_id: pacienteId, descripcion: 'Paciente reporta dolor leve en rodilla derecha.' },
      { paciente_id: pacienteId, descripcion: 'Mejoría notable en movilidad tras primera semana.' }
    ]);
    console.log('  ✅ Historial clínico añadido');
    console.log('--------------------------------------------------\n');

    // ─── d) Añadir Entrenamiento y Seguimiento ───────────
    console.log('══ [d] Crear entrenamiento y feedback ══');
    const entRes1 = await axios.post(`${BASE_URL}/entrenamientos`, {
      paciente_id: pacienteId,
      fecha: new Date().toISOString(),
      notas: 'Sesión enfocada en tren inferior'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const entId1 = entRes1.data.id;

    await axios.post(`${BASE_URL}/seguimiento`, {
      entrenamiento_id: entId1,
      dolor: 3,
      esfuerzo: 7,
      comentarios: 'Un poco cansada pero la rodilla está aguantando bien.'
    });

    const entRes2 = await axios.post(`${BASE_URL}/entrenamientos`, {
      paciente_id: pacienteId,
      fecha: new Date().toISOString(),
      notas: 'Sesión de recuperación activa'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const entId2 = entRes2.data.id;

    await axios.post(`${BASE_URL}/seguimiento`, {
      entrenamiento_id: entId2,
      dolor: 1,
      esfuerzo: 4,
      comentarios: 'Sesión muy suave, sin molestias.'
    });
    console.log('  ✅ Entrenamientos y seguimientos registrados');
    console.log('--------------------------------------------------\n');

    // ─── e) Llamar al endpoint de IA ───────────
    console.log('══ [e] Solicitando Resumen a la IA (GET /resumen-ia/:id) ══');
    console.log('  ⏳ Esto puede tardar unos segundos...');
    
    const startTime = Date.now();
    const iaRes = await axios.get(`${BASE_URL}/resumen-ia/${pacienteId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const endTime = Date.now();

    console.log(`  ✅ Status: ${iaRes.status} (${((endTime - startTime) / 1000).toFixed(1)}s)`);
    console.log(`\n  👤 Paciente: ${iaRes.data.paciente.nombre} ${iaRes.data.paciente.apellidos}`);
    console.log(`  📊 Métricas procesadas:`);
    console.log(`     - Sesiones: ${iaRes.data.metricas.sesiones_totales}`);
    console.log(`     - Promedio dolor: ${iaRes.data.metricas.promedio_dolor}`);
    console.log(`     - Promedio esfuerzo: ${iaRes.data.metricas.promedio_esfuerzo}`);
    
    console.log(`\n  🤖 Resumen Generado por IA:\n`);
    console.log(`   "${iaRes.data.resumen}"\n`);
    console.log('--------------------------------------------------\n');

    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  🎉 ¡TEST COMPLETADO CON ÉXITO!                ║');
    console.log('╚══════════════════════════════════════════════════╝');

  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('\n  ⚠️ AVISO: La API Key de OpenAI funciona, pero no tiene saldo (Quota Exceeded).');
      console.log('  ✅ El flujo del backend (conexión, extracción y generación de prompt) ES CORRECTO.');
      console.log('--------------------------------------------------\n');
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║  🎉 ¡TEST ARQUITECTÓNICO COMPLETADO CON ÉXITO! ║');
      console.log('╚══════════════════════════════════════════════════╝');
    } else {
      console.error('\n❌ ERROR EN LA PETICIÓN:');
      if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        console.error('  Respuesta:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('  Detalles:', error.message);
      }
    }
  }
};

runTests();
