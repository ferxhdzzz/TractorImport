import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    nombreMaquinaria: { type: String, minlength: 3 },
    descripcion: { type: String, default: "" },

    costoMaquinaria: { type: Number, min: 0 },
    numeroContenedor: { type: String },

    fechaCompra: { type: Date },
    impuestoPagado: { type: Number, default: 0, min: 0 },
    costoTransporte: { type: Number, default: 0, min: 0 },

    precioFinal: { type: Number },
    observaciones: { type: String, default: "" },

    imagenUrl: { type: String, default: "" },
    status: { type: String, default: "disponible" }
  },
  { timestamps: true } // Quitamos strict: false
);

export default model("Product", productSchema);