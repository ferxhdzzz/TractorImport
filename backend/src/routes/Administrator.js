// Archivo: src/routes/administrators.js (o similar)

import express from "express";
import multer from "multer"; // 🟢 AÑADIDO: Necesitas Multer para la ruta /:id
import adminController from "../controllers/AdministratorController.js";
import { validateAuthToken } from "../middlewares/validateAuthToken.js";

const router = express.Router();

// 🟢 AÑADIDO: Configurar multer para manejar archivos (imagen de perfil)
const upload = multer({ dest: "public/" }); 

// Rutas para administradores
router.put(
  "/me",
  validateAuthToken(["admin"]),
  // ✅ CORRECTO: Eliminaste upload.single("profilePicture")
  adminController.updateCurrentAdmin // Ahora recibe JSON directamente (solucionando el problema)
);

router.get("/me", validateAuthToken(["admin"]), adminController.getCurrentAdmin);

router.route("/")
  .get(adminController.getadmins);


// Rutas para operaciones por ID
router
  .route("/:id")
  .get(adminController.getadminById)
  // ✅ CORRECTO: upload está definido y se usa para la ruta /:id
  .put(upload.single("profilePicture"), adminController.updateadmin) 
  .delete(adminController.deleteadmin);

export default router;