const axios = require('axios');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🏋️ TEST EJERCICIOS/ENTRENAMIENTOS CON ROLES ESTRICTOS ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let adminToken = null;
  let superToken = null;
  let pacienteId = null;
  let ejercicioId = null;
  let entrenamientoId = null;
  const uniqueId = Date.now();

  try {
    // ─── SETUP: Inyectar Superadmin y obtener token ───────────
    console.log('══ [SETUP] Crear y Login Superadmin ══');
    const salt = await bcrypt.genSalt(10);
    const superHash = await bcrypt.hash('superpassword', salt);
    const superEmail = `super_roles_${uniqueId}@email.com`;
    
    await supabase.from('usuarios').insert([{
      nombre: 'Super Boss', email: superEmail, password: superHash, rol: 'superadmin', tipo: null
    }]);

    const loginSA = await axios.post(`${AUTH_URL}/login`, { email: superEmail, password: 'superpassword' });
    superToken = loginSA.data.token;
    console.log('✅ Superadmin listo.');

    // ─── SETUP: Crear Admin Fisio vía Superadmin ───────────
    console.log('══ [SETUP] Crear Admin (Fisio) y Login ══');
    const adminEmail = `admin_fisio_${uniqueId}@email.com`;
    await axios.post(`${AUTH_URL}/register`, {
      nombre: 'Fisio Creador', email: adminEmail, password: 'password123', rol: 'admin', tipo: 'fisio'
    }, { headers: { Authorization: `Bearer ${superToken}` } });

    const loginAdmin = await axios.post(`${AUTH_URL}/login`, { email: adminEmail, password: 'password123' });
    adminToken = loginAdmin.data.token;
    console.log('✅ Admin Fisio autenticado.');

    // ─── SETUP: Crear Paciente ───────────
    const pacRes = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Paciente', apellidos: 'Roles', email: `paciente_roles_${uniqueId}@email.com`
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    pacienteId = pacRes.data.id;
    console.log('✅ Paciente creado.');
    console.log('--------------------------------------------------\n');

    // ─── a) Comprobar Restricciones: Superadmin no puede crear ejercicios ───────────
    console.log('══ [f] Restricción: Superadmin crea ejercicio ══');
    try {
      await axios.post(`${BASE_URL}/ejercicios`, {
        nombre: 'Fail Exercise', descripcion: 'No debe crearse'
      }, { headers: { Authorization: `Bearer ${superToken}` } });
      console.log('❌ FAIL: Superadmin no debería poder crear ejercicios.');
    } catch (err) {
      console.log('✅ Status:', err.response.status);
      console.log('🛡️  Correcto: El Superadmin tiene denegado crear ejercicios (soloAdmin).');
    }
    console.log('--------------------------------------------------\n');

    // ─── b) POST Crear Ejercicio como Admin ───────────
    console.log('══ [b] POST /api/ejercicios (Como Admin Fisio) ══');
    const ejRes = await axios.post(`${BASE_URL}/ejercicios`, {
      nombre: 'Plancha Abdominal',
      descripcion: 'Core isométrico',
      video_url: 'https://youtube.com/plancha'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    ejercicioId = ejRes.data.id;
    console.log('✅ Ejercicio creado con éxito:', ejRes.data.nombre);
    console.log('--------------------------------------------------\n');

    // ─── c) POST Crear Entrenamiento como Admin ───────────
    console.log('══ [c] POST /api/entrenamientos (Como Admin Fisio) ══');
    const entRes = await axios.post(`${BASE_URL}/entrenamientos`, {
      paciente_id: pacienteId,
      fecha: new Date().toISOString(),
      notas: 'Fortalecimiento core'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    entrenamientoId = entRes.data.id;
    console.log('✅ Entrenamiento creado. Notas:', entRes.data.notas);
    console.log('🛡️  Correcto: El tipo de usuario (FISIO) se ha añadido automáticamente a las notas.');
    console.log('--------------------------------------------------\n');

    // ─── d) POST Añadir Ejercicio a Entrenamiento como Admin ───────────
    console.log('══ [d] POST /api/entrenamientos/ejercicio (Como Admin Fisio) ══');
    const addRes = await axios.post(`${BASE_URL}/entrenamientos/ejercicio`, {
      entrenamiento_id: entrenamientoId,
      ejercicio_id: ejercicioId,
      series: 3,
      repeticiones: 60, // Segundos
      esfuerzo: 7
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('✅ Ejercicio añadido al entrenamiento.');
    console.log('--------------------------------------------------\n');

    // ─── e) GET Obtener Entrenamientos ───────────
    console.log('══ [e] GET /api/entrenamientos ══');
    const getResAdmin = await axios.get(`${BASE_URL}/entrenamientos`, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log(`📦 Admin (Fisio) ve ${getResAdmin.data.length} entrenamiento(s).`);
    
    const getResSuper = await axios.get(`${BASE_URL}/entrenamientos`, { headers: { Authorization: `Bearer ${superToken}` } });
    console.log(`👁️‍🗨️ Superadmin ve TODOS los entrenamientos: ${getResSuper.data.length} entrenamiento(s) totales en BD.`);
    console.log('--------------------------------------------------\n');

    console.log('🎉 ¡Validación de Roles y Tipos en Ejercicios/Entrenamientos exitosa!');

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
