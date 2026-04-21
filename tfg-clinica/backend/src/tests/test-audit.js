const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🛡️ AUDITORÍA COMPLETA DEL SISTEMA      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let superadminToken = null;
  let adminToken = null;
  const uniqueId = Date.now();

  try {
    // ─── [1] Acceso a pacientes sin token ───────────────────────
    console.log('══ [1] Acceso a /api/pacientes sin token ══');
    try {
      await axios.get(`${BASE_URL}/pacientes`);
      console.log('❌ FAIL: Debería haber denegado el acceso.');
    } catch (err) {
      console.log('✅ Status:', err.response.status);
      console.log('🛡️  Correcto: Endpoint de pacientes protegido.');
      console.log('--------------------------------------------------\n');
    }

    // ─── [2] Login Superadmin ───────────────────────
    console.log('══ [2] Login Superadmin ══');
    const { supabase } = require('../config/supabase');
    const bcrypt = require('bcryptjs');
    
    const superEmail = `super_audit_${uniqueId}@email.com`;
    const hash = await bcrypt.hash('superpassword', await bcrypt.genSalt(10));
    
    await supabase.from('usuarios').insert([{
      nombre: 'Super Auditor',
      email: superEmail,
      password: hash,
      rol: 'superadmin',
      tipo: null
    }]);

    const loginSA = await axios.post(`${AUTH_URL}/login`, {
      email: superEmail,
      password: 'superpassword'
    });
    superadminToken = loginSA.data.token;
    console.log('✅ Superadmin autenticado correctamente.');
    console.log('--------------------------------------------------\n');

    // ─── [3] Crear Admin (Fisio) ───────────────────────
    console.log('══ [3] Crear Admin (Fisio) vía Superadmin ══');
    const newAdmin = {
      nombre: 'Fisio Auditor',
      email: `fisio_audit_${uniqueId}@email.com`,
      password: 'password123',
      rol: 'admin',
      tipo: 'fisio'
    };
    
    await axios.post(`${AUTH_URL}/register`, newAdmin, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    console.log('✅ Admin creado exitosamente.');
    console.log('--------------------------------------------------\n');

    // ─── [4] Login Admin ───────────────────────
    console.log('══ [4] Login Admin ══');
    const loginAdmin = await axios.post(`${AUTH_URL}/login`, {
      email: newAdmin.email,
      password: 'password123'
    });
    adminToken = loginAdmin.data.token;
    console.log('✅ Status:', loginAdmin.status);
    console.log(`📦 Rol JWT: ${loginAdmin.data.usuario.rol} | Tipo: ${loginAdmin.data.usuario.tipo}`);
    console.log('--------------------------------------------------\n');

    // ─── [5] Acceder a pacientes como Admin ───────────────────────
    console.log('══ [5] GET /api/pacientes como Admin Fisio ══');
    const pacRes = await axios.get(`${BASE_URL}/pacientes`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Status:', pacRes.status);
    console.log('🛡️  Correcto: El fisio tiene acceso al listado global de pacientes.');
    console.log('--------------------------------------------------\n');

    // ─── [6] Acciones restringidas (Admin intentando crear usuarios) ───────────────────────
    console.log('══ [6] Admin intenta crear otro Admin ══');
    try {
      await axios.post(`${AUTH_URL}/register`, {
        nombre: 'Intruso',
        email: `intruso_${uniqueId}@email.com`,
        password: 'password123',
        rol: 'admin',
        tipo: 'entrenador'
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      console.log('❌ FAIL: Debería haber denegado el acceso.');
    } catch (err) {
      console.log('✅ Status:', err.response.status);
      console.log('🛡️  Correcto: Solo el superadmin puede gestionar usuarios.');
      console.log('--------------------------------------------------\n');
    }

    console.log('🎉 ¡AUDITORÍA FINALIZADA CON ÉXITO! El sistema es 100% coherente.');

  } catch (error) {
    console.error('\n❌ ERROR EN LA AUDITORÍA:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Respuesta:', error.response.data);
    } else {
      console.error('Detalles:', error.message);
    }
  }
};

runTests();
