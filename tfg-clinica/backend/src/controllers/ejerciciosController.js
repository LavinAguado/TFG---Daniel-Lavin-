const { pool } = require('../config/db');
const { runInUserContext } = require('../config/dbUtils');

const getEjercicios = async (req, res) => {
  try {
    await runInUserContext(req.user, async (client) => {
      const result = await client.query('SELECT * FROM ejercicios ORDER BY nombre ASC');
      res.status(200).json(result.rows);
    });
  } catch (err) {
    console.error('Error al obtener ejercicios:', err);
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};

const createEjercicio = async (req, res) => {
  try {
    const { nombre, descripcion, video_url } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    await runInUserContext(req.user, async (client) => {
      const result = await client.query(
        'INSERT INTO ejercicios (nombre, descripcion, video_url) VALUES ($1, $2, $3) RETURNING *',
        [nombre, descripcion, video_url]
      );
      res.status(201).json(result.rows[0]);
    });
  } catch (err) {
    console.error('Error al crear ejercicio:', err);
    res.status(500).json({ error: 'Error al crear el ejercicio' });
  }
};

const updateEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, video_url } = req.body;

    await runInUserContext(req.user, async (client) => {
      const result = await client.query(
        'UPDATE ejercicios SET nombre = $1, descripcion = $2, video_url = $3 WHERE id = $4 RETURNING *',
        [nombre, descripcion, video_url, id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: 'Ejercicio no encontrado' });
      res.status(200).json(result.rows[0]);
    });
  } catch (err) {
    console.error('Error al actualizar ejercicio:', err);
    res.status(500).json({ error: 'Error al actualizar el ejercicio' });
  }
};

const deleteEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    await runInUserContext(req.user, async (client) => {
      const result = await client.query('DELETE FROM ejercicios WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Ejercicio no encontrado' });
      res.status(200).json({ message: 'Ejercicio eliminado correctamente' });
    });
  } catch (err) {
    console.error('Error al eliminar ejercicio:', err);
    res.status(500).json({ error: 'Error al eliminar el ejercicio' });
  }
};

module.exports = {
  getEjercicios,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio
};

