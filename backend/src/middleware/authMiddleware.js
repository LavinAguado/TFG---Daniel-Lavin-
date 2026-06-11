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
  if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'superadmin')) {
    return res.status(403).json({ error: 'Acceso denegado: requiere privilegios de admin o superadmin' });
  }
  next();
};


const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('🛡️ Auth: No user in request');
      return res.status(401).json({ error: 'Acceso denegado: no autenticado' });
    }
    console.log(`🛡️ Auth: Checking role ${req.user.rol} against [${rolesPermitidos.join(', ')}]`);
    if (!rolesPermitidos.includes(req.user.rol)) {
      console.log('🛡️ Auth: Role not permitted');
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
