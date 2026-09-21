import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    nombreMaquinaria: { type: String, required: true, minlength: 3 },
    descripcion: { type: String, default: "" },

    costoMaquinaria: { type: Number, required: true, min: 0 },
    numeroContenedor: { type: String, required: true },

    fechaCompra: { type: Date, required: true },
    impuestoPagado: { type: Number, default: 0, min: 0 },
    costoTransporte: { type: Number, default: 0, min: 0 },

    precioFinal: { type: Number, required: true },
    observaciones: { type: String, default: "" },

    imagenUrl: { type: String, default: "" },
    status: { type: String, default: "disponible" }
  },
  { timestamps: true, strict: false }
);

export default model("Product", productSchema); // El nombre es "Product"