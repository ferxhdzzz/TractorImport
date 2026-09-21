const logoutController = {};

logoutController.logout = async (req, res) => {
  // Para eliminar la cookie, DEBES pasar exactamente los mismos parámetros 
  // (path, secure, sameSite, etc.) que se usaron para CREARLA.
  // En entornos de producción con HTTPS y dominios separados, estas flags son esenciales:
  res.clearCookie("authToken", {
    path: "/", // Asegura que coincida con la ruta raíz
    secure: true, // Debe ser true si la conexión es HTTPS (como en Render)
    sameSite: "None", // Necesario para cookies cross-site con secure: true
  });

  console.log("✅ Cookie 'authToken' enviada para eliminación con parámetros secure/samesite.");
  return res.json({ message: "Session closed successfully. Cookie cleared." });
};

export default logoutController;

