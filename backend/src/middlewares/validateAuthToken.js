import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * Middleware para validar el JWT de la cookie o header y verificar los roles de acceso.
 * @param {Array<string>} allowedRoles - Array de roles permitidos (e.g., ["admin", "customer"]).
 * @returns {function} Función middleware de Express.
 */
export const validateAuthToken = (allowedRoles = []) => (req, res, next) => {
  // 1. Intentar obtener el token de las cookies
  let token = req.cookies ? req.cookies.authToken : null;

  // 2. Respaldo: si no hay cookie, buscar en la cabecera Authorization (Bearer Token)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    console.log("Acceso denegado: Token no encontrado en cookies ni en headers.");
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. No se ha proporcionado un token.",
    });
  }

  // 3. Verificar y decodificar el token
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const { id, userType } = decoded;

    // 4. Verificar si el rol del usuario está permitido
    if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
      console.log(`Acceso denegado: El usuario de tipo '${userType}' no tiene permiso para acceder a esta ruta.`);
      return res.status(403).json({
        success: false,
        message: "Acceso prohibido. Permisos insuficientes.",
      });
    }

    // 5. Adjuntar datos de usuario a la solicitud y continuar
    req.userId = id;
    req.userType = userType;

    next();
  } catch (error) {
    console.error("Error de verificación de JWT:", error.message);

    const isProduction =
      process.env.NODE_ENV === "production" ||
      req.protocol === "https" ||
      req.headers["x-forwarded-proto"] === "https";

    // Limpiar la cookie si expiró o es inválida
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado.",
    });
  }
};

export default validateAuthToken;