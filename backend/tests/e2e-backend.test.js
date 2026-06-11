const axios = require('axios');
require('dotenv').config();

/**
 * THERA-TRACK E2E BACKEND TEST SUITE
 * 
 * Flujo completo: Login -> Paciente -> Cita -> Entrenamiento -> Seguimiento -> Resumen
 */

const API_URL = 'http://localhost:3000/api';
let token = '';
let testPacienteId = '';
let testEntrenamientoId = '';

const logger = {
  info: (msg) => console.log(`\x1b[34m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  step: (msg) => console.log(`\n\x1b[35m--- PASO: ${msg} ---\x1b[0m`)
};

const runTests = async () => {
  try {
    logger.info('Iniciando batería de pruebas E2E...');

    // 1. LOGIN
    logger.step('Autenticación');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@clinica.com',
      password: 'adminpassword'
    });
    token = loginRes.data.token;
    logger.success('Login exitoso. Token obtenido.');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. CREAR PACIENTE
    logger.step('Gestión de Pacientes');
    const pacienteRes = await axios.post(`${API_URL}/pacientes`, {
      nombre: 'TEST_E2E',
      apellidos: 'Robot Automatizado',
      email: `test_${Date.now()}@example.com`
    }, { headers });
    testPacienteId = pacienteRes.data[0].id;
    logger.success(`Paciente de prueba creado ID: ${testPacienteId}`);

    // 3. CREAR CITA
    logger.step('Gestión de Citas');
    const citaRes = await axios.post(`${API_URL}/citas`, {
      paciente_id: testPacienteId,
      fecha: new Date(Date.now() + 86400000).toISOString(), // Mañana
      motivo: 'Evaluación inicial E2E'
    }, { headers });
    logger.success('Cita programada correctamente.');

    // 4. CREAR ENTRENAMIENTO
    logger.step('Gestión de Entrenamientos');
    const entrenoRes = await axios.post(`${API_URL}/entrenamientos`, {
      paciente_id: testPacienteId,
      fecha: new Date().toISOString(),
      notas: 'Sesión de Recuperación E2E - Entrenamiento de prueba para validar flujo',
      ejercicios: [
        { nombre: 'Sentadilla', series: 3, repeticiones: 12, notas: 'Mantener espalda recta' },
        { nombre: 'Plancha', series: 3, repeticiones: 30, notas: 'Segundos' }
      ]
    }, { headers });

    testEntrenamientoId = entrenoRes.data.id;
    logger.success('Entrenamiento y ejercicios creados con éxito.');

    // 5. CREAR SEGUIMIENTO
    logger.step('Gestión de Seguimiento (Feedback)');
    await axios.post(`${API_URL}/seguimiento`, {
      entrenamiento_id: testEntrenamientoId,
      dolor: 2,
      esfuerzo: 4,
      comentarios: 'Mejoría notable en la movilidad de rodilla tras el entrenamiento.'
    }, { headers });
    logger.success('Seguimiento registrado.');

    // 6. GENERAR RESUMEN CLÍNICO
    logger.step('Sistema de Análisis (Resumen)');
    const resumenRes = await axios.get(`${API_URL}/resumen-ia/${testPacienteId}`, { headers });
    
    if (resumenRes.data.resumen) {
      logger.success('Resumen clínico generado correctamente.');
      console.log(`\n\x1b[33mCONTENIDO DEL RESUMEN:\x1b[0m\n"${resumenRes.data.resumen}"\n`);
    } else {
      throw new Error('El resumen devuelto está vacío');
    }

    // 7. VERIFICACIÓN DE ARCHIVOS (LISTADO)
    logger.step('Módulo de Archivos');
    const archivosRes = await axios.get(`${API_URL}/archivos/${testPacienteId}`, { headers });
    logger.success(`Listado de archivos consultado (Encontrados: ${archivosRes.data.length})`);

    logger.step('RESULTADO FINAL');
    logger.success('================================================');
    logger.success('   SISTEMA FUNCIONANDO CORRECTAMENTE (BACKEND)   ');
    logger.success('================================================');

  } catch (err) {
    logger.error('FALLO EN LAS PRUEBAS:');
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
};

runTests();
