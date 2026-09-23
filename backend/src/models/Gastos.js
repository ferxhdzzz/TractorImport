import { Schema, model } from "mongoose";

const gastoSchema = new Schema(
  {
    // Unidad de medida: "Dias" u "Horas"
    tipoPeriodo: {
      type: String,
      enum: ["Horas", "Dias"],
      default: "Dias",
      required: true,
    },
    // Cantidad (Ej: 3 días u 8 horas)
    cantidadPeriodo: {
      type: Number,
      default: 1,
      min: 0,
    },
    // Monto monetario equivalente al período (Ej: $150.00 por los 3 días)
    costoPeriodo: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Gasto de Combustible
    combustible: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Pasajes opcionales (Terrestre, Aéreo, Marítimo)
    pasajes: {
      terrestre: { type: Number, default: 0, min: 0 },
      aereo: { type: Number, default: 0, min: 0 },
      maritimo: { type: Number, default: 0, min: 0 },
    },

    // Alquiler de Transporte
    alquilerTransporte: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Hospedaje
    hospedaje: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total general (Suma de todo incluyendo costoPeriodo)
    totalGasto: {
      type: Number,
      default: 0,
    },

    // Observaciones / Notas
    observaciones: {
      type: String,
      trim: true,
      default: "",
    },

    // Fecha del gasto
    fechaGasto: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware Pre-save para calcular la suma de todos los gastos
gastoSchema.pre("save", function (next) {
  const terrestre = this.pasajes?.terrestre || 0;
  const aereo = this.pasajes?.aereo || 0;
  const maritimo = this.pasajes?.maritimo || 0;

  this.totalGasto =
    (this.costoPeriodo || 0) +
    (this.combustible || 0) +
    terrestre +
    aereo +
    maritimo +
    (this.alquilerTransporte || 0) +
    (this.hospedaje || 0);

  next();
});

export default model("Gasto", gastoSchema);