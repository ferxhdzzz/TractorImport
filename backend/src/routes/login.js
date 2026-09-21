// backend/src/routes/login.js
import { Router } from "express";
import loginController from "../controllers/loginController.js";

const router = Router();


router.post("/", loginController.login);

export default router;