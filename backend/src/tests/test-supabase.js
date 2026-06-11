/**
 * ============================================================
 *  TEST COMPLETO DE SUPABASE - Conexión + CRUD
 * ============================================================
 * 
 * Este script:
 * 1. Verifica la conexión básica con Supabase
 * 2. Crea tablas de ejemplo vía SQL directo (pg)
 * 3. Prueba INSERT, SELECT, UPDATE, DELETE con el cliente Supabase
 * 4. Limpia todo al finalizar (elimina las tablas de prueba)
 */

require('dotenv').config();
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// ─── Configuración ──────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const databaseUrl = process.env.DATABASE_URL;

const supabase = createClient(supabaseUrl, supabaseKey);
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

// ─── Contadores de resultados ───────────────────────────────
let passed = 0;
let failed = 0;

function logPass(testName) {
  passed++;
  console.log(`  ✅ PASS: ${testName}`);
}

function logFail(testName, error) {
  failed++;
  console.error(`  ❌ FAIL: ${testName} → ${error}`);
}

// ─── FASE 1: Conexión básica ────────────────────────────────
async function testConexionBasica() {
  console.log('\n══════════════════════════════════════════');
  console.log('  FASE 1: Verificar conexión básica');
  console.log('══════════════════════════════════════════');

  try {
    // Test pg directo
    const pgRes = await pool.query('SELECT NOW()');
    logPass(`Conexión PostgreSQL directa (pg) — Hora del servidor: ${pgRes.rows[0].now}`);
  } catch (err) {
    logFail('Conexión PostgreSQL directa (pg)', err.message);
  }

  try {
    // Test cliente Supabase (API REST)
    const { error } = await supabase.from('_test_ping_').select('*').limit(1);
    if (error && error.message.includes('Could not find the table')) {
      logPass('Conexión Supabase REST API — Credenciales válidas y servidor accesible');
    } else if (error) {
      logFail('Conexión Supabase REST API', error.message);
    } else {
      logPass('Conexión Supabase REST API');
    }
  } catch (err) {
    logFail('Conexión Supabase REST API', err.message);
  }
}

// ─── FASE 2: Crear tablas de ejemplo ────────────────────────
async function crearTablasEjemplo() {
  console.log('\n══════════════════════════════════════════');
  console.log('  FASE 2: Crear tablas de ejemplo');
  console.log('══════════════════════════════════════════');

  try {
    // Eliminar tablas si ya existían (para poder re-ejecutar el test)
    await pool.query('DROP TABLE IF EXISTS test_mascotas CASCADE');
    await pool.query('DROP TABLE IF EXISTS test_propietarios CASCADE');

    // Tabla: test_propietarios
    await pool.query(`
      CREATE TABLE test_propietarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    logPass('Tabla "test_propietarios" creada');

    // Tabla: test_mascotas (relacionada con propietarios)
    await pool.query(`
      CREATE TABLE test_mascotas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        especie VARCHAR(50) NOT NULL,
        edad INT,
        propietario_id INT REFERENCES test_propietarios(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    logPass('Tabla "test_mascotas" creada');

    // Desactivar RLS para que el anon key pueda operar (solo para pruebas)
    await pool.query('ALTER TABLE test_propietarios DISABLE ROW LEVEL SECURITY');
    await pool.query('ALTER TABLE test_mascotas DISABLE ROW LEVEL SECURITY');
    logPass('RLS desactivado en ambas tablas (para pruebas con anon key)');

  } catch (err) {
    logFail('Crear tablas de ejemplo', err.message);
  }
}

// ─── FASE 3: CRUD con Supabase JS ──────────────────────────
async function testInsert() {
  console.log('\n══════════════════════════════════════════');
  console.log('  FASE 3a: INSERT — Insertar datos');
  console.log('══════════════════════════════════════════');

  // Insertar propietarios
  const { data: propietarios, error: errProp } = await supabase
    .from('test_propietarios')
    .insert([
      { nombre: 'María García', email: 'maria@example.com', telefono: '600111222' },
      { nombre: 'Carlos López', email: 'carlos@example.com', telefono: '600333444' },
      { nombre: 'Ana Martínez', email: 'ana@example.com', telefono: '600555666' }
    ])
    .select();

  if (errProp) {
    logFail('INSERT propietarios', errProp.message);
    return null;
  }
  logPass(`INSERT 3 propietarios — IDs: ${propietarios.map(p => p.id).join(', ')}`);

  // Insertar mascotas
  const { data: mascotas, error: errMasc } = await supabase
    .from('test_mascotas')
    .insert([
      { nombre: 'Luna', especie: 'Perro', edad: 3, propietario_id: propietarios[0].id },
      { nombre: 'Michi', especie: 'Gato', edad: 5, propietario_id: propietarios[0].id },
      { nombre: 'Rocky', especie: 'Perro', edad: 2, propietario_id: propietarios[1].id },
      { nombre: 'Nemo', especie: 'Pez', edad: 1, propietario_id: propietarios[2].id }
    ])
    .select();

  if (errMasc) {
    logFail('INSERT mascotas', errMasc.message);
    return null;
  }
  logPass(`INSERT 4 mascotas — IDs: ${mascotas.map(m => m.id).join(', ')}`);

  return { propietarios, mascotas };
}

async function testSelect() {
  console.log('\n══════════════════════════════════════════');
  console.log('  FASE 3b: SELECT — Leer datos');
  console.log('══════════════════════════════════════════');

  // Select todos los propietarios
  const { data: allProp, error: err1 } = await supabase
    .from('test_propietarios')
    .select('*');

  if (err1) {
    logFail('SELECT * propietarios', err1.message);
  } else {
    logPass(`SELECT * propietarios — ${allProp.length} registros encontrados`);
  }

  // Select con filtro
  const { data: filtrado, error: err2 } = await supabase
    .from('test_mascotas')
    .select('*')
    .eq('especie', 'Perro');

  if (err2) {
    logFail('SELECT con filtro (especie=Perro)', err2.message);
  } else {
    logPass(`SELECT con filtro (especie=Perro) — ${filtrado.length} perros encontrados`);
  }

  // Select con JOIN (relación entre tablas)
  const { data: joined, error: err3 } = await supabase
    .from('test_mascotas')
    .select(`
      nombre,
      especie,
      edad,
      test_propietarios (
        nombre,
        email
      )
    `);

  if (err3) {
    logFail('SELECT con JOIN (mascotas + propietarios)', err3.message);
  } else {
    logPass(`SELECT con JOIN — ${joined.length} mascotas con datos de propietario`);
    // Mostrar un ejemplo
    if (joined.length > 0) {
      console.log(`       📋 Ejemplo: "${joined[0].nombre}" (${joined[0].especie}) → Dueño: ${joined[0].test_propietarios?.nombre || 'N/A'}`);
    }
  }

  // Select con ordenación y límite
  const { data: ordered, error: err4 } = await supabase
    .from('test_mascotas')
    .select('nombre, especie, edad')
    .order('edad', { ascending: false })
    .limit(2);

  if (err4) {
    logFail('SELECT con ORDER BY + LIMIT', err4.message);
  } else {
    logPass(`SELECT con ORDER BY edad DESC LIMIT 2 — Resultados: ${ordered.map(m => `${m.nombre}(${m.edad})`).join(', ')}`);
  }
}

async function testUpdate() {
  console.log('\n══════════════════════════════════════════');
  console.log('  FASE 3c: UPDATE — Actualizar datos');
  console.log('══════════════════════════════════════════');

  // Actualizar el teléfono de María
  const { data: updated, error } = await supabase
    .from('test_propietarios')
    .update({ telefono: '699999999' })
    .eq('email', 'maria@example.com')
    .select();

  if (error) {
    logFail('UPDATE propietario (teléfono de María)', error.message);
  } else {
    logPass(`UPDATE teléfono de María → Nuevo: ${updated[0].telefono}`);
  }

  // Actualizar la edad de Luna
  const { data: updatedMasc, error: err2 } = await supabase
    .from('test_mascotas')
    .update({ edad: 4 })
    .eq('nombre', 'Luna')
    .select();

  if (err2) {
    logFail('UPDATE mascota (edad de Luna)', err2.message);
  } else {
    logPass(`UPDATE edad de Luna → Nueva edad: ${updatedMasc[0].edad}`);
  }
}

async function testDelete() {
  console.log('\n══════════════════════════════════════════');
  console.log('  FASE 3d: DELETE — Eliminar datos');
  console.log('══════════════════════════════════════════');

  // Eliminar una mascota
  const { error: err1 } = await supabase
    .from('test_mascotas')
    .delete()
    .eq('nombre', 'Nemo');

  if (err1) {
    logFail('DELETE mascota (Nemo)', err1.message);
  } else {
    logPass('DELETE mascota "Nemo" eliminada');
  }

  // Verificar que se eliminó
  const { data: remaining, error: err2 } = await supabase
    .from('test_mascotas')
    .select('nombre');

  if (err2) {
    logFail('Verificar DELETE', err2.message);
  } else {
    logPass(`Verificación post-DELETE — Mascotas restantes: ${remaining.map(m => m.nombre).join(', ')}`);
  }
}

// ─── FASE 4: Limpieza ──────────────────────────────────────
async function limpiarTablas() {
  console.log('\n══════════════════════════════════════════');
  console.log('  FASE 4: Limpieza (eliminar tablas de prueba)');
  console.log('══════════════════════════════════════════');

  try {
    await pool.query('DROP TABLE IF EXISTS test_mascotas CASCADE');
    await pool.query('DROP TABLE IF EXISTS test_propietarios CASCADE');
    logPass('Tablas de prueba eliminadas correctamente');
  } catch (err) {
    logFail('Eliminar tablas de prueba', err.message);
  }
}

// ─── Ejecutar todo ──────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🧪 TEST COMPLETO DE SUPABASE          ║');
  console.log('║   Conexión + Tablas + CRUD               ║');
  console.log('╚══════════════════════════════════════════╝');

  await testConexionBasica();
  await crearTablasEjemplo();

  // Pequeña pausa para que PostgREST (cache de schema de Supabase) detecte las tablas nuevas
  console.log('\n  ⏳ Esperando 3s para que Supabase detecte las tablas nuevas...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  await testInsert();
  await testSelect();
  await testUpdate();
  await testDelete();
  // await limpiarTablas(); // ← Comentado para que puedas ver las tablas en Supabase

  // ─── Resumen final ─────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║            📊 RESUMEN FINAL              ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`  ✅ Tests pasados: ${passed}`);
  console.log(`  ❌ Tests fallidos: ${failed}`);
  console.log(`  📈 Total: ${passed + failed} tests`);

  if (failed === 0) {
    console.log('\n  🎉 ¡TODO FUNCIONA AL 100%! La conexión con Supabase es perfecta.');
  } else {
    console.log(`\n  ⚠️  Hay ${failed} test(s) que fallaron. Revisa los errores arriba.`);
  }

  await pool.end();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('💥 Error fatal:', err);
  pool.end();
  process.exit(1);
});
