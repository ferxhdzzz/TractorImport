import { Router } from "express";
import {
  getGastos,
  getGastoById,
  createGasto,
  updateGasto,
  deleteGasto,
} from "../controllers/GastoController.js";

const router = Router();

router.route("/")
  .get(getGastos)
  .post(createGasto);

router.route("/:id")
  .get(getGastoById)
  .put(updateGasto)
  .delete(deleteGasto);

export default router;