import CustomersModel from "../models/Customers.js";
import AdministratorsModel from "../models/Administrator.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutos
const loginController = {};

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await AdministratorsModel.findOne({ email });
    let userType = "admin";
    let UserModel = AdministratorsModel;

    if (!user) {
      user = await CustomersModel.findOne({ email });
      userType = "customer";
      UserModel = CustomersModel;
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    // Bloqueo por intentos fallidos
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutosRestantes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Cuenta bloqueada. Intenta nuevamente en ${minutosRestantes} minutos`,
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;

      if (attempts >= MAX_ATTEMPTS) {
        // Actualizamos directo en la BD para evitar validaciones de esquema completo
        await UserModel.updateOne(
          { _id: user._id },
          { $set: { lockUntil: Date.now() + LOCK_TIME, loginAttempts: attempts } }
        );

        return res.status(403).json({
          success: false,
          message: `Cuenta bloqueada por ${LOCK_TIME / 60000} minutos`,
        });
      }

      await UserModel.updateOne(
        { _id: user._id },
        { $set: { loginAttempts: attempts } }
      );

      return res.status(401).json({
        success: false,
        message: `Contraseña incorrecta. Intentos restantes: ${MAX_ATTEMPTS - attempts}`,
      });
    }

    // Contraseña correcta -> reiniciamos intentos directo en la BD
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: 0, lockUntil: null } }
    );

    // Generar JWT
    const token = jwt.sign(
      { id: user._id, userType },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn || "1d" }
    );

    const isProduction =
      process.env.NODE_ENV === "production" ||
      req.protocol === "https" ||
      req.headers["x-forwarded-proto"] === "https";

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.firstName || "",
        fotoPerfil: user.fotoPerfil || "",
      },
      userType,
    });
  } catch (error) {
    console.error("Error login:", error);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

export default loginController;