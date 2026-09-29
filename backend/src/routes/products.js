import express from "express";
import multer from "multer";
import inventoryController from "../controllers/productsController.js";

const router = express.Router();

const upload = multer({ dest: "public/" });

// Cambiamos a upload.single("image")
router.post("/", upload.single("image"), inventoryController.createInventory);
router.put("/:id", upload.single("image"), inventoryController.updateInventory);

router.get("/", inventoryController.getInventory);
router.get("/:id", inventoryController.getInventoryById);
router.delete("/:id", inventoryController.deleteInventory);

export default router;