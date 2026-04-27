const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  📁 TEST GESTIÓN DE ARCHIVOS DE PACIENTES       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  let adminToken = null;
  let pacienteId = null;
  const uniqueId = Date.now();

  try {
    // 1. Setup: Obtener token de admin
    console.log('══ [1] Login Admin ══');
    const bcrypt = require('bcryptjs');
    const adminEmail = `admin_test_${uniqueId}@email.com`;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    // Crear admin directamente en BD
    await supabase.from('usuarios').insert([{
      nombre: 'Admin Test Archivos',
      email: adminEmail,
      password: hash,
      rol: 'admin',
      tipo: 'fisio'
    }]);

    try {
      const loginRes = await axios.post(`${AUTH_URL}/login`, {
        email: adminEmail,
        password: 'password123'
      });
      adminToken = loginRes.data.token;
    } catch (e) {
      return console.error('❌ No se pudo obtener un token de administrador para el test.');
    }
    console.log('  ✅ Admin autenticado');

    // 2. Crear un paciente de prueba
    console.log('\n══ [2] Crear paciente de prueba ══');
    const pacRes = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Carlos',
      apellidos: 'Prueba Archivos',
      email: `carlos_files_${uniqueId}@email.com`
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    pacienteId = pacRes.data.id;
    console.log(`  ✅ Paciente creado (ID: ${pacienteId})`);

    // 3. Subir un archivo
    console.log('\n══ [3] Subir archivo (POST /api/archivos/:id) ══');
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'Contenido de prueba para el sistema de gestión de archivos.');

    const form = new FormData();
    form.append('archivo', fs.createReadStream(testFilePath));

    const uploadRes = await axios.post(`${BASE_URL}/archivos/${pacienteId}`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${adminToken}`
      }
    });

    const archivoId = uploadRes.data.archivo.id;
    console.log(`  ✅ Archivo subido correctamente (ID: ${archivoId})`);
    console.log(`     Path en Storage: ${uploadRes.data.archivo.path}`);

    // 4. Listar archivos
    console.log('\n══ [4] Listar archivos del paciente ══');
    const listRes = await axios.get(`${BASE_URL}/archivos/${pacienteId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`  ✅ Se encontraron ${listRes.data.length} archivos.`);

    // 5. Obtener Signed URL
    console.log('\n══ [5] Obtener Signed URL (Acceso Seguro) ══');
    const signedRes = await axios.get(`${BASE_URL}/archivos/file/${archivoId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`  ✅ URL firmada generada con éxito.`);
    console.log(`     URL: ${signedRes.data.url.substring(0, 60)}...`);

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  🎉 ¡TODAS LAS PRUEBAS DE ARCHIVOS PASARON!     ║');
    console.log('╚══════════════════════════════════════════════════╝');

    // Limpieza
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error('  Respuesta:', error.response.data);
    } else {
      console.error('  Detalles:', error.message);
    }
  }
};

runTests();
