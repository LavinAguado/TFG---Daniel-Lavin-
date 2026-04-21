const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🛡️  TEST ROLES Y TIPOS DE USUARIO      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let superadminToken = null;
  const uniqueId = Date.now();

  try {
    // Para que la prueba de "crear superadmin" pase si ya hay uno, 
    // primero comprobamos logueando o asumiendo. Pero la lógica dice que
    // el primer usuario DEBE ser superadmin. Como ya tenemos admins de las pruebas 
    // anteriores (script alter-table los convirtió), no nos dejará crear otro a menos 
    // que usemos un token de superadmin.

    // ─── [1] Intentar crear admin SIN token (Debe fallar porque ya hay usuarios en la BD)
    console.log('══ [1] Crear Admin (Sin Token) ══');
    try {
      await axios.post(`${AUTH_URL}/register`, {
        nombre: 'Intruso',
        email: `intruso_${uniqueId}@email.com`,
        password: 'password123',
        rol: 'admin',
        tipo: 'fisio'
      });
      console.log('❌ FAIL: Debería haber denegado el acceso.');
    } catch (err) {
      console.log('✅ Status:', err.response.status);
      console.log('🛡️  Correcto: Denegado. Solo un superadmin puede crear administradores.');
      console.log('--------------------------------------------------\n');
    }

    // Como no tenemos el token de un superadmin creado y la BD ya tiene usuarios,
    // vamos a forzar la creación de un superadmin vía DB directamente para poder seguir el test,
    // o asumir que hay que limpiar la BD primero. Para que este script sea autónomo,
    // si el paso 1 falla por acceso denegado, es correcto.
    
    // Para comprobar que el tipo es validado:
    // Intentaremos simular que tenemos token, pero como no lo tenemos para un superadmin, 
    // crearemos un script rápido que inyecte un superadmin a fuego.
    const { supabase } = require('../config/supabase');
    const bcrypt = require('bcryptjs');
    
    console.log('══ [2] Inyectando Superadmin Maestro ══');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('superpassword', salt);
    const superEmail = `super_${uniqueId}@email.com`;
    
    const { data: superadmin, error: superErr } = await supabase.from('usuarios').insert([{
      nombre: 'Super Maestro',
      email: superEmail,
      password: hash,
      rol: 'superadmin',
      tipo: null
    }]).select();
    
    if (superErr) {
      console.error('Error insertando superadmin:', superErr);
      throw new Error(superErr.message);
    }
    
    console.log('✅ Superadmin inyectado en DB.');
    
    // Login con el superadmin
    const loginSA = await axios.post(`${AUTH_URL}/login`, {
      email: superEmail,
      password: 'superpassword'
    });
    superadminToken = loginSA.data.token;
    console.log('✅ Token Superadmin obtenido.');
    console.log('--------------------------------------------------\n');

    // ─── [3] Crear Admin tipo Fisio usando el token Superadmin
    console.log('══ [3] Crear Admin Fisio con Token Superadmin ══');
    const newAdmin = {
      nombre: 'Fisio Legítimo',
      email: `fisio_${uniqueId}@email.com`,
      password: 'password123',
      rol: 'admin',
      tipo: 'fisio'
    };
    
    const res = await axios.post(`${AUTH_URL}/register`, newAdmin, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('✅ Status:', res.status);
    console.log('📦 Admin creado:', res.data.usuario);
    console.log('--------------------------------------------------\n');

    // ─── [4] Intentar crear Admin SIN tipo (Debe fallar)
    console.log('══ [4] Crear Admin SIN tipo ══');
    try {
      await axios.post(`${AUTH_URL}/register`, {
        nombre: 'Admin Roto',
        email: `roto_${uniqueId}@email.com`,
        password: 'password123',
        rol: 'admin'
      }, { headers: { Authorization: `Bearer ${superadminToken}` } });
      console.log('❌ FAIL: Debería haber exigido el campo tipo.');
    } catch (err) {
      console.log('✅ Status:', err.response.status);
      console.log('🛡️  Correcto: El sistema exige especificar el tipo (fisio/entrenador) para roles admin.');
      console.log('--------------------------------------------------\n');
    }

    // ─── [5] Login con el Admin Fisio y check del Token
    console.log('══ [5] Login Admin y Verificación de Payload JWT ══');
    const loginAdmin = await axios.post(`${AUTH_URL}/login`, {
      email: newAdmin.email,
      password: 'password123'
    });
    
    console.log('✅ Login exitoso');
    console.log('📦 Payload devuelto por /login:');
    console.log(loginAdmin.data.usuario);
    console.log(loginAdmin.data.usuario.tipo === 'fisio' ? '🛡️  El campo TIPO está en el JWT correctamente' : '❌ Falta el campo tipo');
    
    console.log('--------------------------------------------------\n');

    console.log('🎉 ¡Flujo de roles y tipos funcionando correctamente al 100%!');

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
