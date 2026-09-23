import Gasto from "../models/Gastos.js";

// @desc    Obtener todos los gastos
// @route   GET /api/gastos
export const getGastos = async (req, res) => {
  try {
    const gastos = await Gasto.find().sort({ createdAt: -1 });
    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los gastos", error: error.message });
  }
};

// @desc    Obtener un gasto por ID
// @route   GET /api/gastos/:id
export const getGastoById = async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await Gasto.findById(id);

    if (!gasto) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    res.status(200).json(gasto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el gasto", error: error.message });
  }
};

// @desc    Crear un nuevo gasto
// @route   POST /api/gastos
export const createGasto = async (req, res) => {
  try {
    const {
      tipoPeriodo,
      cantidadPeriodo,
      costoPeriodo,
      combustible,
      pasajes,
      alquilerTransporte,
      hospedaje,
      observaciones,
      fechaGasto,
    } = req.body;

    const nuevoGasto = new Gasto({
      tipoPeriodo: tipoPeriodo || "Dias",
      cantidadPeriodo: Number(cantidadPeriodo) || 0,
      costoPeriodo: Number(costoPeriodo) || 0,
      combustible: Number(combustible) || 0,
      pasajes: {
        terrestre: Number(pasajes?.terrestre) || 0,
        aereo: Number(pasajes?.aereo) || 0,
        maritimo: Number(pasajes?.maritimo) || 0,
      },
      alquilerTransporte: Number(alquilerTransporte) || 0,
      hospedaje: Number(hospedaje) || 0,
      observaciones: observaciones || "",
      fechaGasto: fechaGasto || new Date(),
    });

    const gastoGuardado = await nuevoGasto.save();
    res.status(201).json(gastoGuardado);
  } catch (error) {
    res.status(400).json({ message: "Error al registrar el gasto", error: error.message });
  }
};

// @desc    Actualizar un gasto
// @route   PUT /api/gastos/:id
export const updateGasto = async (req, res) => {
  try {
    const { id } = req.params;
    let gasto = await Gasto.findById(id);

    if (!gasto) {
      return res.status(404).json({ message: "Registro de gasto no encontrado" });
    }

    Object.assign(gasto, req.body);

    const gastoActualizado = await gasto.save();
    res.status(200).json(gastoActualizado);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el gasto", error: error.message });
  }
};

// @desc    Eliminar un gasto
// @route   DELETE /api/gastos/:id
export const deleteGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const gastoEliminado = await Gasto.findByIdAndDelete(id);

    if (!gastoEliminado) {
      return res.status(404).json({ message: "Registro de gasto no encontrado" });
    }

    res.status(200).json({ message: "Gasto eliminado correctamente", id });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el gasto", error: error.message });
  }
};