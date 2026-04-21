const { supabase } = require('../config/supabase');

// IMPORTANTE: En una fase posterior se implementará Row Level Security (RLS) 
// para restringir acceso a nivel de base de datos.
// No implementar RLS todavía.

const createEntrenamiento = async (req, res) => {
  try {
    const { paciente_id, fecha, notas } = req.body;

    if (!paciente_id || !fecha) {
      return res.status(400).json({ error: 'paciente_id y fecha son obligatorios' });
    }

    // Comprobar que el paciente existe
    const { data: paciente, error: errPac } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', paciente_id)
      .single();

    if (errPac || !paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const notaFinal = req.user.tipo ? `[${req.user.tipo.toUpperCase()}] ${notas || ''}`.trim() : notas;

    const { data, error } = await supabase
      .from('entrenamientos')
      .insert([{
        paciente_id,
        usuario_id: req.user.id,
        fecha,
        notas: notaFinal
      }])
      .select();

    if (error) {
      console.error('Error al crear entrenamiento:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error inesperado en createEntrenamiento:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const addEjercicioAEntrenamiento = async (req, res) => {
  try {
    const { entrenamiento_id, ejercicio_id, series, repeticiones, esfuerzo } = req.body;

    if (!entrenamiento_id || !ejercicio_id) {
      return res.status(400).json({ error: 'entrenamiento_id y ejercicio_id son obligatorios' });
    }

    if (series <= 0 || repeticiones <= 0) {
      return res.status(400).json({ error: 'series y repeticiones deben ser mayores que 0' });
    }

    // Comprobar que el entrenamiento existe
    const { data: ent, error: errEnt } = await supabase
      .from('entrenamientos')
      .select('id')
      .eq('id', entrenamiento_id)
      .single();

    if (errEnt || !ent) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    // Comprobar que el ejercicio existe
    const { data: ej, error: errEj } = await supabase
      .from('ejercicios')
      .select('id')
      .eq('id', ejercicio_id)
      .single();

    if (errEj || !ej) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    const { data, error } = await supabase
      .from('entrenamiento_ejercicios')
      .insert([{
        entrenamiento_id,
        ejercicio_id,
        series,
        repeticiones,
        esfuerzo
      }])
      .select();

    if (error) {
      console.error('Error al añadir ejercicio al entrenamiento:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error inesperado en addEjercicioAEntrenamiento:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getEntrenamientos = async (req, res) => {
  try {
    let query = supabase
      .from('entrenamientos')
      .select(`
        *,
        pacientes (id, nombre, apellidos),
        usuarios (id, nombre, rol),
        entrenamiento_ejercicios (
          id, series, repeticiones, esfuerzo,
          ejercicios (id, nombre, descripcion)
        )
      `)
      .order('fecha', { ascending: false });

    // Filtrar si no es superadmin
    if (req.user.rol !== 'superadmin') {
      query = query.eq('usuario_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener entrenamientos:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error inesperado en getEntrenamientos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createEntrenamiento,
  addEjercicioAEntrenamiento,
  getEntrenamientos
};
