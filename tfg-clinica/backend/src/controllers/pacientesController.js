const { supabase } = require('../config/supabase');

// IMPORTANTE: En una fase posterior se implementará Row Level Security (RLS) 
// en Supabase para proteger el acceso a los datos sensibles de los pacientes.
// Actualmente la API tiene acceso completo mediante la service/anon key 
// para facilitar el desarrollo, pero RLS es un paso pendiente crítico.

const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const getPacientes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*');

    if (error) {
      console.error('Error al obtener pacientes en Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error inesperado en getPacientes:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createPaciente = async (req, res) => {
  try {
    const { nombre, apellidos, fecha_nacimiento, telefono, email } = req.body;

    // Validación estricta de vacíos
    if (!nombre || !nombre.trim() || !apellidos || !apellidos.trim()) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        mensaje: 'Los campos nombre y apellidos son obligatorios y no pueden estar vacíos' 
      });
    }

    // Validación de email si se proporciona
    if (email && !validarEmail(email)) {
      return res.status(400).json({
        error: 'Formato inválido',
        mensaje: 'El correo electrónico proporcionado no es válido'
      });
    }

    // Evitar duplicados por email
    if (email) {
      const { data: existente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (existente && existente.length > 0) {
        return res.status(400).json({
          error: 'Email duplicado',
          mensaje: 'Ya existe un paciente con ese correo electrónico'
        });
      }
    }

    const { data, error } = await supabase
      .from('pacientes')
      .insert([
        { 
          nombre: nombre.trim(), 
          apellidos: apellidos.trim(), 
          fecha_nacimiento: fecha_nacimiento || null, 
          telefono: telefono || null, 
          email: email || null 
        }
      ])
      .select();

    if (error) {
      console.error('Error al insertar paciente en Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error inesperado en createPaciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updatePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, fecha_nacimiento, telefono, email } = req.body;

    // Validar que se mande al menos un campo
    if (nombre === undefined && apellidos === undefined && fecha_nacimiento === undefined && telefono === undefined && email === undefined) {
      return res.status(400).json({
        error: 'Sin datos',
        mensaje: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    // Validar formato de email si se intenta cambiar
    if (email && !validarEmail(email)) {
      return res.status(400).json({
        error: 'Formato inválido',
        mensaje: 'El correo electrónico proporcionado no es válido'
      });
    }

    // Validar que el paciente existe
    const { data: pacienteActual, error: errorCheck } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', id)
      .single();

    if (errorCheck || !pacienteActual) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'El paciente que intenta actualizar no existe' });
    }

    // Evitar duplicados si cambian el email
    if (email) {
      const { data: existente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .limit(1);

      if (existente && existente.length > 0) {
        return res.status(400).json({
          error: 'Email duplicado',
          mensaje: 'Ya existe otro paciente con ese correo electrónico'
        });
      }
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (apellidos !== undefined) updateData.apellidos = apellidos.trim();
    if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (email !== undefined) updateData.email = email;

    const { data, error } = await supabase
      .from('pacientes')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar paciente:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data[0]);
  } catch (err) {
    console.error('Error inesperado en updatePaciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deletePaciente = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el paciente existe primero
    const { data: pacienteActual, error: errorCheck } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', id)
      .single();

    if (errorCheck || !pacienteActual) {
      return res.status(404).json({ error: 'No encontrado', mensaje: 'El paciente que intenta eliminar no existe' });
    }

    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar paciente:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ mensaje: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('Error inesperado en deletePaciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPacientes,
  createPaciente,
  updatePaciente,
  deletePaciente
};
