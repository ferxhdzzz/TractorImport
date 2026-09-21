import { Schema, model } from "mongoose";

const landSchema = new Schema(
  {
    nombreCliente: {
      type: String,
      required: [true, "El nombre del cliente es obligatorio"],
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, "La dirección es obligatoria"],
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      trim: true,
    },
    dimensionTerreno: {
      type: String,
      required: [true, "La dimensión del terreno es obligatoria"],
      trim: true,
    },
    costoTerreno: {
      type: Number,
      required: [true, "El costo del terreno es obligatorio"],
      min: [0, "El costo no puede ser negativo"],
    },
    montoAbonado: {
      type: Number,
      default: 0,
      min: [0, "El monto abonado no puede ser negativo"],
    },
    fechaVenta: {
      type: Date,
      required: [true, "La fecha de venta es obligatoria"],
    },
    tipoVenta: {
      type: String,
      enum: ["Contado", "Promesa"],
      required: [true, "El tipo de venta es obligatorio"],
      default: "Contado",
    },
    numeroCuotas: {
      type: Number,
      default: null,
    },
    montoCuotaMensual: {
      type: Number,
      default: null,
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

const Land = model("Land", landSchema);

// 🔴 BORRAR ÍNDICES ANTIGUOS QUE CAUSAN E11000
Land.cleanIndexes().catch((err) =>
  console.log("Aviso: Limpieza de índices ejecutada o sin índices previos.", err.message)
);

export default Land;