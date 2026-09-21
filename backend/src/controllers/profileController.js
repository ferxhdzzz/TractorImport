import bcryptjs from "bcryptjs";
import customersModel from "../models/Customers.js";
import adminModel from "../models/Administrator.js";

const profileController = {};

// Cambiar contraseña del usuario autenticado
profileController.changePassword = async (req, res) => {
  console.log('🔐 [changePassword] ===== INICIANDO CAMBIO DE CONTRASEÑA =====');
  console.log('🔐 [changePassword] Headers recibidos:', req.headers);
  console.log('🔐 [changePassword] Body recibido:', req.body);
  console.log('🔐 [changePassword] Usuario del middleware:', {
    userId: req.userId,
    userType: req.userType,
    email: req.email
  });
  console.log('🔐 [changePassword] Todas las propiedades de req relacionadas con auth:', {
    userId: req.userId,
    userType: req.userType,
    email: req.email,
    user: req.user,
    session: req.session
  });
  
  try {
    // Verificar que tenemos la información necesaria del middleware
    if (!req.userId || !req.userType) {
      console.log('❌ [changePassword] FALTA INFORMACIÓN DE AUTENTICACIÓN');
      console.log('❌ [changePassword] req.userId:', req.userId);
      console.log('❌ [changePassword] req.userType:', req.userType);
      console.log('❌ [changePassword] typeof req.userId:', typeof req.userId);
      console.log('❌ [changePassword] typeof req.userType:', typeof req.userType);
      return res.status(401).json({
        success: false,
        message: 'No se pudo obtener la información del usuario. Por favor, cierra sesión y vuelve a iniciar.',
        code: 'AUTH_ERROR'
      });
    }
    
    console.log('✅ [changePassword] Información de autenticación OK');
    
    const { currentPassword, newPassword } = req.body;
    
    // Validar que se proporcionen los datos requeridos
    if (!currentPassword || !newPassword) {
      console.log('❌ [changePassword] Faltan datos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Se requieren la contraseña actual y la nueva contraseña',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (newPassword.length < 6) {
      console.log('❌ [changePassword] La nueva contraseña es demasiado corta');
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    console.log('🔍 [changePassword] Buscando usuario en la base de datos...');

    // Buscar al usuario en la base de datos según su tipo
    let user;
    if (req.userType === 'admin') {
      user = await adminModel.findById(req.userId).select('+password');
    } else {
      user = await customersModel.findById(req.userId).select('+password');
    }
    
    // Verificar que el usuario existe
    if (!user) {
      console.log('❌ [changePassword] Usuario no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    console.log('🔍 [changePassword] Usuario encontrado:', {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password
    });
    
    // Verificar que la contraseña actual sea correcta
    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('❌ [changePassword] Contraseña actual incorrecta');
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }
    
    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcryptjs.compare(newPassword, user.password);
    if (isSamePassword) {
      console.log('❌ [changePassword] La nueva contraseña es igual a la actual');
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual',
        code: 'SAME_PASSWORD'
      });
    }
    
    // Encriptar la nueva contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    
    // Actualizar la contraseña del usuario
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ [changePassword] Contraseña actualizada exitosamente');
    
    // Enviar respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ [changePassword] Error inesperado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

export default profileController;
