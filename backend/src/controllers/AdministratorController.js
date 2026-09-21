// Importamos el modelo de administrador desde Mongoose
import adminModel from "../models/Administrator.js";
// Librería para encriptar contraseñas
import bcryptjs from "bcryptjs";
// Cliente de Cloudinary para subir imágenes
import { v2 as cloudinary } from "cloudinary";
// Librería para generar/verificar JWT
import jsonwebtoken from "jsonwebtoken";
// Archivo de configuración con claves y variables
import { config } from "../config.js";


// Configuración de Cloudinary con credenciales desde config.js
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Objeto controlador que agrupa todas las funciones
const adminController = {};

// =======================
// GET: Obtener todos los administradores
// =======================
adminController.getadmins = async (req, res) => {
  try {
    const admins = await adminModel.find(); // Busca todos en la colección
    res.json(admins); // Devuelve el array de administradores
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener administradores" });
  }
};

// =======================
// GET ONE: Obtener administrador por ID
// =======================
adminController.getadminById = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.id); // Busca por ID en params
    if (!admin) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }
    res.json(admin); // Devuelve el admin encontrado
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener administrador" });
  }
};

// =======================
// PUT: Actualizar administrador por ID
// =======================
adminController.updateadmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones básicas
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "El nombre no puede estar vacío" });
    }
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "El correo no puede estar vacío" });
    }
    // ⚠ La función 'validator.isEmail' requiere importar la librería 'validator'
    // if (!validator.isEmail(email)) { 
    //   return res.status(400).json({ message: "Formato de correo inválido" });
    // }

    // Datos a actualizar
    let updateData = { name: name.trim(), email: email.trim() };

    // Si se envía contraseña, la encripta antes de guardar
    if (password && password.trim() !== "") {
      const hashedPassword = await bcryptjs.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Si se sube una imagen, la envía a Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
        allowed_formats: ["png", "jpg", "jpeg"],
        transformation: [
          { width: 500, height: 500, crop: "fill" },
          { quality: "auto" },
        ],
      });
      updateData.profilePicture = result.secure_url;
    }

    // Actualiza en la base de datos
    const updatedAdmin = await adminModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Devuelve el documento actualizado
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    res.status(200).json({ message: "Administrador actualizado", admin: updatedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar administrador" });
  }
};

// =======================
// PUT: Actualizar el administrador autenticado
// =======================
adminController.updateCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.userId; // Viene del middleware de autenticación

    if (!adminId) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    // 🟢 CLAVE: Extraemos todos los datos posibles del cuerpo (JSON)
    const { name, email, password, profilePicture } = req.body;
    let updateData = {};

    // Validar y asignar nombre si se envía
    if (name !== undefined) {
      if (name.trim() === "") {
        return res.status(400).json({ success: false, message: "El nombre no puede estar vacío" });
      }
      updateData.name = name.trim();
    }

    // Validar y asignar email si se envía
    if (email !== undefined) {
      if (email.trim() === "") {
        return res.status(400).json({ success: false, message: "El correo no puede estar vacío" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Formato de correo inválido" });
      }
      updateData.email = email.trim();
    }

    // Si se envía nueva contraseña, encripta
    if (password !== undefined && password.trim() !== "") {
      const hashedPassword = await bcryptjs.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Manejo de foto de perfil: Prioridad 1: Archivo subido (req.file)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
        allowed_formats: ["png", "jpg", "jpeg"],
        transformation: [
          { width: 500, height: 500, crop: "fill" },
          { quality: "auto" },
        ],
      });
      updateData.profilePicture = result.secure_url;
    } 
    // 🟢 CLAVE: Prioridad 2: URL de la foto enviada en el JSON (desde el hook)
    else if (profilePicture !== undefined) { 
      updateData.profilePicture = profilePicture;
    }
    // Si req.file es undefined Y profilePicture es undefined, no se toca la foto.


    // 🛑 DETECCIÓN DE UPDATE VACÍO 🛑
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: "No se proporcionaron datos para actualizar." });
    }

    console.log("Actualizando admin:", adminId);
    console.log("Con datos:", updateData);

    // Actualiza y devuelve el admin actualizado
    const updatedAdmin = await adminModel.findByIdAndUpdate(adminId, updateData, { new: true });

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Administrador no encontrado" });
    }

    // 🟢 CORRECCIÓN DE RESPUESTA: Usar 'user' para consistencia con GET
    res.status(200).json({ success: true, message: "Perfil actualizado", user: updatedAdmin }); 
  } catch (error) {
    console.error("Error al actualizar perfil admin:", error);
    res.status(500).json({ success: false, message: "Error al actualizar perfil del administrador" });
  }
};

// =======================
// GET: Obtener el administrador autenticado
// =======================
adminController.getCurrentAdmin = async (req, res) => {
  try {
    // El middleware validateAuthToken ya verificó el token y adjuntó el ID
    const userId = req.userId; // Del middleware validateAuthToken

    if (!userId) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    // Excluir información sensible como la contraseña. Se podría añadir .lean() para optimizar la lectura.
    const admin = await adminModel.findById(userId).select("-password -loginAttempts -lockUntil");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Administrador no encontrado" });
    }

    // Devolver el objeto estructurado { user: admin } que el frontend espera.
    res.json({ success: true, user: admin });
  } catch (error) {
    console.error("Error al obtener datos del administrador:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos del administrador" });
  }
};

// =======================
// DELETE: Eliminar administrador por ID
// =======================
adminController.deleteadmin = async (req, res) => {
  try {
    const deletedAdmin = await adminModel.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }
    res.json({ message: "Administrador eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar administrador" });
  }
};

// Exporta el controlador
export default adminController;
