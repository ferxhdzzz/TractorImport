import express from "express";
import multer from "multer";
import inventoryController from "../controllers/productsController.js";

const router = express.Router();

// Configura multer para subir imágenes a la carpeta temporal public/
const upload = multer({ dest: "public/" });

router.post("/", upload.array("images"), inventoryController.createInventory);
router.put("/:id", upload.array("images"), inventoryController.updateInventory);

router.get("/", inventoryController.getInventory);
router.get("/:id", inventoryController.getInventoryById);
router.delete("/:id", inventoryController.deleteInventory);

export default router;