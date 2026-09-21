import { Router } from "express";
import customerController from "../controllers/customersController.js";
import validateAuthToken from "../middlewares/validateAuthToken.js";

const router = Router();

router.get("/", validateAuthToken(["admin"]), customerController.getCustomers);
router.get("/:id", validateAuthToken(["admin"]), customerController.getCustomerById);
router.post("/", validateAuthToken(["admin"]), customerController.createCustomer);
router.put("/:id", validateAuthToken(["admin"]), customerController.updateCustomer);
router.delete("/:id", validateAuthToken(["admin"]), customerController.deleteCustomer);

export default router;