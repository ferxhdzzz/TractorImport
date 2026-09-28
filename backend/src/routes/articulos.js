import { Router } from "express";
import articuloVariosController from "../controllers/articuloVariosController.js";

const router = Router();

router.get("/", articuloVariosController.getArticulos);
router.get("/:id", articuloVariosController.getArticuloById);
router.post("/", articuloVariosController.createArticulo);
router.put("/:id", articuloVariosController.updateArticulo);
router.delete("/:id", articuloVariosController.deleteArticulo);

export default router;