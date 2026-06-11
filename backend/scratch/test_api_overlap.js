const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function main() {
  try {
    const uniqueId = Date.now();
    
    // 1. Registrar usuario 1
    const u1Email = `u1_${uniqueId}@test.com`;
    await axios.post(`${BASE_URL}/auth/register`, {
      nombre: 'Prof1',
      email: u1Email,
      password: 'password123',
      rol: 'admin',
      tipo: 'fisio'
    });
    
    const login1Res = await axios.post(`${BASE_URL}/auth/login`, {
      email: u1Email,
      password: 'password123'
    });
    const token1 = login1Res.data.token;
    const user1Id = login1Res.data.usuario.id;

    // 2. Registrar usuario 2
    const u2Email = `u2_${uniqueId}@test.com`;
    const reg2 = await axios.post(`${BASE_URL}/auth/register`, {
      nombre: 'Prof2',
      email: u2Email,
      password: 'password123',
      rol: 'admin',
      tipo: 'entrenador'
    });
    // Necesitamos el ID del usuario 2. Podemos iniciar sesión para obtenerlo
    const login2Res = await axios.post(`${BASE_URL}/auth/login`, {
      email: u2Email,
      password: 'password123'
    });
    const token2 = login2Res.data.token;
    const user2Id = login2Res.data.usuario.id;

    // 3. Crear paciente 1
    const p1Res = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Pac1',
      apellidos: 'Test',
      email: `p1_${uniqueId}@test.com`
    }, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const p1Id = p1Res.data[0].id;

    // 4. Crear paciente 2
    const p2Res = await axios.post(`${BASE_URL}/pacientes`, {
      nombre: 'Pac2',
      apellidos: 'Test',
      email: `p2_${uniqueId}@test.com`
    }, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const p2Id = p2Res.data[0].id;

    const fecha = '2026-06-08T17:00:00';

    console.log('Creando cita 1 con Prof1 y Pac1 a las 17:00...');
    const cita1 = await axios.post(`${BASE_URL}/citas`, {
      paciente_id: p1Id,
      usuario_id: user1Id,
      fecha: fecha,
      estado: 'pendiente'
    }, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    console.log('Cita 1 creada:', cita1.data.id);

    console.log('Creando cita 2 con Prof2 y Pac2 a las 17:00 (mismo horario, distinto prof y pac)...');
    const cita2 = await axios.post(`${BASE_URL}/citas`, {
      paciente_id: p2Id,
      usuario_id: user2Id,
      fecha: fecha,
      estado: 'pendiente'
    }, {
      headers: { Authorization: `Bearer ${token1}` } // Usamos token1 (puede ser superadmin o admin, el RLS permite ver/crear)
    });
    console.log('Cita 2 creada con éxito:', cita2.data.id);

  } catch (err) {
    console.error('ERROR AL CREAR CITAS A TRAVES DE LA API:', err.response?.data || err.message);
  }
}

main();
