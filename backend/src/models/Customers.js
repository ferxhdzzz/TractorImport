import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    nombreCliente: {
      type: String,
      required: [true, "El nombre del cliente es obligatorio"],
      trim: true,
    },
    maquinariaComprada: {
      type: Schema.Types.ObjectId,
      ref: "Product", // O "Inventory" si tu modelo en Products.js exporta como "Inventory"
      required: [true, "La maquinaria es obligatoria"],
    },
    precioFinal: {
      type: Number,
      required: [true, "El precio final es obligatorio"],
    },
    fechaCompra: {
      type: Date,
      required: [true, "La fecha de compra es obligatoria"],
    },
    aplicaAbono: {
      type: Boolean,
      default: false,
    },
    abonoPagado: {
      type: Number,
      default: null,
    },
    fechaAbono: {
      type: Date,
      default: null,
    },
    remanente: {
      type: Number,
      default: 0,
    },
    metodoPago: {
      type: String,
      default: "Transferencia",
    },
    observaciones: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Customer", customerSchema);