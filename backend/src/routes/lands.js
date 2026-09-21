import { Router } from "express";
import landController from "../controllers/landsController.js";
// import validateAuthToken from "../middlewares/validateAuthToken.js"; // Descomenta si usas middleware de autenticación

const router = Router();

router.get("/", landController.getLands);
router.get("/:id", landController.getLandById);
router.post("/", landController.createLand);
router.put("/:id", landController.updateLand);
router.delete("/:id", landController.deleteLand);

export default router;