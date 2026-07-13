const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, rol, canton_asignado, ... }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware opcional para verificar roles
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permiso para acceder' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleCheck };