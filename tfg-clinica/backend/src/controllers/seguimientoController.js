const { supabase } = require('../config/supabase');

// IMPORTANTE: Este módulo permite recoger feedback del paciente después de un entrenamiento.
// FUTURO: Se implementará una notificación al profesional (por ejemplo, vía email o web push) 
// cuando el paciente envíe el seguimiento.
// FUTURO: En una fase posterior se implementará Row Level Security (RLS) para 
// restringir acceso a nivel de base de datos de manera más estricta.

/**
 * createSeguimiento
 * 
 * Permite al paciente registrar su feedback tras un entrenamiento.
 * Esta ruta es PÚBLICA (no requiere token), simulando un formulario al que
 * el paciente accede a través de un enlace único temporal.
 */
const createSeguimiento = async (req, res) => {
  try {
    const { entrenamiento_id, dolor, esfuerzo, comentarios } = req.body;

    if (!entrenamiento_id) {
      return res.status(400).json({ error: 'entrenamiento_id es obligatorio' });
    }

    // Validar escalas (0 a 10)
    if (dolor !== undefined && (dolor < 0 || dolor > 10)) {
      return res.status(400).json({ error: 'La escala de dolor debe estar entre 0 y 10' });
    }

    if (esfuerzo !== undefined && (esfuerzo < 0 || esfuerzo > 10)) {
      return res.status(400).json({ error: 'La escala de esfuerzo debe estar entre 0 y 10' });
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

    const { data, error } = await supabase
      .from('seguimiento')
      .insert([{
        entrenamiento_id,
        dolor,
        esfuerzo,
        comentarios
      }])
      .select();

    if (error) {
      console.error('Error al crear seguimiento:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ [Seguimiento] Nuevo feedback registrado para el entrenamiento: ${entrenamiento_id}`);
    
    return res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error inesperado en createSeguimiento:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * getSeguimientoByEntrenamiento
 * 
 * Permite al profesional consultar el feedback dejado por el paciente.
 * Esta ruta es PRIVADA (requiere token JWT).
 */
const getSeguimientoByEntrenamiento = async (req, res) => {
  try {
    const { entrenamiento_id } = req.params;

    if (!entrenamiento_id) {
      return res.status(400).json({ error: 'Se requiere el ID del entrenamiento' });
    }

    // Opcional: verificar que el profesional tenga acceso a este entrenamiento
    // (si es admin, solo los suyos; si es superadmin, todos).
    const { data: ent, error: errEnt } = await supabase
      .from('entrenamientos')
      .select('usuario_id')
      .eq('id', entrenamiento_id)
      .single();

    if (errEnt || !ent) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    if (req.user.rol !== 'superadmin' && ent.usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver el seguimiento de este entrenamiento' });
    }

    const { data, error } = await supabase
      .from('seguimiento')
      .select('*')
      .eq('entrenamiento_id', entrenamiento_id)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener seguimiento:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error inesperado en getSeguimientoByEntrenamiento:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createSeguimiento,
  getSeguimientoByEntrenamiento
};
