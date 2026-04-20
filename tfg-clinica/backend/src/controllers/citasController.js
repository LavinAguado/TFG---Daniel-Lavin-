const { supabase } = require('../config/supabase');

// IMPORTANTE: En la fase final se implementará Row Level Security (RLS) en Supabase
// para restringir el acceso a las citas a nivel de base de datos.
// Actualmente la restricción se realiza únicamente a nivel de middleware en Express.
// RLS es un paso pendiente crítico.

const getCitas = async (req, res) => {
  try {
    let query = supabase
      .from('citas')
      .select(`
        *,
        pacientes (id, nombre, apellidos, email),
        usuarios (id, nombre, email, rol)
      `)
      .order('fecha', { ascending: true });

    // Si el usuario NO es admin, solo ve sus propias citas
    if (req.user.rol !== 'admin') {
      query = query.eq('usuario_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener citas:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error inesperado en getCitas:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createCita = async (req, res) => {
  try {
    const { paciente_id, fecha, estado } = req.body;

    // Validaciones
    if (!paciente_id) {
      return res.status(400).json({ error: 'El campo paciente_id es obligatorio' });
    }
    if (!fecha) {
      return res.status(400).json({ error: 'El campo fecha es obligatorio' });
    }

    // Verificar que el paciente existe
    const { data: paciente, error: errorPaciente } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', paciente_id)
      .single();

    if (errorPaciente || !paciente) {
      return res.status(404).json({ error: 'El paciente indicado no existe' });
    }

    // usuario_id se toma del token JWT (el usuario autenticado)
    const { data, error } = await supabase
      .from('citas')
      .insert([{
        paciente_id,
        usuario_id: req.user.id,
        fecha,
        estado: estado || 'pendiente'
      }])
      .select(`
        *,
        pacientes (id, nombre, apellidos),
        usuarios (id, nombre, rol)
      `);

    if (error) {
      console.error('Error al crear cita:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error inesperado en createCita:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getCitas,
  createCita
};
