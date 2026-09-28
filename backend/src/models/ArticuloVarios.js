import mongoose from "mongoose";

const articuloVariosSchema = new mongoose.Schema(
  {
    nombreArticulo: {
      type: String,
      trim: true,
      default: "",
    },
    precioUnitario: {
      type: Number,
      default: 0,
    },
    impuestos: {
      type: Number,
      default: 0,
    },
    transporte: {
      type: Number,
      default: 0,
    },
    precioFinal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Registra automáticamente createdAt y updatedAt
  }
);

const ArticuloVarios = mongoose.model("ArticuloVarios", articuloVariosSchema);

export default ArticuloVarios;