const multer = require('multer');

// Configuración de almacenamiento en memoria
// No guardamos los archivos en el servidor, los pasamos directamente a Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
});

module.exports = upload;
