const { pool } = require('../config/db');
const { runInUserContext } = require('../config/dbUtils');

/**
 * SISTEMA DE RESUMEN CLÍNICO DETERMINISTA (Rule-Based)
 * 
 * Este sistema genera resúmenes automáticos basados en reglas lógicas y métricas reales.
 * - NO depende de IA externa (Gemini/OpenAI).
 * - Garantiza estabilidad total, coste cero y privacidad de datos.
 * - Genera un texto coherente y profesional mediante plantillas dinámicas.
 */

// --- Lógica de Procesamiento de Texto (Heurística) ---

const detectarZonaAfectada = (historial) => {
  const zonas = ["rodilla", "espalda", "hombro", "tobillo", "codo", "cadera", "cuello", "lumbar"];
  const textoCompleto = historial.map(h => h.descripcion.toLowerCase()).join(" ");
  
  for (const zona of zonas) {
    if (textoCompleto.includes(zona)) return zona;
  }
  return "la zona afectada";
};

const detectarEvolucionTexto = (historial) => {
  const texto = historial.map(h => h.descripcion.toLowerCase()).join(" ");
  const pos = ["mejora", "recuperación", "progres", "positivo", "favorable"];
  const neg = ["empeora", "recaída", "dolor intenso", "estancado", "negativo"];

  if (neg.some(palabra => texto.includes(palabra))) return "con algunas complicaciones o estancamiento";
  if (pos.some(palabra => texto.includes(palabra))) return "favorable y con progresión positiva";
  return "estable, siguiendo el plan previsto";
};

const construirResumenReglas = (paciente, historial, metricas) => {
  const zona = detectarZonaAfectada(historial);
  const evolucion = detectarEvolucionTexto(historial);
  
  // 1. Motivo/Descripción inicial (basado en la última observación o palabras clave)
  const motivoIntro = historial.length > 0 
    ? `El paciente acude para el tratamiento de ${zona}, según lo registrado en su historial clínico.`
    : `El paciente se encuentra en seguimiento clínico regular.`;

  // 2. Evolución
  const evolucionTexto = `Se observa una evolución ${evolucion} durante el periodo de tratamiento.`;

  // 3. Estado actual (basado en métricas)
  let estadoDolor = "Presenta niveles de dolor controlados.";
  if (metricas.promedio_dolor > 6) estadoDolor = "Actualmente presenta niveles elevados de dolor que requieren atención.";
  else if (metricas.promedio_dolor > 3) estadoDolor = "Refiere molestias moderadas en las últimas sesiones.";

  const estadoActual = `${estadoDolor} El esfuerzo promedio reportado es de ${metricas.promedio_esfuerzo}/10.`;

  // 4. Adherencia
  const adherencia = `Ha realizado un total de ${metricas.sesiones_totales} sesiones de entrenamiento hasta la fecha.`;

  // 5. Valoración inicial como puntos clave
  let puntosClaveTexto = '';
  if (paciente.valoracion_inicial && paciente.valoracion_inicial.trim().length > 0) {
    puntosClaveTexto = `\n\nVALORACIÓN INICIAL:\n${paciente.valoracion_inicial.trim()}`;
  }

  // Combinación final
  return `${motivoIntro} ${evolucionTexto} ${estadoActual} ${adherencia}${puntosClaveTexto}`;
};


// --- Funciones Auxiliares de Datos (RLS Compliant) ---

const fetchDatosPaciente = async (client, paciente_id) => {
  const query = 'SELECT nombre, apellidos, valoracion_inicial FROM pacientes WHERE id = $1';
  const res = await client.query(query, [paciente_id]);
  return res.rows[0];
};

const fetchHistorial = async (client, paciente_id) => {
  const query = 'SELECT descripcion, fecha FROM historial_clinico WHERE paciente_id = $1 ORDER BY fecha DESC LIMIT 5';
  const res = await client.query(query, [paciente_id]);
  return res.rows;
};

const fetchMetricasEntrenamiento = async (client, paciente_id) => {
  const resEntrenos = await client.query('SELECT id FROM entrenamientos WHERE paciente_id = $1', [paciente_id]);
  const entrenamientoIds = resEntrenos.rows.map(e => e.id);
  const sesiones_totales = entrenamientoIds.length;

  if (sesiones_totales === 0) {
    return { sesiones_totales: 0, promedio_dolor: 0, promedio_esfuerzo: 0, seguimientos: [] };
  }

  const querySegs = 'SELECT dolor, esfuerzo, comentarios FROM seguimiento WHERE entrenamiento_id = ANY($1)';
  const resSegs = await client.query(querySegs, [entrenamientoIds]);
  const seguimientos = resSegs.rows;

  let promedio_dolor = 0;
  let promedio_esfuerzo = 0;

  if (seguimientos.length > 0) {
    const sumaDolor = seguimientos.reduce((acc, curr) => acc + (curr.dolor || 0), 0);
    const sumaEsfuerzo = seguimientos.reduce((acc, curr) => acc + (curr.esfuerzo || 0), 0);
    promedio_dolor = parseFloat((sumaDolor / seguimientos.length).toFixed(1));
    promedio_esfuerzo = parseFloat((sumaEsfuerzo / seguimientos.length).toFixed(1));
  }

  return { sesiones_totales, promedio_dolor, promedio_esfuerzo, seguimientos };
};

// --- Controlador Principal ---

const getResumenPacienteIA = async (req, res) => {
  try {
    const { paciente_id } = req.params;

    if (!paciente_id) {
      return res.status(400).json({ error: 'Se requiere el ID del paciente' });
    }

    // Ejecutar en contexto de usuario para respetar RLS
    const data = await runInUserContext(req.user, async (client) => {
      const paciente = await fetchDatosPaciente(client, paciente_id);
      if (!paciente) return null;

      const historial = await fetchHistorial(client, paciente_id);
      const metricas = await fetchMetricasEntrenamiento(client, paciente_id);

      return { paciente, historial, metricas };
    });

    if (!data) {
      return res.status(404).json({ error: 'Paciente no encontrado o acceso denegado' });
    }

    // GENERACIÓN DETERMINISTA (Reemplaza a la IA)
    const resumenFinal = construirResumenReglas(data.paciente, data.historial, data.metricas);

    return res.status(200).json({
      paciente: data.paciente,
      resumen: resumenFinal,
      metricas: {
        promedio_dolor: data.metricas.promedio_dolor,
        promedio_esfuerzo: data.metricas.promedio_esfuerzo,
        sesiones_totales: data.metricas.sesiones_totales
      }
    });

  } catch (err) {
    console.error('❌ Error en generación de resumen:', err);
    return res.status(500).json({ error: 'Error interno al generar el resumen clínico' });
  }
};

/**
 * NOTA PARA FUTURO:
 * Si se desea volver a usar IA (Gemini/OpenAI), se puede re-integrar la función
 * llamarIA(prompt) en este controlador. La estructura de datos ya está preparada.
 */

module.exports = {
  getResumenPacienteIA
};
