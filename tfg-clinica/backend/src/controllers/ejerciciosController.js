const { supabase } = require('../config/supabase');

// IMPORTANTE: En una fase posterior se implementará Row Level Security (RLS) 
// para restringir acceso a nivel de base de datos.
// No implementar RLS todavía.

const getEjercicios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ejercicios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener ejercicios:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error inesperado en getEjercicios:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createEjercicio = async (req, res) => {
  try {
    const { nombre, descripcion, video_url } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El campo nombre es obligatorio' });
    }

    const { data, error } = await supabase
      .from('ejercicios')
      .insert([{ nombre, descripcion, video_url }])
      .select();

    if (error) {
      console.error('Error al crear ejercicio:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error inesperado en createEjercicio:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getEjercicios,
  createEjercicio
};
