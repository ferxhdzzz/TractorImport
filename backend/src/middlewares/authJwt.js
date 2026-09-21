import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
  // Obtener el token del header 'x-access-token' o 'Authorization'
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No se proporcionó ningún token de autenticación.'
    });
  }

  // Eliminar 'Bearer ' del token si está presente
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(tokenValue, config.jwt.secret);
    
    // Adjuntar información del usuario al request para usar en las rutas
    req.userId = decoded.id;
    // Manejar tanto 'userType' como 'tipo' para compatibilidad
    req.userType = decoded.userType || decoded.tipo || 'customer';
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

// Middleware para verificar si el usuario es administrador
export const isAdmin = (req, res, next) => {
  if (req.userType === 'admin') {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'Se requieren privilegios de administrador para esta acción.'
  });
};

// Middleware para verificar si el usuario es el dueño del recurso o es admin
export const isOwnerOrAdmin = (req, res, next) => {
  const { id } = req.params;
  
  if (req.userId === id || req.userType === 'admin') {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'No tienes permiso para realizar esta acción.'
  });
};
