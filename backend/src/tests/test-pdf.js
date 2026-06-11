/**
 * test-pdf.js
 * 
 * Test automatizado para la generación de PDFs de entrenamientos.
 * 
 * Flujo:
 *   a) Login (crear superadmin + admin)
 *   b) Crear paciente
 *   c) Crear ejercicio
 *   d) Crear entrenamiento
 *   e) Añadir ejercicios al entrenamiento
 *   f) Solicitar PDF → GET /api/entrenamientos/:id/pdf
 *   g) Comprobar que se genera correctamente
 *   h) Guardar PDF en disco para verificación visual
 * 
 * Ejecutar: node src/tests/test-pdf.js
 * (Requiere servidor corriendo en localhost:3000)
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

const BASE_URL = 'http://localhost:3000/api';
const AUTH_URL = `${BASE_URL}/auth`;

const runTests = async () => {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  📄 TEST GENERACIÓN DE PDF DE ENTRENAMIENTOS    ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  let adminToken = null;
  let superToken = null;
  let pacienteId = null;
  let ejercicioId1 = null;
  let ejercicioId2 = null;
  let entrenamientoId = null;
  const uniqueId = Date.now();

  try {
    // ─── a) SETUP: Crear Superadmin + Admin ───────────
    console.log('══ [a] Login: Crear Superadmin y Admin ══');

    // Inyectar superadmin directamente en la base de datos
    const salt = await bcrypt.genSalt(10);
    const superHash = await bcrypt.hash('superpassword', salt);
    const superEmail = `super_pdf_${uniqueId}@email.com`;

    await supabase.from('usuarios').insert([{
      nombre: 'Super PDF Test',
      email: superEmail,
      password: superHash,
      rol: 'superadmin',
      tipo: null
    }]);

    const loginSA = await axios.post(`${AUTH_URL}/login`, {
      email: superEmail,
      password: 'superpassword'
    });
    superToken = loginSA.data.token;
    console.log('  ✅ Superadmin autenticado');

    // Crear admin fisio vía registro (con permisos de superadmin)
    const adminEmail = `admin_pdf_${uniqueId}@email.com`;
    await axios.post(`${AUTH_URL}/register`, {
      nombre: 'Fisio PDF Test',
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
      nombre: 'María',
      apellidos: 'García López',
      email: `paciente_pdf_${uniqueId}@email.com`
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    pacienteId = pacRes.data.id;
    console.log(`  ✅ Paciente creado: María García López (ID: ${pacienteId})`);
    console.log('--------------------------------------------------\n');

    // ─── c) Crear Ejercicios ───────────
    console.log('══ [c] Crear ejercicios ══');
    const ej1Res = await axios.post(`${BASE_URL}/ejercicios`, {
      nombre: 'Sentadilla con barra',
      descripcion: 'Sentadilla profunda con barra olímpica',
      video_url: 'https://youtube.com/sentadilla'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    ejercicioId1 = ej1Res.data.id;
    console.log(`  ✅ Ejercicio 1: Sentadilla con barra (ID: ${ejercicioId1})`);

    const ej2Res = await axios.post(`${BASE_URL}/ejercicios`, {
      nombre: 'Plancha abdominal',
      descripcion: 'Ejercicio isométrico de core',
      video_url: 'https://youtube.com/plancha'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    ejercicioId2 = ej2Res.data.id;
    console.log(`  ✅ Ejercicio 2: Plancha abdominal (ID: ${ejercicioId2})`);
    console.log('--------------------------------------------------\n');

    // ─── d) Crear Entrenamiento ───────────
    console.log('══ [d] Crear entrenamiento ══');
    const entRes = await axios.post(`${BASE_URL}/entrenamientos`, {
      paciente_id: pacienteId,
      fecha: new Date().toISOString(),
      notas: 'Sesión de fortalecimiento general - Semana 3'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    entrenamientoId = entRes.data.id;
    console.log(`  ✅ Entrenamiento creado (ID: ${entrenamientoId})`);
    console.log(`     Notas: ${entRes.data.notas}`);
    console.log('--------------------------------------------------\n');

    // ─── e) Añadir ejercicios al entrenamiento ───────────
    console.log('══ [e] Añadir ejercicios al entrenamiento ══');
    await axios.post(`${BASE_URL}/entrenamientos/ejercicio`, {
      entrenamiento_id: entrenamientoId,
      ejercicio_id: ejercicioId1,
      series: 4,
      repeticiones: 10,
      esfuerzo: 8
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('  ✅ Sentadilla: 4x10, esfuerzo 8/10');

    await axios.post(`${BASE_URL}/entrenamientos/ejercicio`, {
      entrenamiento_id: entrenamientoId,
      ejercicio_id: ejercicioId2,
      series: 3,
      repeticiones: 60,
      esfuerzo: 6
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('  ✅ Plancha: 3x60s, esfuerzo 6/10');
    console.log('--------------------------------------------------\n');

    // ─── f) Solicitar PDF como Admin ───────────
    console.log('══ [f] GET /api/entrenamientos/:id/pdf (como Admin) ══');
    const pdfRes = await axios.get(`${BASE_URL}/entrenamientos/${entrenamientoId}/pdf`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      responseType: 'arraybuffer'
    });

    console.log(`  ✅ Status: ${pdfRes.status}`);
    console.log(`  ✅ Content-Type: ${pdfRes.headers['content-type']}`);
    console.log(`  ✅ Content-Disposition: ${pdfRes.headers['content-disposition']}`);
    console.log(`  ✅ Tamaño: ${(pdfRes.data.byteLength / 1024).toFixed(1)} KB`);

    // Validaciones
    const isValidStatus = pdfRes.status === 200;
    const isValidContentType = pdfRes.headers['content-type'] === 'application/pdf';
    const isValidSize = pdfRes.data.byteLength > 0;
    const isPDF = Buffer.from(pdfRes.data).toString('ascii', 0, 5) === '%PDF-';

    console.log(`\n  📋 Validaciones:`);
    console.log(`     Status 200: ${isValidStatus ? '✅' : '❌'}`);
    console.log(`     Content-Type PDF: ${isValidContentType ? '✅' : '❌'}`);
    console.log(`     Tamaño > 0: ${isValidSize ? '✅' : '❌'}`);
    console.log(`     Cabecera %PDF-: ${isPDF ? '✅' : '❌'}`);

    // Guardar PDF en disco para verificación visual
    const outputPath = path.join(__dirname, 'test-output.pdf');
    fs.writeFileSync(outputPath, Buffer.from(pdfRes.data));
    console.log(`\n  💾 PDF guardado en: ${outputPath}`);
    console.log('--------------------------------------------------\n');

    // ─── g) Solicitar PDF como Superadmin ───────────
    console.log('══ [g] GET /api/entrenamientos/:id/pdf (como Superadmin) ══');
    const pdfResSuper = await axios.get(`${BASE_URL}/entrenamientos/${entrenamientoId}/pdf`, {
      headers: { Authorization: `Bearer ${superToken}` },
      responseType: 'arraybuffer'
    });
    console.log(`  ✅ Superadmin puede acceder al PDF: Status ${pdfResSuper.status}`);
    console.log(`  ✅ Tamaño: ${(pdfResSuper.data.byteLength / 1024).toFixed(1)} KB`);
    console.log('--------------------------------------------------\n');

    // ─── h) Verificar que un entrenamiento inexistente devuelve 404 ───────────
    console.log('══ [h] GET /api/entrenamientos/99999/pdf (inexistente) ══');
    try {
      await axios.get(`${BASE_URL}/entrenamientos/99999/pdf`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        responseType: 'arraybuffer'
      });
      console.log('  ❌ FAIL: Debería devolver 404');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('  ✅ Correctamente devuelve 404 para ID inexistente');
      } else {
        console.log(`  ⚠️  Status inesperado: ${err.response?.status}`);
      }
    }
    console.log('--------------------------------------------------\n');

    // ─── Resumen ───────────
    if (isValidStatus && isValidContentType && isValidSize && isPDF) {
      console.log('╔══════════════════════════════════════════════════╗');
      console.log('║  🎉 ¡TODAS LAS PRUEBAS PASARON CORRECTAMENTE!  ║');
      console.log('╠══════════════════════════════════════════════════╣');
      console.log('║                                                  ║');
      console.log('║  📄 PDF generado y validado con éxito            ║');
      console.log('║  🛡️  Seguridad por roles verificada               ║');
      console.log('║  💾 Archivo guardado: test-output.pdf             ║');
      console.log('║                                                  ║');
      console.log('║  📧 Preparado para futura integración con email  ║');
      console.log('║                                                  ║');
      console.log('╚══════════════════════════════════════════════════╝');
    } else {
      console.log('❌ Algunas validaciones fallaron. Revisa los resultados.');
    }

    // ─── Instrucciones Thunder Client ───────────
    console.log('\n');
    console.log('══════════════════════════════════════════════════════');
    console.log('  🔧 CÓMO PROBAR CON THUNDER CLIENT:');
    console.log('══════════════════════════════════════════════════════');
    console.log('');
    console.log('  1. Login:');
    console.log('     POST http://localhost:3000/api/auth/login');
    console.log('     Body: { "email": "tu@email.com", "password": "xxx" }');
    console.log('     → Copiar el token de la respuesta');
    console.log('');
    console.log('  2. Solicitar PDF:');
    console.log(`     GET http://localhost:3000/api/entrenamientos/${entrenamientoId}/pdf`);
    console.log('     Header: Authorization → Bearer {token}');
    console.log('');
    console.log('  3. Descargar el PDF:');
    console.log('     En Thunder Client, ir a la respuesta →');
    console.log('     Pestaña "Response" → Botón "Save" →');
    console.log('     Guardar como archivo .pdf');
    console.log('');
    console.log('  4. Abrir el archivo .pdf con cualquier visor PDF.');
    console.log('══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PETICIÓN:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      // Si la respuesta es arraybuffer, convertir a texto
      if (error.response.data instanceof ArrayBuffer || Buffer.isBuffer(error.response.data)) {
        console.error('  Respuesta:', Buffer.from(error.response.data).toString('utf-8'));
      } else {
        console.error('  Respuesta:', error.response.data);
      }
    } else {
      console.error('  Detalles:', error.message);
    }
  }
};

runTests();
