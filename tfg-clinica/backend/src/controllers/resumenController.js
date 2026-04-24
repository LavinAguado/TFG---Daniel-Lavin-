const { supabase } = require('../config/supabase');
const openai = require('../config/openai');

// IMPORTANTE:
// - Uso híbrido: El sistema procesa y extrae la lógica (promedios, métricas), y la IA solo se encarga de la redacción.
// - La IA solo genera texto: No tiene acceso a la DB ni a otros sistemas.
// - No sustituye el criterio clínico: El texto debe ser validado por un profesional.
// - FUTURO: Implementar RLS en Supabase para proteger a nivel de fila los datos leídos.

// --- Funciones Auxiliares ---

const fetchDatosPaciente = async (paciente_id) => {
  const { data: paciente } = await supabase
    .from('pacientes')
    .select('nombre, apellidos')
    .eq('id', paciente_id)
    .single();
  return paciente;
};

const fetchHistorial = async (paciente_id) => {
  const { data: historial } = await supabase
    .from('historial_clinico')
    .select('descripcion, fecha')
    .eq('paciente_id', paciente_id)
    .order('fecha', { ascending: false })
    .limit(5);
  return historial || [];
};

const fetchMetricasEntrenamiento = async (paciente_id) => {
  const { data: entrenamientos } = await supabase
    .from('entrenamientos')
    .select('id')
    .eq('paciente_id', paciente_id);

  const sesiones_totales = entrenamientos ? entrenamientos.length : 0;
  const entrenamientoIds = entrenamientos ? entrenamientos.map(e => e.id) : [];

  let seguimientos = [];
  if (entrenamientoIds.length > 0) {
    const { data: segs } = await supabase
      .from('seguimiento')
      .select('dolor, esfuerzo, comentarios')
      .in('entrenamiento_id', entrenamientoIds);
    if (segs) seguimientos = segs;
  }

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

const construirPrompt = (paciente, historial, metricas) => {
  const obsTexto = historial.length > 0
    ? historial.map(h => `- [${h.fecha}] ${h.descripcion}`).join('\n')
    : '- Sin observaciones recientes.';

  const comTexto = metricas.seguimientos
    .filter(s => s.comentarios)
    .slice(0, 3)
    .map(s => `- ${s.comentarios}`)
    .join('\n');

  return `
Eres un profesional sanitario.
Genera un resumen clínico breve y claro del paciente basándote estrictamente en los siguientes datos extraídos del sistema:

Paciente: ${paciente.nombre} ${paciente.apellidos}

Observaciones clínicas recientes:
${obsTexto}

Comentarios recientes:
${comTexto || '- Ninguno.'}

Métricas:
- Dolor promedio: ${metricas.promedio_dolor} / 10
- Esfuerzo promedio: ${metricas.promedio_esfuerzo} / 10
- Número de sesiones: ${metricas.sesiones_totales}

Instrucciones:
- Máximo 120 palabras.
- Lenguaje profesional y clínico.
- No inventar datos médicos ni patologías que no aparezcan arriba.
- Ser objetivo y claro.
  `.trim();
};

const llamarOpenAI = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Eres un asistente clínico estricto. Sintetizas datos en resúmenes profesionales." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 250
  });
  return response.choices[0].message.content;
};

// --- Controlador Principal ---

const getResumenPacienteIA = async (req, res) => {
  try {
    const { paciente_id } = req.params;

    if (!paciente_id) {
      return res.status(400).json({ error: 'Se requiere el ID del paciente' });
    }

    console.log(`🧠 [IA] Procesando resumen híbrido para: ${paciente_id}`);

    // 1. Fetch de datos
    const paciente = await fetchDatosPaciente(paciente_id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    const historial = await fetchHistorial(paciente_id);
    const metricas = await fetchMetricasEntrenamiento(paciente_id);

    // 2. Construcción del Prompt
    const prompt = construirPrompt(paciente, historial, metricas);
    console.log('🧠 [IA] Prompt generado:\n', prompt);

    // 3. Llamada a OpenAI
    const resumen_ia = await llamarOpenAI(prompt);
    console.log('🧠 [IA] Respuesta de la IA obtenida con éxito:\n', resumen_ia);

    // 4. Devolver Respuesta
    return res.status(200).json({
      paciente,
      resumen: resumen_ia,
      metricas: {
        promedio_dolor: metricas.promedio_dolor,
        promedio_esfuerzo: metricas.promedio_esfuerzo,
        sesiones_totales: metricas.sesiones_totales
      }
    });

  } catch (err) {
    console.error('❌ [IA] Error inesperado en getResumenPacienteIA:', err);
    if (err.status) {
      return res.status(err.status).json({ error: err.error || err.message });
    }
    return res.status(500).json({ error: 'Error interno al generar el resumen con IA' });
  }
};

module.exports = {
  getResumenPacienteIA
};
