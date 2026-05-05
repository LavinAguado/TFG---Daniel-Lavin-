const { supabase } = require('../config/supabase');
const { runInUserContext } = require('../config/dbUtils');
const crypto = require('crypto');

const uploadArchivo = async (req, res) => {
  try {
    const { paciente_id } = req.params;
    const file = req.file;
    console.log('📦 [DEBUG] req.file recibido:', file);

    if (!file) return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });

    // Verificar acceso al paciente (dentro de RLS)
    const access = await runInUserContext(req.user, async (client) => {
      const resP = await client.query('SELECT id FROM pacientes WHERE id = $1', [paciente_id]);
      return resP.rows.length > 0;
    });

    if (!access) return res.status(404).json({ error: 'Paciente no encontrado o acceso denegado' });

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${paciente_id}/${fileName}`;

    // Subida al storage (usando el cliente superuser del backend)
    const { error: storageError } = await supabase.storage
      .from('pacientes-files')
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (storageError) throw storageError;

    // Guardar en DB (dentro de RLS)
    const dbData = await runInUserContext(req.user, async (client) => {
      const query = 'INSERT INTO archivos_paciente (paciente_id, nombre, path) VALUES ($1, $2, $3) RETURNING *';
      const resInsert = await client.query(query, [paciente_id, file.originalname, filePath]);
      return resInsert.rows[0];
    });

    return res.status(201).json({ message: 'Archivo subido correctamente', archivo: dbData });
  } catch (err) {
    console.error('Error en uploadArchivo:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getArchivosPaciente = async (req, res) => {
  try {
    const { paciente_id } = req.params;

    const data = await runInUserContext(req.user, async (client) => {
      const query = 'SELECT * FROM archivos_paciente WHERE paciente_id = $1 ORDER BY created_at DESC';
      const resQuery = await client.query(query, [paciente_id]);
      return resQuery.rows;
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en getArchivosPaciente:', err);
    return res.status(500).json({ error: 'Error al obtener los archivos' });
  }
};

const getArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    const archivo = await runInUserContext(req.user, async (client) => {
      const query = 'SELECT path, nombre FROM archivos_paciente WHERE id = $1';
      const resQuery = await client.query(query, [id]);
      return resQuery.rows[0];
    });

    if (!archivo) return res.status(404).json({ error: 'Archivo no encontrado o acceso denegado' });

    const { data: signedData, error: signedError } = await supabase.storage
      .from('pacientes-files')
      .createSignedUrl(archivo.path, 3600);

    if (signedError) throw signedError;

    return res.status(200).json({ nombre: archivo.nombre, url: signedData.signedUrl });
  } catch (err) {
    console.error('Error en getArchivo:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  uploadArchivo,
  getArchivosPaciente,
  getArchivo
};
