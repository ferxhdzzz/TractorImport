import { Schema, model } from "mongoose";

const administratorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Para evitar correos duplicados
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fotoPerfil: {
      type: String,
      default: "",
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Administrator", administratorSchema);