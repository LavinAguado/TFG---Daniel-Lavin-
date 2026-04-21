const jwt = require('jsonwebtoken');

// IMPORTANTE: RLS pendiente.

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Acceso denegado: no se proporcionó token' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol, tipo }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado, inicie sesión de nuevo' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const soloSuperadmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado: requiere privilegios de superadmin' });
  }
  next();
};

const soloAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: requiere privilegios de admin' });
  }
  next();
};

// Mantiene compatibilidad con verificarRol genérico si se necesita
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acceso denegado: no autenticado' });
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado: no tienes permisos suficientes' });
    }
    next();
  };
};

module.exports = {
  verificarToken,
  soloSuperadmin,
  soloAdmin,
  verificarRol
};
