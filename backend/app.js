import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// Rutas
import customersRoutes from "./src/routes/customers.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import recoveryPasswordRoutes from "./src/routes/recoveryPassword.js";
import productsRoutes from "./src/routes/products.js";
import adminRoutes from "./src/routes/Administrator.js";
import profileRoutes from "./src/routes/profile.js";
import landRoutes from "./src/routes/lands.js";
import { validateAuthToken } from "./src/middlewares/validateAuthToken.js";





const app = express();

// ** 🚀 FIX CRÍTICO para Render/Vercel (Proxy Inverso) **
// Esto asegura que req.protocol sea 'https' en producción, activando 'Secure' en la cookie.
app.set('trust proxy', 1);

// Configuración CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:19006",
  "https://tractorimport.vercel.app",
 //"https://eternal-joyeria-priv.vercel.app",
 //"https://eternal-joyeria-priv-olive.vercel.app",
 //"https://eternal-joyeria-sigma.vercel.app",// <-- Dominio principal de Vercel
  /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/, // <-- Permite subdominios y previews de Vercel
  /^http:\/\/192\.168\.1\.\d{1,3}(?::\d+)?$/,
  /^http:\/\/192\.168\.137\.\d{1,3}(?::\d+)?$/,
  /^http:\/\/10\.0\.2\.2(?::\d+)?$/,
  /^http:\/\/10\.0\.3\.2(?::\d+)?$/,
  /^http:\/\/localhost(?::\d+)?$/,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Comprobar si el origen coincide con un string exacto o una expresión regular
    if (allowedOrigins.some(o => typeof o === "string" ? origin === o : o.test(origin))) {
      callback(null, true);
    } else {
      console.log("Origen no permitido por CORS:", origin);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true, // ✅ CRÍTICO: Permite que las cookies viajen
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Manejo de pre-flight requests para CORS



// Middleware JSON y cookies
app.use(express.json());
app.use(cookieParser());



// ===== Rutas públicas =====
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/recoveryPassword", recoveryPasswordRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/lands", landRoutes);


// ===== Rutas protegidas (JWT) =====
app.use("/api/customers",  customersRoutes);
app.use("/api/admins",  adminRoutes);
app.use("/api/profile", profileRoutes);





export default app;
