const jwt = require('jsonwebtoken');

// IMPORTANTE: En la fase final se implementará Row Level Security (RLS) en Supabase
// para reforzar la seguridad. Actualmente la protección se basa en estos middlewares
// de JWT y roles a nivel de Express. RLS es un paso pendiente crítico.

/**
 * Middleware que verifica que el request tiene un token JWT válido.
 * Si es válido, añade los datos del usuario a req.user.
 */
const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'Acceso denegado: no se proporcionó token' });
    }

    // Formato esperado: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado, inicie sesión de nuevo' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware que restringe el acceso según el rol del usuario.
 * Uso: verificarRol('admin', 'fisio')
 * Debe usarse DESPUÉS de verificarToken.
 */
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acceso denegado: usuario no autenticado' });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'Acceso denegado: no tienes permisos suficientes',
        mensaje: `Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol
};
