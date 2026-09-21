// backend/src/config.js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  db: {
    uri: process.env.dbUri ,
  },

  server: {
    port: process.env.port ,
  },

  jwt: {
    secret: process.env.jwtSecret,
    expiresIn: process.env.expiresIn || "7d" // Cambiado de 2h a 7d (7 días)
  },

  adminAccount: {
    email: process.env.adminEmail,
    password: process.env.adminPass,
  },

  smtp: {
    user: process.env.userEmail,
    pass: process.env.userPass,
  },

  cloudinary: {
    cloud_name: process.env.cloudinaryName,
    api_key: process.env.cloudinaryApiKey,
    api_secret: process.env.cloudinaryApiSecret,
  }
};
